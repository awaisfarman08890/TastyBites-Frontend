import React from "react";
import { Link } from "react-router-dom";
import { assets, categories } from "../../assets/assets";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Top Section */}
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <img src={assets.logo} alt="Tasty Bites" />
            <p>
              Discover the best food & drinks delivered to your doorstep. Fresh
              taste, fast delivery.
            </p>
          </div>

          {/* Links */}
          <div className="footer-links">
            <h6>Quick Links</h6>
            <Link to="/">Home</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/myorders">My Orders</Link>
          </div>

          {/* Categories */}
          <div className="footer-categories">
            <h6>Categories</h6>
            <div className="category-grid">
              {categories.map((item, index) => (
                <Link
                  key={index}
                  to={`/explore?category=${item.category}`}
                  className="category-item"
                >
                  <img src={item.icon} alt={item.category} />
                  <span>{item.category}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h6>Contact</h6>
            <p>📍 Texas, United States</p>
            <p>📞 +1 (768) 784-5567</p>
            <p>✉ support@Tasty Bites.com</p>
            <p>Owner</p>
            <p>✉ awaisfarman2222@gmail.com</p>
          </div>
        </div>

        {/* Divider */}
        <hr />

        {/* Bottom */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Tasty Bites. All rights reserved.
          </p>

        <div className="social-icons">
          <a href="https://www.linkedin.com/in/awaisfarman/" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-linkedin"></i>
          </a>
          <a href="mailto:awaisfarman2222@gmail.com">
            <i className="bi bi-envelope"></i>
          </a>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
