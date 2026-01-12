import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../../service/authService';
import { StoreContext } from '../../context/StoreContext';
import illustration from '../../assets/signup/1.png';
import './Login.css';

const Login = () => {
  const { setToken, loadCartData } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // authService se direct DATA aa raha hai
      const response = await login(data);

      // EXPECTED: response.token
      if (response && response.token) {
        localStorage.setItem("token", response.token);

        // Persist user id if backend returns it (common fields)
        const userId =
          response.userId ||
          response.id ||
          response.user?.id ||
          response.user?._id;
        if (userId) {
          localStorage.setItem("userId", userId);
        }

        // Persist user email for order matching
        const userEmail = 
          response.email ||
          response.userEmail ||
          response.user?.email ||
          data.email; // Use login email as fallback
        if (userEmail) {
          localStorage.setItem("userEmail", userEmail);
        }

        setToken(response.token);

        await loadCartData(response.token);

        toast.success("Login successful");
        
        // Redirect to the saved path or home
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div className="login-wrapper">
      <div className="form-side">
        <div className="login-card">
          <div className="text-center mb-4">
            <h3>Welcome Back to Tasty Bites!</h3>
            <p className="text-muted">
              Sign in to continue enjoying delicious bites!
            </p>
          </div>

          <form onSubmit={onSubmitHandler}>
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
              <i className="bi bi-envelope icon-end"></i>
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
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-lock"} icon-end`}
                onClick={() => setShowPassword(prev => !prev)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>

            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-tomato">
                Sign In
              </button>
            </div>

            <div className="text-center mt-3">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>

      <div className="illustration-side d-none d-md-flex">
        <img
          src={illustration}
          alt="Illustration"
          className="illustration-img"
        />
      </div>
    </div>
  );
};

export default Login;
