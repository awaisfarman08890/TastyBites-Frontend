import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axiosInstance from "../../service/axiosInstance";
import { assets } from "../../assets/assets";
import { getUserIdFromToken } from "../../utils/tokenUtils";
import { toast } from "react-toastify";
import "./myorders.css";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract userId from token immediately
  const userId = token ? getUserIdFromToken(token) : null;

  const fetchOrders = async () => {
    if (!token) {
      setError("Please log in to view your orders");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const userIdString = userId ? String(userId).trim() : null;
      
      if (!userIdString) {
        console.warn("STRICT MODE: No valid non-email userId string found, but token exists. Attempting generic fetch.");
        // We will try to fetch user specific endpoint, maybe it works without ID
      }
      
      // Fetch all orders
      const res = await axiosInstance.get(`/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` }
      });

      let allOrders = [];
      if (Array.isArray(res.data)) {
        allOrders = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        allOrders = res.data.data;
      }

      // STRICT Filtering: Match by userId OR email (to be safe against backend data inconsistencies)
      const userEmail = getUserIdFromToken(token) ? null : String(token).includes('@') ? null : null; // We can't easily get email here without util call, but we have userId from token.
      
      // Let's rely on the tokenUtils to get email if available, we need to import it properly or decode it.
      // But we already have userIdString. 
      // The goal is: if backend saved order with email as ID, and we have that email, show it.
      
      // Let's decode email from token again for the filter
      const tokenParts = token ? token.split('.') : [];
      let userEmailVal = null;
      if (tokenParts.length > 1) {
         try {
             const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
             userEmailVal = payload.email || payload.sub || payload.userEmail;
             if (userEmailVal && !userEmailVal.includes('@')) userEmailVal = null; // if sub is not email
         } catch(e) {}
      }

      console.log("Filtering orders for UserID:", userIdString, "or Email:", userEmailVal);

      // Ultra-robust Filtering:
      const userOrders = allOrders.filter(order => {
        // Get all possible identifiers from order
        const orderUserId = order.userId || order.user?.id || order.user?._id || order.userId?.toString();
        const orderEmail = order.email || order.user?.email || order.userEmail;
        
        // 1. Match by ID (Strict or Loose)
        if (orderUserId && userIdString) {
             const oId = String(orderUserId).trim();
             const uId = String(userIdString).trim();
             if (oId === uId || oId.replace(/['"]/g, '') === uId.replace(/['"]/g, '')) return true;
        }

        // 2. Match by Email
        if (orderEmail && userEmailVal) {
             if (String(orderEmail).toLowerCase() === String(userEmailVal).toLowerCase()) return true;
        }

        // 3. Last Resort: If the order was just created in this session, we might not have ID sync yet.
        // But if they are logged in, they should match.
        
        // 3. EXCLUDE PENDING ORDERS
        // User requested that "Retry Payment" orders (Pending) should NOT appear here, but only in PendingOrders page.
        if ((order.paymentStatus || "").toUpperCase() === "PENDING") return false;
        
        return false;
      });
      
      console.log("Matched orders:", userOrders.length);
      
      // Sort by date (newest first) if createdAt exists
      userOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      setOrders(userOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load orders";
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (orderId) => {
      try {
          const res = await axiosInstance.post('/api/orders/retry-payment', { orderId }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data?.url) {
              window.location.href = res.data.url;
          } else {
              toast.error("Unable to retry payment. Please try placing a new order.");
          }
      } catch (err) {
          console.error("Retry payment error:", err);
          toast.error("Failed to initiate payment retry.");
      }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, location.key]);

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
                      onClick={fetchOrders}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
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
