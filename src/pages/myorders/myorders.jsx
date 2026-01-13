import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import axiosInstance from "../../service/axiosInstance";
import { assets } from "../../assets/assets";
import { getUserIdFromToken } from "../../utils/tokenUtils";
import "./myorders.css";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Extract userId from token immediately for use in render and fetch
  const userId = token ? getUserIdFromToken(token) : null;

  const fetchOrders = async () => {
    if (!token) {
      console.log("No token available");
      setError("Please log in to view your orders");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const userIdString = userId ? String(userId) : null;
      
      if (!userIdString) {
        console.error("No userId found in token");
        setError("Unable to identify user. Please log in again.");
        setLoading(false);
        return;
      }
      
      console.log("=== FETCHING ORDERS ===");
      console.log("UserId:", userIdString);
      
      let fetchedOrders = [];
      let isUserSpecificEndpoint = false;
      
      // Try to fetch user-specific orders first (if endpoint exists)
      try {
        const userRes = await axiosInstance.get(`/api/orders/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(userRes.data)) {
          fetchedOrders = userRes.data;
        } else if (userRes.data?.data && Array.isArray(userRes.data.data)) {
          fetchedOrders = userRes.data.data;
        }
        isUserSpecificEndpoint = true;
        console.log("User-specific orders fetched:", fetchedOrders.length);
      } catch (userErr) {
        console.log("User-specific endpoint not available, fetching all orders:", userErr.response?.status);
        // Fallback to fetching all orders
        const res = await axiosInstance.get(`/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          fetchedOrders = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          fetchedOrders = res.data.data;
        }
      }
      
      console.log(`Total orders from backend: ${fetchedOrders.length}`);
      
      // Filter logic
      let finalOrders = fetchedOrders;

      // If we used the fallback endpoint (ALL orders), we MUST filter by userId
      // If we used the user-specific endpoint, we usually trust it, BUT 
      // sometimes backend might return all if endpoints are mixed up, so safe to filter if we are unsure.
      // However, if logic is correct, /orders/user should return only user orders.
      // Let's filter ONLY if we went to fallback OR if we suspect leakage.
      // To be safe and compliant with user request "Propely identify the user", we will filter if we fetched 'all'.
      
      if (!isUserSpecificEndpoint) {
          finalOrders = fetchedOrders.filter(order => {
            const orderUserId = order.userId || 
                               order.user?.id || 
                               order.user?._id ||
                               order.userId?.toString() ||
                               String(order.userId || '').trim();
            
            const normalizedUserId = String(userIdString).trim();
            
            let userIdMatch = false;
            if (normalizedUserId && orderUserId) {
              const orderUserIdStr = String(orderUserId).trim();
              userIdMatch = orderUserIdStr === normalizedUserId || 
                           orderUserIdStr.replace(/['"]/g, '') === normalizedUserId.replace(/['"]/g, '');
            }
            return userIdMatch;
          });
      }
      
      console.log(`User orders after filter: ${finalOrders.length}`);
      setOrders(finalOrders);

    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load orders";
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, location.key]); // Refresh when token changes or when navigating to this page

  return (
    <div className="container">
      <div className="py-5 row justify-content-center">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">My Orders</h2>
          <button 
            className="btn btn-sm btn-tt" 
            onClick={fetchOrders}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''} me-2`}></i>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
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
              {!userId 
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
                  <td>${order.amount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <div className="fw-bold text-capitalize">
                      {(order.orderItems || order.orderedItems || []).map((item, i) => (
                        <span key={i}>
                          {item.name} x {item.quantity}
                          {i !== (order.orderItems || order.orderedItems || []).length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                    <div className="fw-normal text-capitalize mt-2">
                      {order.userAddress || 'N/A'}
                    </div>
                  </td>
                  <td className="fw-bold">{order.orderStatus}</td>
                  <td>
                    <span className={`badge ${
                      order.paymentStatus === "PAID" ? "bg-success" :
                      order.paymentStatus === "PENDING" ? "bg-warning text-dark" :
                      "bg-secondary"
                    }`}>
                      {order.paymentStatus || "UNKNOWN"}
                    </span>
                  </td>
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
