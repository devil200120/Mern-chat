import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { userLogin } from "../store/actions/authAction";
import { ERROR_CLEAR, SUCCESS_MESSAGE_CLEAR } from "../store/types/authType";

const Login = () => {
  const navigate = useNavigate();
  const alert = useAlert();
  const dispatch = useDispatch();
  const { loading, authenticate, error, successMessage } = useSelector((state) => state.auth);
  
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Environment variables
  const backendUrl = process.env.REACT_APP_API_URL || "https://mern-chat-hk3u.onrender.com";
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(userLogin(state));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsGoogleLoading(true);
      const response = await fetch(`${backendUrl}/api/messenger/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Google authentication failed");

      localStorage.setItem("authToken", data.token);
      dispatch({ type: "USER_LOGIN_SUCCESS", payload: data });
      alert.success(`Welcome ${data.user.userName}`);
      navigate("/");

    } catch (err) {
      console.error("Google login error:", err);
      alert.error(err.message || "Google login failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (authenticate) navigate("/");
    if (successMessage) {
      alert.success(successMessage);
      dispatch({ type: SUCCESS_MESSAGE_CLEAR });
    }
    if (error) {
      Array.isArray(error) ? error.forEach(err => alert.error(err)) : alert.error(error);
      dispatch({ type: ERROR_CLEAR });
    }
  }, [authenticate, successMessage, error, navigate, alert, dispatch]);

  return (
    <div className="register">
      <div className="card">
        <div className="card-header">
          <h3>Login</h3>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={state.email}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={state.password}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Password"
                required
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Processing..." : "Login"}
            </button>

            <div className="form-group register-link">
              <Link to="/messenger/register">Don't have an account?</Link>
            </div>
          </form>

          <div className="oauth-section">
            <div className="divider">
              <span>or</span>
            </div>

            {/* Recommended Server-side Flow */}
            <a
              href={`${backendUrl}/api/messenger/google`}
              className="google-auth-link"
              aria-label="Sign in with Google (Recommended)"
            >
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google logo" 
                className="google-logo"
              />
              Continue with Google (Recommended)
            </a>

            {/* Client-side Fallback */}
            <div className="google-client-auth">
              <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert.error("Google authentication failed")}
                  width="100%"
                  disabled={isGoogleLoading}
                  locale="en-US"
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
