import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userLogin } from "../store/actions/authAction";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import {
  ERROR_CLEAR,
  SUCCESS_MESSAGE_CLEAR,
  USER_LOGIN_SUCCESS,
} from "../store/types/authType";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const BACKEND_URL = "https://mern-chat-application-nlxu.onrender.com";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const alert = useAlert();
  const { loading, authenticate, error, successMessage } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const login = (e) => {
    e.preventDefault();
    dispatch(userLogin(state));
  };

  // Best practice: Send Google credential to backend for verification
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/messenger/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // so cookies work if backend uses them
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.success) {
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: {
            token: data.token,
            successMessage: `Google login successful! Welcome, ${data.user.userName}`,
          },
        });
        alert.success("Google login successful! Welcome, " + data.user.userName);
        setTimeout(() => navigate("/"), 300);
      } else {
        alert.error(data.message || "Google login failed.");
      }
    } catch (err) {
      alert.error("Google login failed.");
    }
  };

  useEffect(() => {
    if (authenticate) {
      navigate("/");
    }
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
    <div className="register">
      <div className="card">
        <div className="card-header">
          <h3>Login</h3>
        </div>

        <div className="card-body">
          <form onSubmit={login}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                onChange={inputHandle}
                name="email"
                value={state.email}
                className="form-control"
                placeholder="Email"
                id="email"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                onChange={inputHandle}
                name="password"
                value={state.password}
                className="form-control"
                placeholder="Password"
                id="password"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <input type="submit" value="Login" className="btn" disabled={loading} />
            </div>

            <div className="form-group">
              <span>
                <Link to="/messenger/register">Don't have an account?</Link>
              </span>
            </div>
          </form>

          <div className="google-login-divider" style={{ textAlign: "center", margin: "20px 0" }}>
            <span>or</span>
          </div>

          {/* Server-side Google OAuth link */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
            <a
              href={`${BACKEND_URL}/api/messenger/google`}
              className="google-signin-link"
              style={{
                padding: "10px 20px",
                backgroundColor: "#4285F4",
                color: "white",
                borderRadius: "4px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                fontWeight: "500",
              }}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                style={{
                  width: "18px",
                  height: "18px",
                  marginRight: "10px",
                  backgroundColor: "white",
                  padding: "2px",
                  borderRadius: "2px",
                }}
              />
              Sign in with Google (Recommended)
            </a>
          </div>

          {/* Client-side Google OAuth fallback */}
          <div className="google-login-btn" style={{ display: "flex", justifyContent: "center" }}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert.error("Google login failed")}
                width="100%"
                useOneTap
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
