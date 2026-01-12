import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import axiosInstance from "../../service/axiosInstance";
import { assets } from "../../assets/assets";
import "./myorders.css";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to extract userId from JWT token
  const getUserIdFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      return decoded.userId || decoded.id || decoded.user?.id || decoded.sub;
    } catch (e) {
      console.error("Error decoding token:", e);
      return null;
    }
  };

  const fetchOrders = async () => {
    if (!token) {
      console.log("No token available");
      setError("Please log in to view your orders");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get userId from localStorage or decode from token
      let userId = localStorage.getItem("userId");
      if (!userId) {
        userId = getUserIdFromToken(token);
        if (userId) {
          localStorage.setItem("userId", userId);
          console.log("Extracted userId from token:", userId);
        }
      }
      
      console.log("Fetching orders with token...");
      console.log("UserId:", userId);
      
      // The backend likely extracts user from JWT token, so try token-based endpoints first
      let res;
      let data = [];
      
      try {
        // First try: Token-based endpoint (backend extracts user from token)
        // Use axiosInstance which automatically includes the token
        res = await axiosInstance.get(`/api/orders`);
        console.log("API Response (token-based):", res.data);
        
        // Handle response
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res.data?.orders && Array.isArray(res.data.orders)) {
          data = res.data.orders;
        }
        
        if (data.length > 0) {
          console.log("Successfully fetched orders via token:", data.length);
          setOrders(data);
          return;
        }
      } catch (err1) {
        console.log("Token-based endpoint failed, trying alternatives...", err1.response?.status);
      }
      
      // Second try: Get all orders and filter by userId from token
      try {
        const userId = localStorage.getItem("userId");
        console.log("Trying to fetch all orders and filter by userId:", userId);
        
        res = await axiosInstance.get(`/api/orders/all`);
        console.log("All orders response:", res.data);
        
        if (Array.isArray(res.data)) {
          console.log("Total orders from backend:", res.data.length);
          console.log("Sample order structure:", res.data[0]);
          
          // Filter orders - check multiple possible userId fields
          const userOrders = res.data.filter(order => {
            if (!userId) {
              console.log("No userId available for filtering");
              return false;
            }
            
            // Check various userId field formats
            const orderUserId = order.userId || 
                               order.userId?.toString() ||
                               order.user?.id || 
                               order.user?._id ||
                               order.user?.id?.toString() ||
                               order.user?._id?.toString();
            
            // Also check email if userId doesn't match
            const userEmail = localStorage.getItem("userEmail");
            const orderEmail = order.email || order.user?.email;
            
            const userIdMatch = orderUserId && orderUserId.toString() === userId.toString();
            const emailMatch = userEmail && orderEmail && orderEmail.toLowerCase() === userEmail.toLowerCase();
            
            if (userIdMatch || emailMatch) {
              console.log("Matched order:", order.id, {
                orderUserId,
                userId,
                userIdMatch,
                orderEmail,
                userEmail,
                emailMatch
              });
              return true;
            }
            
            return false;
          });
          
          console.log(`Filtered ${userOrders.length} orders from ${res.data.length} total orders`);
          
          if (userOrders.length === 0 && res.data.length > 0) {
            console.warn("No orders matched! Sample order fields:", {
              firstOrder: res.data[0],
              userId: userId,
              availableFields: Object.keys(res.data[0] || {})
            });
          }
          
          setOrders(userOrders);
          return;
        }
      } catch (err2) {
        console.log("Fetching all orders failed:", err2.response?.status);
      }
      
      // Third try: userId query parameter (fallback)
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          console.log("Trying userId query parameter:", userId);
          res = await axiosInstance.get(`/api/orders?userId=${userId}`);
          console.log("API Response (userId query):", res.data);
          
          if (Array.isArray(res.data)) {
            data = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            data = res.data.data;
          }
        }
      } catch (err3) {
        console.log("UserId query parameter failed:", err3.response?.status);
      }
      
      console.log("Final orders data:", data);
      console.log("Number of orders:", data.length);
      
      if (data.length === 0) {
        console.warn("No orders found after trying all methods");
        console.warn("Available localStorage userId:", localStorage.getItem("userId"));
        console.warn("Token exists:", !!token);
      }
      
      setOrders(data);
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
