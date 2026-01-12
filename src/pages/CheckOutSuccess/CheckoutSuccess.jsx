import React, { useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
          // 1️⃣ Verify payment on backend and update order status
          const verifyResponse = await axios.post(
            "https://tasty-bities-backend-production.up.railway.app/api/orders/verify",
            { stripePaymentIntentId: sessionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log("Payment verification response:", verifyResponse.data);

          // Check if payment was actually verified
          if (verifyResponse.data?.paymentStatus === "PAID" || verifyResponse.data?.success) {
            // 2️⃣ Clear backend cart
            try {
              await axios.delete("https://tasty-bities-backend-production.up.railway.app/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
              });
            } catch (cartErr) {
              console.error("Failed to clear backend cart:", cartErr);
            }

            // 3️⃣ Clear frontend cart
            setQuantities({});

            toast.success("Payment successful! Order confirmed.");
            setTimeout(() => navigate("/myorders"), 1500);
          } else {
            // Payment verification didn't update status
            console.warn("Payment verification response:", verifyResponse.data);
            toast.warning("Payment received but order status may still be updating. Please check your orders.");
            setQuantities({});
            setTimeout(() => navigate("/myorders"), 2000);
          }
        } catch (err) {
          console.error("Payment verification failed:", err);
          console.error("Error details:", err.response?.data);
          
          // Even if verification fails, clear frontend cart to prevent stale items
          setQuantities({});
          
          // Check if it's a network error vs payment error
          if (err.response?.status === 404 || err.response?.status === 400) {
            toast.error("Order verification failed. Please contact support with your order details.");
          } else {
            toast.error("Payment verification failed. Your order may still be processing. Please check your orders.");
          }
          
          setTimeout(() => navigate("/myorders"), 2000);
        }
      })();
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
