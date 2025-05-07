import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { userLogin } from "../store/actions/authAction";
import {
  ERROR_CLEAR,
  SUCCESS_MESSAGE_CLEAR,
  USER_LOGIN_SUCCESS
} from "../store/types/authType";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const alert = useAlert();
  const dispatch = useDispatch();
  const { loading, authenticate, error, successMessage } = useSelector(
    (state) => state.auth
  );

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(userLogin(credentials));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/messenger/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Google login failed");
      }

      localStorage.setItem("authToken", data.token);
      
      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: {
          token: data.token,
          user: data.user,
          successMessage: `Welcome, ${data.user.userName}!`,
        },
      });

      alert.success(`Welcome back, ${data.user.userName}!`);
      navigate("/");

    } catch (error) {
      console.error("Google login error:", error);
      alert.error(error.message || "Google authentication failed");
    }
  };

  useEffect(() => {
    if (authenticate) navigate("/");
    if (successMessage) {
      alert.success(successMessage);
      dispatch({ type: SUCCESS_MESSAGE_CLEAR });
    }
    if (error) {
      error.forEach((err) => alert.error(err));
      dispatch({ type: ERROR_CLEAR });
    }
  }, [successMessage, error, authenticate, navigate, alert, dispatch]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              autoComplete="username"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            aria-label="Sign in"
          >
            {loading ? (
              <div className="spinner" aria-hidden="true"></div>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="auth-alternative">
            <span>Don't have an account? </span>
            <Link to="/messenger/register" className="auth-link">
              Create Account
            </Link>
          </div>
        </form>

        <div className="oauth-section">
          <div className="oauth-divider">
            <span>Or continue with</span>
          </div>

          <div className="oauth-providers">
            <a
              href={`${BACKEND_URL}/api/messenger/google`}
              className="google-auth-btn"
              aria-label="Sign in with Google (Server-side)"
            >
              <img
                src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_32dp.png"
                alt="Google logo"
                className="provider-logo"
              />
              Sign in with Google
            </a>

            <div className="client-oauth-fallback">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert.error("Google login failed")}
                useOneTap
                width="300"
                locale="en-US"
                theme="filled_blue"
                shape="rectangular"
                size="large"
                text="continue_with"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
