import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import "./myorders.css";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!token) {
      console.log("No token available");
      return;
    }
    
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      console.log("Fetching orders with userId:", userId);
      console.log("Token available:", !!token);
      
      if (!userId) {
        console.error("Missing userId in localStorage; cannot fetch orders.");
        console.log("Available localStorage keys:", Object.keys(localStorage));
        setOrders([]);
        return;
      }
      
      // Try multiple API endpoints to find the correct one
      let res;
      try {
        // First try: userId query parameter
        res = await axios.get(
          `https://tasty-bities-backend-production.up.railway.app/api/orders?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("API Response (userId query):", res.data);
      } catch (err1) {
        console.log("First endpoint failed, trying alternative...");
        try {
          // Second try: user-specific endpoint
          res = await axios.get(
            `https://tasty-bities-backend-production.up.railway.app/api/orders/user/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("API Response (user endpoint):", res.data);
        } catch (err2) {
          // Third try: get all and filter client-side
          console.log("Trying to fetch all orders and filter...");
          res = await axios.get(
            `https://tasty-bities-backend-production.up.railway.app/api/orders/all`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("API Response (all orders):", res.data);
          
          // Filter orders by userId client-side
          if (Array.isArray(res.data)) {
            const userOrders = res.data.filter(order => 
              order.userId === userId || 
              order.user?.id === userId || 
              order.user?._id === userId ||
              order.userId?.toString() === userId ||
              order.user?.id?.toString() === userId
            );
            console.log("Filtered user orders:", userOrders);
            setOrders(userOrders);
            return;
          }
        }
      }
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data?.orders && Array.isArray(res.data.orders)) {
        data = res.data.orders;
      } else if (res.data?.result && Array.isArray(res.data.result)) {
        data = res.data.result;
      }
      
      console.log("Final orders data:", data);
      console.log("Number of orders:", data.length);
      
      if (data.length === 0) {
        console.warn("No orders found. This could mean:");
        console.warn("1. The user hasn't placed any orders");
        console.warn("2. The userId doesn't match the orders in the database");
        console.warn("3. The API endpoint is not returning user orders correctly");
      }
      
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMsg = err.response?.data?.message || err.message || "Failed to load orders";
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [token]);

  return (
    <div className="container">
      <div className="py-5 row justify-content-center">
        <h2 className="mb-4">My Orders</h2>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-tomato" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: "4rem" }}></i>
            <p className="mt-3 text-danger">Error loading orders</p>
            <p className="text-muted">{error}</p>
            <button 
              className="btn btn-tt mt-3" 
              onClick={fetchOrders}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
            <p className="mt-3">No orders found.</p>
            <p className="text-muted">
              {!localStorage.getItem("userId") 
                ? "Please log in to view your orders." 
                : "You haven't placed any orders yet."}
            </p>
            <button 
              className="btn btn-tt mt-3" 
              onClick={fetchOrders}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh Orders
            </button>
          </div>
        ) : (
          <table className="table table-responsive">
            <thead>
              <tr>
                <th>Image</th>
                <th>Amount</th>
                <th>Items & Address</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id ?? idx}>
                  <td>
                    <img src={assets.delivery} alt="Item" width={48} height={48} />
                  </td>
                  <td>${order.amount.toFixed(2)}</td>
                  <td>
                    <div className="fw-bold text-capitalize">
                      {order.orderItems.map((item, i) => (
                        <span key={i}>
                          {item.name} x {item.quantity}
                          {i !== order.orderItems.length - 1 && ", "}
                        </span>
                        
                      ))}
                  <td className="fw-normal text-capitalize">{order.userAddress}</td>
                    </div>
                  </td>
                  <td className="fw-bold">{order.orderStatus}</td>
                  <td className="fw-bold text-success">{order.paymentStatus}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-tt"
                      onClick={fetchOrders} // refresh orders
                    >
                      <i className="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
