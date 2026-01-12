import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Menubar from "./components/Menubar/Menubar";
import Footer from "./pages/Footer/Footer";

// Pages
import Home from "./pages/Home/Home";
import Explore from "./pages/ExploreFood/ExploreFoods";
import Contact from "./pages/Contact/Contact";
import FoodDetails from "./pages/FoodDetails/FoodDetails";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import CheckoutSuccess from "./pages/CheckOutSuccess/CheckoutSuccess";
import MyOrders from "./pages/myorders/myorders";
import PendingOrders from "./pages/PendingOrder/PendingOrder";
import PrivacyPolicy from "./pages/privacyPolicy/privacyPolicy";
import AboutUs from "./pages/Aboutus/AboutUs";
import ErrorPage from "./pages/ErrorPage/ErrorPage";

// Auth
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

// Context
import { StoreContext } from "./context/StoreContext";

import "./App.css";

const App = () => {
  const { token } = useContext(StoreContext);

  return (
    <div className="page-container">
      <Menubar />
      <ToastContainer />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/food/:id" element={<FoodDetails />} />
          <Route path="/cart" element={<Cart />} />

          <Route
            path="/order"
            element={token ? <PlaceOrder /> : <Login />}
          />

          <Route
            path="/login"
            element={token ? <Home /> : <Login />}
          />

          <Route
            path="/register"
            element={token ? <Home /> : <Register />}
          />

          <Route
            path="/myorders"
            element={token ? <MyOrders /> : <Login />}
          />

          <Route
            path="/pending-orders"
            element={token ? <PendingOrders /> : <Login />}
          />

          <Route
            path="/checkout-success"
            element={<CheckoutSuccess />}
          />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Error page */}
          <Route path="/error" element={<ErrorPage />} />

          {/* 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
