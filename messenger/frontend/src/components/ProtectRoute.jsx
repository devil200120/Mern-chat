import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProtectRoute = ({children}) => {
  const { authenticate } = useSelector(state => state.auth);

  // Check Redux first
  if (authenticate) return children;

  // Fallback: Check localStorage for a valid token
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const expTime = new Date(decoded.exp * 1000);
      if (new Date() < expTime) {
        // Optionally, you can dispatch an action here to update Redux
        return children;
      }
    } catch (err) {
      // Invalid token, fall through to redirect
    }
  }

  // If neither Redux nor localStorage shows authenticated, redirect
  return <Navigate to="/messenger/login" />;
};

export default ProtectRoute;
