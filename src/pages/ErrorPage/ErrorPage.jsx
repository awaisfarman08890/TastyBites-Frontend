import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ErrorPage = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{
        minHeight: "80vh",       // Mobile-friendly height
        padding: "2rem",         // Mobile padding
        backgroundColor: "#fff"
      }}
    >
      <i
        className="bi bi-exclamation-triangle-fill mb-3"
        style={{
          fontSize: "6rem",       // Large icon
          color: "tomato",
        }}
      ></i>
      <h1
        className="mb-2"
        style={{
          color: "tomato",
          fontWeight: "700",
          fontSize: "3rem",
        }}
      >
        404
      </h1>
      <h3 className="mb-3" style={{ fontSize: "1.5rem" }}>
        Oops! Page Not Found
      </h3>
      <p className="mb-4" style={{ fontSize: "1rem", maxWidth: "300px" }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="btn btn-tt "
        style={{ padding: "0.5rem 1.5rem", fontSize: "1rem", textDecoration: "none" }}
      >
        Go Back to Tasty Bites Home
      </a>
    </div>
  );
};

export default ErrorPage;
