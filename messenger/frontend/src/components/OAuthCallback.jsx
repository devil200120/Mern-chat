import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { USER_LOGIN_SUCCESS, ERROR_CLEAR } from "../store/types/authType";
import { useAlert } from "react-alert";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const alert = useAlert();
  const [isProcessing, setIsProcessing] = useState(true);
  const { authenticate } = useSelector(state => state.auth);

  // Token validation and processing
  useEffect(() => {
    const validateAndProcessToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
          throw new Error("Authentication token missing");
        }

        // Verify token with backend
        const response = await axios.post(
          `${BACKEND_URL}/api/messenger/verify-oauth-token`,
          { token },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Invalid authentication token");
        }

        const { user, authToken } = response.data;

        // Store the validated token
        localStorage.setItem("authToken", authToken);
        
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: {
            token: authToken,
            user,
            successMessage: "Google authentication successful"
          }
        });

        alert.success("Successfully authenticated with Google");
      } catch (error) {
        console.error("OAuth processing error:", error);
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            "Authentication failed. Please try again.";
        alert.error(errorMessage);
        navigate("/messenger/login", { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    if (isProcessing) {
      validateAndProcessToken();
    }

    return () => {
      // Cleanup any ongoing requests if component unmounts
      dispatch({ type: ERROR_CLEAR });
    };
  }, [dispatch, location.search, alert, navigate, isProcessing]);

  // Redirect after successful authentication
  useEffect(() => {
    let redirectTimer;
    
    if (!isProcessing && authenticate) {
      redirectTimer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500); // Give time for state updates
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [authenticate, isProcessing, navigate]);

  return (
    <div 
      className="oauth-callback"
      role="status"
      aria-live="polite"
      aria-busy={isProcessing}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Segoe UI', system-ui, sans-serif"
      }}
    >
      <div className="loading-indicator" style={{ marginBottom: "1.5rem" }}>
        {isProcessing ? (
          <div 
            className="spinner"
            style={{
              width: "3rem",
              height: "3rem",
              border: "0.25em solid currentColor",
              borderRightColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.75s linear infinite"
            }}
            aria-hidden="true"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="3rem"
            height="3rem"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#2ecc71" }}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
      </div>
      <h2 style={{ marginBottom: "0.5rem", color: "#2d3436" }}>
        {isProcessing 
          ? "Securing Your Session"
          : "Authentication Successful!"}
      </h2>
      <p style={{ color: "#636e72", fontSize: "1.1rem" }}>
        {isProcessing 
          ? "Verifying credentials with our servers..."
          : "You're being redirected to your dashboard..."}
      </p>
    </div>
  );
};

export default OAuthCallback;
