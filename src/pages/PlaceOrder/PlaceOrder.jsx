import React, { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../cartUtils/cartUtils";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const PlaceOrder = () => {
  const { foodList, quantities, token } = useContext(StoreContext);
  const cartItems = foodList.filter((f) => quantities[f.id] > 0);
  const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    country: "United States",
    zip: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const orderData = {
      userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map((item) => ({
        foodId: item.id,
        quantity: quantities[item.id],
        price: item.price,
        name: item.name,
        description: item.description,
        category: item.category,
        imageUrl: item.imageUrl,
      })),
      amount: Number(total.toFixed(2)),
      orderStatus: "Preparing",
    };

    try {
      const res = await axios.post(
        "https://tasty-bities-backend-production.up.railway.app/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.clientSecret) {
        window.location.assign(res.data.clientSecret);
      } else {
        toast.error("Unable to start checkout");
      }
    } catch (err) {
      console.error("Order create error:", err);
      toast.error("Failed to place order");
    }
  };

  return (
    <div className="container mt-3">
      {/* Logo */}
      <div className="py-5 text-center">
        {loading ? <div className="skeleton skeleton-logo"></div> : <img src={assets.logo} alt="Logo" width={180}/>}
      </div>

      <div className="row g-5 flex-column-reverse flex-md-row">
        {/* Billing form */}
        <div className="col-md-7 col-lg-8">
          {loading ? (
            <div className="skeleton-form">
              {Array(10).fill(0).map((_, i) => <div key={i} className="skeleton skeleton-input"></div>)}
              <div className="skeleton skeleton-button"></div>
            </div>
          ) : (
            <>
              <h4 className="mb-3">Billing address</h4>
              <form onSubmit={onSubmitHandler}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      className="form-control"
                      name="firstName"
                      value={data.firstName}
                      onChange={onChangeHandler}
                      maxLength={20}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-control"
                      name="lastName"
                      value={data.lastName}
                      onChange={onChangeHandler}
                      maxLength={20}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={onChangeHandler}
                    maxLength={60}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phoneNumber"
                    value={data.phoneNumber}
                    onChange={onChangeHandler}
                    maxLength={14}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    name="address"
                    value={data.address}
                    onChange={onChangeHandler}
                    required
                  />
                </div>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <label className="form-label">Country</label>
                    <select
                      className="form-select"
                      name="country"
                      value={data.country}
                      onChange={onChangeHandler}
                    >
                      <option value="United States">United States</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">State</label>
                    <select
                      className="form-select"
                      name="state"
                      value={data.state}
                      onChange={onChangeHandler}
                      required
                    >
                      <option value="">Select State</option>
                      {US_STATES.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Zip</label>
                    <input
                      className="form-control"
                      name="zip"
                      value={data.zip}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-tt w-100 mb-5"
                  disabled={cartItems.length === 0}
                >
                  Continue to checkout
                </button>
              </form>
            </>
          )}
        </div>

        {/* Cart summary */}
        <div className="col-md-5 col-lg-4 order-md-last">
          {loading ? (
            <div>
              <div className="skeleton skeleton-badge"></div>
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="skeleton skeleton-cart-item"></div>
              ))}
            </div>
          ) : (
            <>
              <h4 className="mb-3 d-flex justify-content-between align-items-center">
                Your cart
                <span className="badge btn-tt rounded-pill">{cartItems.length}</span>
              </h4>
              <ul className="list-group mb-3">
                {cartItems.map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex justify-content-between flex-column flex-sm-row"
                  >
                    <div>
                      <h6 className="my-0">{item.name}</h6>
                      <small>Qty: {quantities[item.id]}</small>
                    </div>
                    <span className="mt-2 mt-sm-0">${(item.price * quantities[item.id]).toFixed(2)}</span>
                  </li>
                ))}

                <li className="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                  <strong>Total</strong>
                  <strong>${total.toFixed(2)}</strong>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
