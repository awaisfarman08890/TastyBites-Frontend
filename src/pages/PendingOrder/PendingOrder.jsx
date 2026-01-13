import { useEffect, useState, useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import {
  fetchPendingOrders,
  retryPayment,
} from "../../service/pendingService";
import { getUserIdFromToken } from "../../utils/tokenUtils";
import axiosInstance from "../../service/axiosInstance";

const PendingOrders = () => {
  const { token } = useContext(StoreContext);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingOrderId, setRetryingOrderId] = useState(null);

  useEffect(() => {
    const loadPendingOrders = async () => {
      const userId = getUserIdFromToken(token);
      if (!userId || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Try to fetch from pending orders endpoint first
        try {
          const data = await fetchPendingOrders(userId);
          // Handle different response formats
          const orders = Array.isArray(data) ? data : (data?.orders || data?.data || []);
          setPendingOrders(orders);
        } catch (pendingErr) {
          // Fallback: fetch all orders and filter by PENDING status
          console.log("Pending orders endpoint failed, fetching all orders:", pendingErr);
          
          const res = await axiosInstance.get("/api/orders/all", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          let allOrders = [];
          if (Array.isArray(res.data)) {
            allOrders = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            allOrders = res.data.data;
          }
          
          // Backported robust filtering from MyOrders
          const userIdString = userId ? String(userId).trim() : null;
          
          // Decode email from token for fallback filter
          const tokenParts = token ? token.split('.') : [];
          let userEmailVal = null;
          if (tokenParts.length > 1) {
             try {
                 const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
                 userEmailVal = payload.email || payload.sub || payload.userEmail;
                 if (userEmailVal && !userEmailVal.includes('@')) userEmailVal = null;
             } catch(e) {}
          }
          
          // Filter by userId/Email AND PENDING payment status
          const pendingOrders = allOrders.filter(order => {
            const orderUserId = order.userId || order.user?.id || order.user?._id || order.userId?.toString();
            const orderEmail = order.email || order.user?.email || order.userEmail;
            
            // Check status first
            const isPending = (order.paymentStatus || "").toUpperCase() === "PENDING";
            if (!isPending) return false;

            // 1. Match by ID 
            if (orderUserId && userIdString) {
                const oId = String(orderUserId).trim();
                const uId = String(userIdString).trim();
                if (oId === uId || oId.replace(/['"]/g, '') === uId.replace(/['"]/g, '')) return true;
            }

            // 2. Match by Email
            if (orderEmail && userEmailVal) {
                if (String(orderEmail).toLowerCase() === String(userEmailVal).toLowerCase()) return true;
            }

            return false;
          });
          
          setPendingOrders(pendingOrders);
        }
      } catch (error) {
        console.error("Failed to load pending orders:", error);
        toast.error("Failed to load pending orders");
        setPendingOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadPendingOrders();
  }, [token]);

  const handleRetryPayment = async (orderId) => {
    if (retryingOrderId) return; // Prevent multiple clicks
    
    try {
      setRetryingOrderId(orderId);
      const res = await retryPayment(orderId);
      
      console.log("Retry payment response:", res);
      
      // Handle different possible response formats (similar to checkout)
      const checkoutUrl = res?.url || 
                         res?.checkoutUrl || 
                         res?.sessionUrl ||
                         res?.checkout_session_url ||
                         res?.clientSecret; // Legacy support
      
      if (checkoutUrl) {
        // Check if it's a valid URL
        if (checkoutUrl.startsWith('http://') || checkoutUrl.startsWith('https://')) {
          // Valid URL - redirect to Stripe Checkout
          window.location.href = checkoutUrl;
          return;
        } else if (checkoutUrl.startsWith('cs_') || checkoutUrl.startsWith('pi_')) {
          // Stripe ID instead of URL
          toast.error("Invalid checkout URL format. Please contact support.");
          console.error("Received Stripe ID instead of URL:", checkoutUrl);
        } else {
          toast.error("Invalid checkout URL format received.");
          console.error("Unknown checkout URL format:", checkoutUrl);
        }
      } else {
        // No URL found
        console.error("No checkout URL in retry response:", res);
        toast.error("Unable to start payment retry. Please try again.");
      }
    } catch (error) {
      console.error("Payment retry error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          "Payment retry failed";
      toast.error(`Payment retry failed: ${errorMessage}`);
    } finally {
      setRetryingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h2 className="mb-4">Pending Payments</h2>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "tomato" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading pending payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Pending Payments</h2>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
          <p className="mt-3">No pending payments found.</p>
          <p className="text-muted">All your orders have been paid successfully.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Items</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                  </td>
                  <td>
                    <strong style={{ color: "tomato" }}>${order.amount?.toFixed(2) || "0.00"}</strong>
                  </td>
                  <td>
                    {order.orderItems && order.orderItems.length > 0 ? (
                      order.orderItems.map((item, i) => (
                        <span key={i}>
                          {item.name} x {item.quantity}
                          {i !== order.orderItems.length - 1 && ", "}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">No items</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-warning text-dark">
                      {order.paymentStatus || "PENDING"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-tt"
                      onClick={() => handleRetryPayment(order.id)}
                      disabled={retryingOrderId === order.id}
                    >
                      {retryingOrderId === order.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Retry Payment
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
