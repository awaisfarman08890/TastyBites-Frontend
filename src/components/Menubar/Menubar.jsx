import React, { useContext, useState, useEffect } from "react";
import "./Menubar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Menubar = () => {
  const [active, setActive] = useState("home");
  const { quantities, token, setToken, setQuantities } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const uniqueItems =
    quantities && Object.values(quantities).filter((q) => q > 0).length;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Keep active state in sync with current route (even on refresh or external nav)
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path.startsWith("/home")) setActive("home");
    else if (path.startsWith("/explore")) setActive("explore");
    else if (path.startsWith("/privacy-policy")) setActive("privacy");
    else if (path.startsWith("/contact")) setActive("contact");
    else if (path.startsWith("/about")) setActive("about");
    else setActive(""); // no highlight for other routes
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setQuantities({});
    navigate("/");
  };

  const goToExplore = () => navigate("/explore");

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container">

        {/* LOGO */}
        {loading ? (
          <div className="skeleton-box skeleton-logo"></div>
        ) : (
          <Link to="/">
            <img
              src={assets.logo}
              alt="logo"
              width={130}
              height={70}
              className="mx-2"
            />
          </Link>
        )}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">

          {/* NAV LINKS */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!loading && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === "home" ? "active fw-bold" : ""}`}
                    to="/"
                    onClick={() => setActive("home")}
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === "explore" ? "active fw-bold" : ""}`}
                    to="/explore"
                    onClick={() => setActive("explore")}
                  >
                    Explore
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === "privacy" ? "active fw-bold" : ""}`}
                    to="/privacy-policy"
                    onClick={() => setActive("privacy")}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === "contact" ? "active fw-bold" : ""}`}
                    to="/contact"
                    onClick={() => setActive("contact")}
                  >
                    Contact
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === "about" ? "active fw-bold" : ""}`}
                    to="/about"
                    onClick={() => setActive("about")}
                  >
                    About
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* RIGHT SIDE: SEARCH + CART + AUTH */}
          <div className="d-flex align-items-center gap-3">

            {!loading && (
              <>
                {/* SEARCH ICON */}
                <div className="search-icon" onClick={goToExplore} title="Explore">
                  <i className="bi bi-search"></i>
                </div>

                {/* CART ICON */}
                <Link to="/cart" className="position-relative cart-container">
                  <img src={assets.cart} width={28} height={28} alt="cart" />
                  <span className="cart-badge badge rounded-pill bg-warning">
                    {uniqueItems || 0}
                  </span>
                </Link>
              </>
            )}

            {/* AUTH BUTTONS */}
            {loading ? (
              <>
                <div className="skeleton-box skeleton-btn"></div>
                <div className="skeleton-box skeleton-btn"></div>
              </>
            ) : !token ? (
              <>
                <button
                  className="btn-custom btn-login"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </button>
                <button
                  className="btn-custom btn-register"
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
              </>
            ) : (
              <div className="dropdown">
                <button className="btn p-0 border-0 dropdown-toggle" data-bs-toggle="dropdown">
                  <img src={assets.profile} width={32} height={32} className="rounded-circle" alt="profile" />
                </button>
                <ul className="dropdown-menu dropdown-menu-start">
                  <li>
                    <button className="dropdown-item" onClick={() => navigate("/myorders")}>
                      Orders
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => navigate("/pending-orders")}>
                      Payment Status
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Menubar;
