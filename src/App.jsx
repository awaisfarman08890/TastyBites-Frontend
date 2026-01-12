import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
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

// Protected Route component that checks both context and localStorage
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(StoreContext);
  // Check both context token and localStorage as fallback
  const isAuthenticated = token || localStorage.getItem("token");
  
  if (!isAuthenticated) {
    // Save the current location so we can redirect back after login
    const currentPath = window.location.pathname;
    if (currentPath !== "/login") {
      sessionStorage.setItem("redirectAfterLogin", currentPath);
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route component that redirects to home if already logged in
const PublicRoute = ({ children }) => {
  const { token } = useContext(StoreContext);
  // Check both context token and localStorage as fallback
  const isAuthenticated = token || localStorage.getItem("token");
  
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const App = () => {
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
            element={
              <ProtectedRoute>
                <PlaceOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/myorders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pending-orders"
            element={
              <ProtectedRoute>
                <PendingOrders />
              </ProtectedRoute>
            }
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
