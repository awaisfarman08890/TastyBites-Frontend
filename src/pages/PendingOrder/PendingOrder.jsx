import { useEffect, useState, useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import {
  fetchPendingOrders,
  retryPayment,
} from "../../service/pendingService"; // 🔥 IMPORTANT

const PendingOrders = () => {
  const { token } = useContext(StoreContext);
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId || !token) return;

    fetchPendingOrders(userId)
      .then((data) => setPendingOrders(data))
      .catch(() => toast.error("Failed to load pending orders"));
  }, [token]);

  const handleRetryPayment = (orderId) => {
    retryPayment(orderId)
      .then((res) => {
        if (res?.clientSecret) {
          window.location.assign(res.clientSecret);
        } else {
          toast.error("Payment retry failed");
        }
      })
      .catch(() => toast.error("Payment retry failed"));
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Pending Payments</h2>

      {pendingOrders.length === 0 ? (
        <p>No pending payments found.</p>
      ) : (
        <table className="table">
          <thead>
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
                <td>{order.id}</td>
                <td>${order.amount.toFixed(2)}</td>
                <td>
                  {order.orderItems.map((item, i) => (
                    <span key={i}>
                      {item.name} x {item.quantity}
                      {i !== order.orderItems.length - 1 && ", "}
                    </span>
                  ))}
                </td>
                <td className="text-warning">{order.paymentStatus}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleRetryPayment(order.id)}
                  >
                    Retry Payment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingOrders;
