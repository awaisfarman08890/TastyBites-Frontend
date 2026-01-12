import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ErrorPage.css';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const errorType = params.get("type");

  const getErrorContent = () => {
    switch (errorType) {
      case "checkout":
        return {
          icon: "bi-credit-card-2-front",
          title: "Checkout Error",
          message: "We encountered an issue processing your payment. Please try again or contact support.",
          code: "500"
        };
      case "payment":
        return {
          icon: "bi-x-circle-fill",
          title: "Payment Failed",
          message: "Your payment could not be processed. Please check your payment details and try again.",
          code: "402"
        };
      case "network":
        return {
          icon: "bi-wifi-off",
          title: "Connection Error",
          message: "Unable to connect to the server. Please check your internet connection and try again.",
          code: "503"
        };
      default:
        return {
          icon: "bi-exclamation-triangle-fill",
          title: "Page Not Found",
          message: "The page you are looking for doesn't exist or has been moved.",
          code: "404"
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="error-page-container">
      <div className="error-content">
        <i
          className={`bi ${errorContent.icon} error-icon`}
        ></i>
        <h1 className="error-code">{errorContent.code}</h1>
        <h2 className="error-title">{errorContent.title}</h2>
        <p className="error-message">{errorContent.message}</p>
        <div className="error-actions">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-error-secondary"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn btn-error-primary"
          >
            <i className="bi bi-house-fill me-2"></i>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
