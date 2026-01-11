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
          // 1️⃣ Verify payment on backend
          await axios.post(
            "https://tasty-bities-backend-production.up.railway.app/api/orders/verify",
            { stripePaymentIntentId: sessionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

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
        } catch (err) {
          console.error("Payment verification failed:", err);
          // Even if verification fails, clear frontend cart to prevent stale items
          setQuantities({});
          toast.error(
            "Payment verification failed. Cart cleared locally. Check orders."
          );
          setTimeout(() => navigate("/myorders"), 1500);
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
