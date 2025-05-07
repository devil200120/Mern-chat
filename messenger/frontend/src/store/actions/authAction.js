import axios from 'axios';
import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  LOGOUT_SUCCESS,
  SET_USER
} from "../types/authType";

// Configure base API URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://mern-chat-application-nlxu.onrender.com/api/messenger',
  withCredentials: true
});

// Register
export const userRegister = (data) => {
  return async (dispatch) => {
    try {
      const response = await API.post('/user-register', data);
      localStorage.setItem('authToken', response.data.token);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: {
          successMessage: response.data.successMessage,
          token: response.data.token
        }
      });
    } catch (error) {
      dispatch({
        type: REGISTER_FAIL,
        payload: {
          error: error.response?.data?.error?.errorMessage || ['Registration failed']
        }
      });
    }
  };
};

// Login 
export const userLogin = (data) => {
  return async (dispatch) => {
    try {
      const response = await API.post('/user-login', data);
      localStorage.setItem('authToken', response.data.token);

      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: {
          successMessage: response.data.successMessage,
          token: response.data.token
        }
      });
    } catch (error) {
      dispatch({
        type: USER_LOGIN_FAIL,
        payload: {
          error: error.response?.data?.error?.errorMessage || ['Invalid credentials']
        }
      });
    }
  };
};

// Google Login (Note: Should verify token server-side in production)
export const googleLogin = (token) => {
  return (dispatch) => {
    try {
      localStorage.setItem('authToken', token);
      const jwtDecode = require('jwt-decode');
      const userData = jwtDecode(token);

      dispatch({
        type: SET_USER,
        payload: userData
      });
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };
};

// Logout
export const userLogout = () => async (dispatch) => {
  try {
    await API.post('/user-logout');
    localStorage.removeItem('authToken');
    dispatch({ type: LOGOUT_SUCCESS });
  } catch (error) {
    console.error("Logout error:", error);
  }
};
