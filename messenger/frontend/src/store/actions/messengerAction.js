import axios from 'axios';
import {
  FRIEND_GET_SUCCESS,
  MESSAGE_GET_SUCCESS,
  MESSAGE_SEND_SUCCESS,
  THEME_GET_SUCCESS,
  THEME_SET_SUCCESS,
  // Group types
  GROUP_GET_SUCCESS,
  GROUP_CREATE_SUCCESS,
  GROUP_MESSAGES_GET_SUCCESS,
  GROUP_MESSAGE_SEND_SUCCESS,
  // Chatbot types
  FETCH_CHATBOT_MESSAGES,
  CHATBOT_MESSAGE_SEND_SUCCESS,
  CLEAR_CHATBOT_MESSAGES
} from "../types/messengerType";

// API base URL (use environment variable or fallback)
const API_URL = process.env.REACT_APP_API_URL || 'https://mern-chat-hk3u.onrender.com';

// Axios instance with credentials and token support
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to every request if available
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized error handler
const handleError = (error) => {
  const errorMessage = error.response?.data?.errorMessage ||
    error.response?.data?.message ||
    'Something went wrong. Please try again.';
  return Array.isArray(errorMessage) ? errorMessage : [errorMessage];
};

// --- FRIENDS ---

export const getFriends = () => async (dispatch) => {
  try {
    const response = await axiosInstance.get('/api/messenger/get-friends');
    dispatch({
      type: FRIEND_GET_SUCCESS,
      payload: { friends: response.data.friends }
    });
  } catch (error) {
    dispatch({
      type: FRIEND_GET_SUCCESS,
      payload: { friends: [], error: handleError(error) }
    });
  }
};

// --- MESSAGES ---

export const messageSend = (data) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/send-message', data);
    dispatch({
      type: MESSAGE_SEND_SUCCESS,
      payload: { message: response.data.message }
    });
    return response.data.message;
  } catch (error) {
    throw handleError(error);
  }
};

export const getMessage = (id) => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/messenger/get-message/${id}`);
    dispatch({
      type: MESSAGE_GET_SUCCESS,
      payload: { message: response.data.message }
    });
  } catch (error) {
    dispatch({
      type: MESSAGE_GET_SUCCESS,
      payload: { message: [], error: handleError(error) }
    });
  }
};

export const ImageMessageSend = (data) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/image-message-send', data);
    dispatch({
      type: MESSAGE_SEND_SUCCESS,
      payload: { message: response.data.message }
    });
    return response.data.message;
  } catch (error) {
    throw handleError(error);
  }
};

export const seenMessage = (msg) => async (dispatch) => {
  try {
    await axiosInstance.post('/api/messenger/seen-message', msg);
  } catch (error) {
    console.error('Seen message error:', handleError(error));
  }
};

export const updateMessage = (msg) => async (dispatch) => {
  try {
    await axiosInstance.post('/api/messenger/delivared-message', msg);
  } catch (error) {
    console.error('Update message error:', handleError(error));
  }
};

// --- THEME ---

export const getTheme = () => (dispatch) => {
  const theme = localStorage.getItem('theme') || 'white';
  dispatch({
    type: THEME_GET_SUCCESS,
    payload: { theme }
  });
};

export const themeSet = (theme) => (dispatch) => {
  localStorage.setItem('theme', theme);
  dispatch({
    type: THEME_SET_SUCCESS,
    payload: { theme }
  });
};

// --- GROUPS ---

export const getGroups = () => async (dispatch) => {
  try {
    const response = await axiosInstance.get('/api/messenger/get-groups');
    dispatch({
      type: GROUP_GET_SUCCESS,
      payload: { groups: response.data.groups }
    });
  } catch (error) {
    dispatch({
      type: GROUP_GET_SUCCESS,
      payload: { groups: [], error: handleError(error) }
    });
  }
};

export const createGroup = (groupData) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/create-group', groupData);
    dispatch({
      type: GROUP_CREATE_SUCCESS,
      payload: { group: response.data.group }
    });
    return response.data.group;
  } catch (error) {
    throw handleError(error);
  }
};

export const getGroupMessages = (groupId) => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/messenger/get-group-messages/${groupId}`);
    dispatch({
      type: GROUP_MESSAGES_GET_SUCCESS,
      payload: { messages: response.data.messages }
    });
  } catch (error) {
    dispatch({
      type: GROUP_MESSAGES_GET_SUCCESS,
      payload: { messages: [], error: handleError(error) }
    });
  }
};

export const sendGroupMessage = (data) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/send-group-message', data);
    dispatch({
      type: GROUP_MESSAGE_SEND_SUCCESS,
      payload: { message: response.data.message }
    });
    return response.data.message;
  } catch (error) {
    throw handleError(error);
  }
};

export const sendGroupImageMessage = (data) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/send-group-image-message', data);
    dispatch({
      type: GROUP_MESSAGE_SEND_SUCCESS,
      payload: { message: response.data.message }
    });
    return response.data.message;
  } catch (error) {
    throw handleError(error);
  }
};

// --- CHATBOT ---

export const getChatbotMessages = () => async (dispatch) => {
  try {
    const response = await axiosInstance.get('/api/messenger/chatbot/get-history');
    dispatch({
      type: FETCH_CHATBOT_MESSAGES,
      payload: { messages: response.data.messages }
    });
  } catch (error) {
    dispatch({
      type: FETCH_CHATBOT_MESSAGES,
      payload: { messages: [], error: handleError(error) }
    });
  }
};

export const sendChatbotMessage = (message) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/messenger/chatbot/send-message', { message });
    dispatch({
      type: CHATBOT_MESSAGE_SEND_SUCCESS,
      payload: { message: response.data.message }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const clearChatbotConversation = () => async (dispatch) => {
  try {
    await axiosInstance.post('/api/messenger/chatbot/clear-conversation');
    dispatch({ type: CLEAR_CHATBOT_MESSAGES });
  } catch (error) {
    throw handleError(error);
  }
};
