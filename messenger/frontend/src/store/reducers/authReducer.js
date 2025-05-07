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

// Initial state with proper null checks
const getInitialState = () => {
  const authState = {
    loading: true,
    authenticate: false,
    error: null,
    successMessage: null,
    myInfo: null
  };

  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      
      if (decoded.exp * 1000 > Date.now()) {
        return {
          ...authState,
          loading: false,
          authenticate: true,
          myInfo: decoded
        };
      }
      localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.error("Token initialization error:", error);
    localStorage.removeItem('authToken');
  }

  return authState;
};

export const authReducer = (state = getInitialState(), action) => {
  switch (action.type) {
    case REGISTER_FAIL:
    case USER_LOGIN_FAIL:
      return {
        ...state,
        loading: false,
        authenticate: false,
        myInfo: null,
        error: action.payload?.error || 'Authentication failed',
        successMessage: null
      };

    case REGISTER_SUCCESS:
    case USER_LOGIN_SUCCESS:
      try {
        const { token, successMessage, user } = action.payload;
        let decodedUser = user;

        if (token) {
          localStorage.setItem('authToken', token);
          decodedUser = jwtDecode(token);
        }

        return {
          ...state,
          loading: false,
          authenticate: true,
          myInfo: decodedUser,
          successMessage: successMessage || 'Authentication successful',
          error: null
        };

      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem('authToken');
        return {
          ...state,
          loading: false,
          authenticate: false,
          myInfo: null,
          error: 'Invalid authentication credentials',
          successMessage: null
        };
      }

    case SET_USER:
      return {
        ...state,
        loading: false,
        myInfo: action.payload.user,
        authenticate: true,
        error: null
      };

    case LOGOUT_SUCCESS:
      localStorage.removeItem('authToken');
      return {
        ...getInitialState(),
        loading: false,
        successMessage: 'Logout successful'
      };

    case SUCCESS_MESSAGE_CLEAR:
      return {
        ...state,
        successMessage: null
      };

    case ERROR_CLEAR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};
