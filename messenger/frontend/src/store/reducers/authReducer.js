import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  SUCCESS_MESSAGE_CLEAR,
  ERROR_CLEAR,
  USER_LOGIN_FAIL,
  USER_LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  SET_USER
} from "../types/authType";
import jwtDecode from 'jwt-decode';

// Helper function to safely decode tokens
const safeDecodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Token decoding error:", error);
    localStorage.removeItem('authToken');
    return null;
  }
};

// Initial state with token validation
const getInitialState = () => {
  const token = localStorage.getItem('authToken');
  let initialState = {
    loading: true,
    authenticate: false,
    error: null,
    successMessage: null,
    myInfo: null
  };

  if (token) {
    const decoded = safeDecodeToken(token);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      return {
        ...initialState,
        loading: false,
        authenticate: true,
        myInfo: decoded
      };
    }
    localStorage.removeItem('authToken');
  }
  return initialState;
};

export const authReducer = (state = getInitialState(), action) => {
  switch (action.type) {
    case REGISTER_SUCCESS:
    case USER_LOGIN_SUCCESS: {
      const { token } = action.payload;
      if (!token) return state;
      
      localStorage.setItem('authToken', token);
      const decoded = safeDecodeToken(token);
      
      return decoded ? {
        ...state,
        loading: false,
        authenticate: true,
        myInfo: decoded,
        successMessage: action.payload.successMessage,
        error: null
      } : {
        ...state,
        loading: false,
        authenticate: false,
        myInfo: null,
        error: ['Invalid authentication token']
      };
    }

    case REGISTER_FAIL:
    case USER_LOGIN_FAIL:
      return {
        ...state,
        loading: false,
        authenticate: false,
        myInfo: null,
        error: Array.isArray(action.payload?.error) 
               ? action.payload.error 
               : [action.payload?.error || 'Authentication failed'],
        successMessage: null
      };

    case SET_USER:
      return {
        ...state,
        loading: false,
        authenticate: true,
        myInfo: action.payload,
        error: null
      };

    case LOGOUT_SUCCESS:
      localStorage.removeItem('authToken');
      return {
        ...getInitialState(),
        loading: false,
        authenticate: false,
        successMessage: null
      };

    case SUCCESS_MESSAGE_CLEAR:
      return { ...state, successMessage: null };

    case ERROR_CLEAR:
      return { ...state, error: null };

    default:
      return state;
  }
};
