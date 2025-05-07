import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userLogin } from "../store/actions/authAction";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { ERROR_CLEAR, SUCCESS_MESSAGE_CLEAR, USER_LOGIN_SUCCESS } from "../store/types/authType";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Set this in your .env
const BACKEND_URL = process.env.REACT_APP_API_URL || "https://mern-chat-application-nlxu.onrender.com/api/messenger";

const Login = () => {
  const navigate = useNavigate();
  const alert = useAlert();
  const { loading, authenticate, error, successMessage, myInfo } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const inputHendle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const login = (e) => {
    e.preventDefault();
    dispatch(userLogin(state));
  };

  // Improved client-side Google login success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwt_decode(credentialResponse.credential);
      
      // Store the credential token in localStorage
      localStorage.setItem("authToken", credentialResponse.credential);
      
      // Update Redux state (important for authentication)
      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: {
          token: credentialResponse.credential,
          successMessage: `Google login successful! Welcome, ${decoded.name}`
        }
      });
      
      alert.success("Google login successful! Welcome, " + decoded.name);
      
      // Navigate after Redux state update
      setTimeout(() => navigate("/"), 300);
    } catch (err) {
      console.error("Google login error:", err);
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
      error.map((err) => alert.error(err));
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
                onChange={inputHendle}
                name="email"
                value={state.email}
                className="form-control"
                placeholder="Email"
                id="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                onChange={inputHendle}
                name="password"
                value={state.password}
                className="form-control"
                placeholder="Password"
                id="password"
              />
            </div>

            <div className="form-group">
              <input type="submit" value="login" className="btn" />
            </div>

            <div className="form-group">
              <span>
                <Link to="/messenger/register"> Don't have any Account </Link>
              </span>
            </div>
          </form>

          <div className="google-login-divider" style={{ textAlign: "center", margin: "20px 0" }}>
            <span>or</span>
          </div>

          {/* Corrected: Use backend URL for Google OAuth */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
            <a
              href={`${BACKEND_URL}/google`}
              className="google-signin-link"
              style={{
                padding: "10px 20px",
                backgroundColor: "#4285F4",
                color: "white",
                borderRadius: "4px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                fontWeight: "500"
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
                  borderRadius: "2px"
                }}
              />
              Sign in with Google (Recommended)
            </a>
          </div>

          {/* Optional: Client-side Google OAuth fallback */}
          <div className="google-login-btn" style={{ display: "flex", justifyContent: "center" }}>
            <GoogleOAuthProvider clientId={clientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert.error("Google login failed")}
                width="100%"
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
