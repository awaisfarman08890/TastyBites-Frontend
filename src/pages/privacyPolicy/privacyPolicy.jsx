import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-wrapper">
      <div className="privacy-card">
        <h1 className="title">Privacy Policy</h1>

        <p>
          At <strong>Tasty Bites</strong>, we respect and value your privacy. This Privacy Policy explains
          how we collect, use, and protect your personal information when you use our website and services.
          By accessing or using our platform, you agree to the terms described in this policy.
        </p>

        <p>
          We only collect information that is necessary to provide you with a smooth and enjoyable food
          ordering experience, such as your email address 
          (<a href="mailto:awaisfarman2222@gmail.com"> awaisfarman2222@gmail.com</a>) and order-related details.
        </p>

        <h2 className="subtitle">Information We Collect</h2>
        <ul className="info-list">
          <li>Email address and basic contact details</li>
          <li>Order history and food preferences</li>
          <li>Basic usage data to improve website performance</li>
        </ul>

        <h2 className="subtitle">How We Use Your Information</h2>
        <ul className="info-list">
          <li>To process and deliver your food orders efficiently</li>
          <li>To communicate order updates, confirmations, and support messages</li>
          <li>To send promotional offers and special deals (optional)</li>
          <li>To enhance user experience and improve our services</li>
        </ul>

        <h2 className="subtitle">Data Protection & Security</h2>
        <p>
          We take appropriate security measures to protect your personal information from unauthorized
          access, alteration, or disclosure. Your data is stored securely, and we never sell, trade, or
          share your personal information with third parties.
        </p>

        <h2 className="subtitle">Third-Party Services</h2>
        <p>
          In some cases, we may use trusted third-party services (such as payment gateways) to complete
          transactions. These services have their own privacy policies, and we encourage you to review them.
        </p>

        <h2 className="subtitle">Contact Us</h2>
        <p>
          If you have any questions, concerns, or feedback regarding this Privacy Policy, feel free to
          contact us at 
          <a href="mailto:awaisfarman2222@gmail.com"> awaisfarman2222@gmail.com</a>.
        </p>

        <div className="button-wrapper">
          <button className="contact-button" onClick={() => navigate('/contact')}>
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
