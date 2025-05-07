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
  
  // Get authentication state from Redux
  const { authenticate } = useSelector(state => state.auth);

  // Process the token from URL
  useEffect(() => {
    if (!isProcessing) return;
    
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Store token in localStorage
      localStorage.setItem("authToken", token);
      
      // Dispatch login success action
      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: {
          token,
          successMessage: "Successfully logged in with Google"
        }
      });
      
      alert.success("Successfully logged in with Google");
      
      // Mark processing as complete but don't navigate yet
      setIsProcessing(false);
    } else {
      alert.error("Authentication failed");
      navigate("/messenger/login");
    }
  }, [dispatch, location, alert, navigate, isProcessing]);

  // Monitor authentication state and redirect when it changes
  useEffect(() => {
    if (!isProcessing && authenticate) {
      // Add a small delay to ensure Redux state is fully propagated
      setTimeout(() => {
        navigate("/");
      }, 300);
    }
  }, [authenticate, isProcessing, navigate]);

  return (
    <div className="oauth-callback" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center"
    }}>
      <h2>Completing your sign-in...</h2>
      <p>Please wait while we finish authenticating you.</p>
    </div>
  );
};

export default OAuthCallback;
