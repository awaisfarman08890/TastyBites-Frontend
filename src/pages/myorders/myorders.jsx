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
      
      // Get user email from multiple sources for matching
      let userEmail = localStorage.getItem("userEmail");
      let userId = localStorage.getItem("userId");
      
      // Decode token to get email and userId
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        
        // Get email from token
        const tokenEmail = decoded.email || decoded.userEmail || decoded.sub;
        if (tokenEmail && !userEmail) {
          userEmail = tokenEmail;
          localStorage.setItem("userEmail", userEmail);
        }
        
        // Get userId from token if not already set
        if (!userId) {
          userId = decoded.userId || decoded.id || decoded.user?.id || decoded.sub;
          if (userId) {
            localStorage.setItem("userId", userId);
          }
        }
      } catch (e) {
        console.log("Could not extract info from token:", e);
      }
      
      // If userId looks like an email, use it as email too (some backends store email as userId)
      if (userId && userId.includes('@')) {
        if (!userEmail) {
          userEmail = userId;
          localStorage.setItem("userEmail", userEmail);
        }
        // Also treat it as a potential email for matching
        console.log("UserId appears to be an email, using for matching:", userId);
      }
      
      // Final fallback: use the login email from the form if available
      if (!userEmail && userId && userId.includes('@')) {
        userEmail = userId;
      }
      
      console.log("=== FETCHING ORDERS ===");
      console.log("UserId:", userId);
      console.log("UserEmail:", userEmail);
      console.log("Token exists:", !!token);
      
      // Fetch ALL orders (same as admin does) - this definitely works
      const res = await axiosInstance.get(`/api/orders/all`);
      console.log("All orders response:", res);
      
      let allOrders = [];
      if (Array.isArray(res.data)) {
        allOrders = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        allOrders = res.data.data;
      }
      
      console.log(`Total orders from backend: ${allOrders.length}`);
      
      if (allOrders.length > 0) {
        console.log("Sample order structure:", JSON.stringify(allOrders[0], null, 2));
        console.log("All fields in first order:", Object.keys(allOrders[0]));
      }
      
      // Filter orders - Match by email from order (orders use email field from checkout form)
      // The order email comes from the checkout form, which might differ from login email
      const userOrders = allOrders.filter(order => {
        // Get email from order (this is what was entered in checkout form)
        const orderEmail = (order.email || order.userEmail || order.user?.email || '').trim().toLowerCase();
        
        // Normalize user email for comparison
        const normalizedUserEmail = (userEmail || '').toLowerCase().trim();
        
        // Match by email (case-insensitive, trimmed)
        // This matches orders placed with the logged-in user's email OR the email from checkout
        const emailMatch = normalizedUserEmail && orderEmail && orderEmail === normalizedUserEmail;
        
        // Also check if userId matches (if orders have userId field)
        const orderUserId = (order.userId || order.user?.id || order.user?._id || '').toString().trim();
        const normalizedUserId = (userId || '').toString().trim();
        const userIdMatch = normalizedUserId && orderUserId && orderUserId === normalizedUserId;
        
        return emailMatch || userIdMatch;
      });
      
      console.log(`=== RESULTS ===`);
      console.log(`Total orders: ${allOrders.length}`);
      console.log(`User orders: ${userOrders.length}`);
      
      if (userOrders.length === 0 && allOrders.length > 0) {
        console.error("⚠️ NO ORDERS MATCHED!");
        console.error("Your email:", userEmail);
        console.error("Sample order emails:", allOrders.slice(0, 5).map(o => o.email || o.userEmail));
        
        // Check if any orders have matching email (case variations)
        const possibleMatches = allOrders.filter(o => {
          const oEmail = (o.email || o.userEmail || '').toLowerCase();
          const uEmail = (userEmail || '').toLowerCase();
          return oEmail && uEmail && oEmail.includes(uEmail.split('@')[0]);
        });
        
        if (possibleMatches.length > 0) {
          console.log("Found potential matches with similar emails:", possibleMatches.map(o => o.email));
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [token]);

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
              {!localStorage.getItem("userId") 
                ? "Please log in to view your orders." 
                : `You haven't placed any orders yet, or orders were placed with a different email.`}
            </p>
            {localStorage.getItem("userEmail") && (
              <p className="text-muted small">
                Logged in as: <strong>{localStorage.getItem("userEmail")}</strong>
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
