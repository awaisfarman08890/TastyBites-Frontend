import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import "./myorders.css";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("Missing userId in localStorage; cannot fetch orders.");
        setOrders([]);
        return;
      }
      const res = await axios.get(`https://tasty-bities-backend-production.up.railway.app/api/orders?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend can return array or wrapped data; include all orders (do not over-filter)
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
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
        <h2 className="mb-4">My Orders (Paid)</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
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
