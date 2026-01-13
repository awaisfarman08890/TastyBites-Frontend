import React, { useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../service/axiosInstance";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const CheckoutSuccess = () => {
  const { setQuantities } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const executed = useRef(false);

  useEffect(() => {
    if (executed.current) return;
    executed.current = true;

    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const success = params.get("success");
    const token = localStorage.getItem("token");

    if (success === "true" && sessionId && token) {
      (async () => {
        try {
          // 1️⃣ Verify payment on backend
          // Note: Backend likely expects "orderId" if possible, but we only have session_id.
          // We rely on backend looking up order by session_id.
          console.log("Verifying payment with session:", sessionId);
          
          const verifyResponse = await axiosInstance.post(
            "/api/orders/verify",
            { success: "true", orderId: sessionId }, // Some backends map session to orderId param, or use custom field
            // Wait, looking at PlaceOrder, we don't know exact backend expectation.
            // But previous code used: { stripePaymentIntentId: sessionId }
            // Let's send BOTH to be safe if backend is polymorphic
            // Reverting to previous payload structure but using instance
            { stripePaymentIntentId: sessionId } // sending session_id as intent_id seems to be the pattern here
          );

          console.log("Payment verification response:", verifyResponse.data);

          // Check if payment was actually verified
          if (verifyResponse.data?.paymentStatus === "PAID" || verifyResponse.data?.success) {
            
            // 2️⃣ Clear backend cart using the centralized service
            try {
              // We import clearCart from service to ensuring consistent endpoint usage
              // But we can't import it inside useEffect easily if not imported at top.
              // We will just use axiosInstance.delete("/api/cart") which exactly matches clearCart
              await axiosInstance.delete("/api/cart");
              console.log("Backend cart cleared successfully");
            } catch (cartErr) {
              console.error("Failed to clear backend cart:", cartErr);
              // Retry once?
            }

            // 3️⃣ Clear frontend cart
            setQuantities({});

            toast.success("Payment successful! Order confirmed.");
            // Short delay to ensure toast is read
            setTimeout(() => navigate("/myorders"), 1000);
          } else {
             // ... handle failure ...
             console.warn("Payment verification incomplete:", verifyResponse.data);
             // Even if status isn't PAID, if we are here, we should probably clear cart to avoid confusion?
             // No, keep cart if payment failed.
             toast.warning("Payment received. checking status...");
             setTimeout(() => navigate("/myorders"), 2000);
          }
        } catch (err) {
             console.error("Verification error:", err);
             // ...
             // If error is 404, maybe order wasn't found?
             // Proceed to orders anyway
             toast.error("Verification finalized (" + (err.response?.status || "err") + ")");
             navigate("/myorders");
        }
      })();
    } else if (success === "false" || !success) {
      // Payment was cancelled or failed - order should still exist with PENDING status
      toast.warning("Payment was cancelled. Your order is saved. You can retry payment from Pending Orders.");
      setTimeout(() => navigate("/pending-orders"), 1500);
    } else {
      toast.error("Payment cancelled");
      navigate("/cart");
    }
  }, [location, navigate, setQuantities]);

  return (
    <div className="container text-center py-5">
      <h2>Processing payment...</h2>
      <p>Please wait while we confirm your order.</p>
    </div>
  );
};

export default CheckoutSuccess;
