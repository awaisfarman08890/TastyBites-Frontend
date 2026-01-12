import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import axiosInstance from "../../service/axiosInstance";
import { assets } from "../../assets/assets";
import { getUserIdFromToken, getUserEmailFromToken } from "../../utils/tokenUtils";
import "./myorders.css";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchOrders = async () => {
    if (!token) {
      console.log("No token available");
      setError("Please log in to view your orders");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Extract userId and email from token
      let userId = getUserIdFromToken(token);
      let userEmail = getUserEmailFromToken(token);
      
      // Ensure userId is a string to match database format
      if (userId) {
        userId = String(userId);
      }
      
      // If userId looks like an email, use it as email too (some backends store email as userId)
      if (userId && userId.includes('@') && !userEmail) {
        userEmail = userId;
        console.log("UserId appears to be an email, using for matching:", userId);
      }
      
      console.log("=== FETCHING ORDERS ===");
      console.log("UserId:", userId);
      console.log("UserEmail:", userEmail);
      console.log("Token exists:", !!token);
      
      let allOrders = [];
      
      // Try to fetch user-specific orders first (if endpoint exists)
      try {
        const userRes = await axiosInstance.get(`/api/orders/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(userRes.data)) {
          allOrders = userRes.data;
        } else if (userRes.data?.data && Array.isArray(userRes.data.data)) {
          allOrders = userRes.data.data;
        }
        console.log("User-specific orders fetched:", allOrders.length);
      } catch (userErr) {
        console.log("User-specific endpoint not available, fetching all orders:", userErr.response?.status);
        // Fallback to fetching all orders
        const res = await axiosInstance.get(`/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          allOrders = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          allOrders = res.data.data;
        }
      }
      
      console.log(`Total orders from backend: ${allOrders.length}`);
      
      if (allOrders.length > 0) {
        console.log("Sample order structure:", JSON.stringify(allOrders[0], null, 2));
        console.log("All fields in first order:", Object.keys(allOrders[0]));
      }
      
      // Filter orders - PRIORITY: Match by userId first (from JWT token), then email as fallback
      // Show ALL orders for the user (PENDING, PAID, CREATED, etc.) - don't filter by paymentStatus
      const userOrders = allOrders.filter(order => {
        // Get userId from order (primary identifier - backend stores as string ObjectId)
        const orderUserId = order.userId || 
                           order.user?.id || 
                           order.user?._id ||
                           order.userId?.toString() ||
                           String(order.userId || '').trim();
        
        // Get email from order (fallback identifier - from checkout form)
        const orderEmail = (order.email || order.userEmail || order.user?.email || '').trim().toLowerCase();
        
        // Normalize our identifiers - handle both string and ObjectId formats
        const normalizedUserId = userId ? String(userId).trim() : '';
        const normalizedUserEmail = userEmail ? String(userEmail).toLowerCase().trim() : '';
        
        // PRIMARY: Match by userId (exact string match - backend stores as string ObjectId)
        let userIdMatch = false;
        if (normalizedUserId && orderUserId) {
          const orderUserIdStr = String(orderUserId).trim();
          const ourUserIdStr = normalizedUserId;
          userIdMatch = orderUserIdStr === ourUserIdStr || 
                       orderUserIdStr.replace(/['"]/g, '') === ourUserIdStr.replace(/['"]/g, '');
        }
        
        // SECONDARY: Match by email (fallback if userId not available or doesn't match)
        const emailMatch = normalizedUserEmail && orderEmail && 
                          orderEmail === normalizedUserEmail;
        
        const isMatch = userIdMatch || emailMatch;
        
        // Log matches for debugging
        if (isMatch) {
          console.log("✅ MATCHED ORDER:", {
            orderId: order.id || order._id,
            orderUserId,
            ourUserId: normalizedUserId,
            userIdMatch,
            orderEmail,
            ourEmail: normalizedUserEmail,
            emailMatch,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus
          });
        }
        
        return isMatch;
      });
      
      console.log(`=== RESULTS ===`);
      console.log(`Total orders: ${allOrders.length}`);
      console.log(`User orders: ${userOrders.length}`);
      
      if (userOrders.length === 0 && allOrders.length > 0) {
        console.error("⚠️ NO ORDERS MATCHED!");
        console.error("Your userId:", userId);
        console.error("Your email:", userEmail);
        console.error("Sample order userIds:", allOrders.slice(0, 5).map(o => o.userId || o.user?.id || o.user?._id || "N/A"));
        console.error("Sample order emails:", allOrders.slice(0, 5).map(o => o.email || o.userEmail || "N/A"));
        
        // Show first order structure for debugging
        if (allOrders[0]) {
          console.error("First order full structure:", JSON.stringify(allOrders[0], null, 2));
        }
      }
      
      setOrders(userOrders);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
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
                : `You haven't placed any orders yet, or orders were placed with a different email.`}
            </p>
            {userEmail && (
              <p className="text-muted small">
                Logged in as: <strong>{userEmail}</strong>
                <br />
                Orders are matched by the email used during checkout.
              </p>
            )}
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
