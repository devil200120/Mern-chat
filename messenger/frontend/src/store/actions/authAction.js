import axios from 'axios';
import jwtDecode from 'jwt-decode';
import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  LOGOUT_SUCCESS,
  SET_USER
} from "../types/authType";

const API_URL = 'https://mern-chat-hk3u.onrender.com';

// Configure axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to handle auth errors
const handleAuthError = (error) => {
  const errorMessage = error.response?.data?.errorMessage || 
                      error.response?.data?.message || 
                      'Something went wrong. Please try again.';
  return Array.isArray(errorMessage) ? errorMessage : [errorMessage];
};

// Register User
export const userRegister = (formData) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/user-register', formData);
    
    localStorage.setItem('authToken', response.data.token);
    const decoded = jwtDecode(response.data.token);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: {
        successMessage: response.data.successMessage,
        token: response.data.token
      }
    });

    dispatch({
      type: SET_USER,
      payload: decoded
    });

  } catch (error) {
    dispatch({
      type: REGISTER_FAIL,
      payload: { error: handleAuthError(error) }
    });
  }
};

// Login User
export const userLogin = (credentials) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/user-login', credentials);
    
    localStorage.setItem('authToken', response.data.token);
    const decoded = jwtDecode(response.data.token);

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: {
        successMessage: response.data.successMessage,
        token: response.data.token
      }
    });

    dispatch({
      type: SET_USER,
      payload: decoded
    });

  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: { error: handleAuthError(error) }
    });
  }
};

// Google Login
export const googleLogin = (credentialResponse) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/google', {
      credential: credentialResponse.credential
    });

    localStorage.setItem('authToken', response.data.token);
    const decoded = jwtDecode(response.data.token);

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: {
        successMessage: 'Google login successful',
        token: response.data.token
      }
    });

    dispatch({
      type: SET_USER,
      payload: decoded
    });

  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: { error: handleAuthError(error) }
    });
  }
};

// Logout User
export const userLogout = () => async (dispatch) => {
  try {
    await axiosInstance.post('/api/messenger/user-logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('authToken');
    dispatch({ type: LOGOUT_SUCCESS });
  }
};

// Validate token on app load
export const validateToken = () => async (dispatch) => {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    if (Date.now() >= decoded.exp * 1000) {
      throw new Error('Token expired');
    }

    // Verify token with backend
    await axiosInstance.get('/api/messenger/validate-token');

    dispatch({
      type: SET_USER,
      payload: decoded
    });

  } catch (error) {
    localStorage.removeItem('authToken');
    dispatch({ type: LOGOUT_SUCCESS });
  }
};
