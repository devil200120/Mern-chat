import axios from 'axios';
import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  LOGOUT_SUCCESS,
  SET_USER
} from "../types/authType";

// Register
export const userRegister = (data) => {
  return async (dispatch) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      const response = await axios.post('/api/messenger/user-register', data, config);
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
          error: error.response?.data?.error?.errorMessage || ['Something went wrong']
        }
      });
    }
  };
};

// Login
export const userLogin = (data) => {
  return async (dispatch) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      const response = await axios.post('/api/messenger/user-login', data, config);
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
          error: error.response?.data?.error?.errorMessage || ['Something went wrong']
        }
      });
    }
  };
};

// Google Login
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
    const response = await axios.post('/api/messenger/user-logout');
    if (response.data.success) {
      localStorage.removeItem('authToken');
      dispatch({
        type: LOGOUT_SUCCESS
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};
