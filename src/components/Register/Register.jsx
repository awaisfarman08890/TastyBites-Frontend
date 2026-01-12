import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import illustration from "../../assets/signup/1.png";
import logo from "../../assets/logo.png";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(StoreContext);

  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Register user
      const response = await axios.post(
        "https://tasty-bities-backend-production.up.railway.app/api/auth/register",
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Register response:", response.data); // Debug

      // 2️⃣ Flexible toast message
      let registerMessage = null;

      if (response.data?.message) {
        registerMessage = response.data.message;
      } else if (response.data?.success) {
        registerMessage = "Registration successful!";
      } else if (response.data?._id || response.data?.user) {
        registerMessage = "Registration successful!";
      } else {
        registerMessage = "Registration completed!";
      }

      toast.success(registerMessage);

      // 3️⃣ Auto-login after registration
      const loginRes = await axios.post(
        "https://tasty-bities-backend-production.up.railway.app/api/auth/login",
        { email: data.email, password: data.password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login response:", loginRes.data); // Debug

      if (loginRes.data?.token) {
        localStorage.setItem("token", loginRes.data.token);
        // Update context token immediately to prevent routing issues
        setToken(loginRes.data.token);
      }

      // Small delay to ensure context updates before navigation
      setTimeout(() => {
        navigate("/"); // redirect homepage / dashboard
      }, 100);
    } catch (error) {
      console.log("Register/Login error:", error.response || error); // Debug
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to register, please try again"
      );
    }

    setData({ name: "", email: "", password: "" });
    setLoading(false);
  };

  return (
    <div className="register-wrapper">
      <div className="form-side">
        <div className="register-card">
          <div className="text-center mb-4">
            <img src={logo} alt="Logo" className="logo-img mb-3" />
            <h3>Welcome to Tasty Bites!</h3>
            <p className="text-muted">Sign up to enjoy delicious bites!</p>
          </div>

          <form onSubmit={onSubmitHandler}>
            <div className="form-group input-with-icon-end mb-3">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={data.name}
                onChange={onChangeHandler}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group input-with-icon-end mb-3">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={data.email}
                onChange={onChangeHandler}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group input-with-icon-end mb-3">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                name="password"
                value={data.password}
                onChange={onChangeHandler}
                placeholder="Password"
                required
              />
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} icon-end`}
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>

            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-tomato" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </div>

            <div className="text-center mt-3">
              Already have an account? <Link to="/login" onClick={(e) => e.stopPropagation()}>Login</Link>
            </div>
          </form>
        </div>
      </div>

      <div className="illustration-side d-none d-md-flex">
        <img src={illustration} alt="Illustration" className="illustration-img" />
      </div>
    </div>
  );
};

export default Register;
