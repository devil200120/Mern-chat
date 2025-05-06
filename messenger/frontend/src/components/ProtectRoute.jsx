import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { USER_LOGIN_SUCCESS } from '../store/types/authType';

/**
 * ProtectRoute - Guards protected routes in your app.
 * Usage: <ProtectRoute><YourComponent /></ProtectRoute>
 */
const ProtectRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { authenticate } = useSelector(state => state.auth);

  // Local state to help trigger Redux update only once
  const [checkedLocalToken, setCheckedLocalToken] = React.useState(false);

  useEffect(() => {
    // If not authenticated, check for a valid token in localStorage
    if (!authenticate && !checkedLocalToken) {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const expTime = new Date(decoded.exp * 1000);
          if (new Date() < expTime) {
            // Token is valid, update Redux
            dispatch({
              type: USER_LOGIN_SUCCESS,
              payload: {
                token,
                successMessage: "Session restored from local storage"
              }
            });
          } else {
            // Token expired, remove it
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          // Invalid token, remove it
          localStorage.removeItem('authToken');
        }
      }
      setCheckedLocalToken(true);
    }
  }, [authenticate, checkedLocalToken, dispatch]);

  // If authenticated (Redux or after restoring from localStorage), render children
  if (authenticate) return children;

  // If we've checked localStorage and still not authenticated, redirect to login
  if (checkedLocalToken) {
    return <Navigate to="/messenger/login" replace />;
  }

  // Otherwise, render nothing while checking token
  return null;
};

export default ProtectRoute;
