import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { USER_LOGIN_SUCCESS } from "../store/types/authType";
import { useAlert } from "react-alert";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const alert = useAlert();
  const [isProcessing, setIsProcessing] = useState(true);
  const { authenticate } = useSelector(state => state.auth);

  // Token processing effect
  useEffect(() => {
    const processToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        localStorage.setItem("authToken", token);
        
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: {
            token,
            successMessage: "Google authentication successful"
          }
        });

        alert.success("Successfully logged in with Google");
      } catch (error) {
        console.error("OAuth processing error:", error);
        alert.error(error.message || "Authentication failed");
        navigate("/messenger/login", { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    if (isProcessing) {
      processToken();
    }
  }, [dispatch, location.search, alert, navigate, isProcessing]);

  // Authentication success effect
  useEffect(() => {
    let redirectTimer;
    
    if (!isProcessing && authenticate) {
      redirectTimer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 300);
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
      </div>
      <h2 style={{ marginBottom: "0.5rem", color: "#2d3436" }}>
        {isProcessing ? "Finalizing Authentication" : "Authentication Successful"}
      </h2>
      <p style={{ color: "#636e72", fontSize: "1.1rem" }}>
        {isProcessing 
          ? "Please wait while we secure your session..."
          : "Redirecting to your dashboard..."}
      </p>
    </div>
  );
};

export default OAuthCallback;
