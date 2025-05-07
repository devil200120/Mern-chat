import axios from 'axios';
import {
    FRIEND_GET_SUCCESS,
    MESSAGE_GET_SUCCESS,
    MESSAGE_SEND_SUCCESS,
    THEME_GET_SUCCESS,
    THEME_SET_SUCCESS,
    FETCH_CHATBOT_MESSAGES,
    CHATBOT_MESSAGE_SEND_SUCCESS,
    CLEAR_CHATBOT_MESSAGES
} from "../types/messengerType";

// Use your backend API for all requests
const API_URL = process.env.REACT_APP_API_URL || 'https://mern-chat-application-nlxu.onrender.com/api/messenger';

export const getFriends = () => async(dispatch) => {
    try{
        const response = await axios.get(`${API_URL}/get-friends`);
        dispatch({
            type: FRIEND_GET_SUCCESS,
            payload : {
                friends : response.data.friends
            }
        });
    }catch (error){
        console.log(error.response?.data || error.message);
    }
};

export const messageSend = (data) => async(dispatch) => {
    try{
        const response = await axios.post(`${API_URL}/send-message`,data);
        dispatch({
            type : MESSAGE_SEND_SUCCESS,
            payload : {
                message : response.data.message
            }
        });
    }catch (error){
        console.log(error.response?.data || error.message);
    }
};

export const getMessage = (id) => {
    return async(dispatch) => {
        try{
            const response = await axios.get(`${API_URL}/get-message/${id}`);
            dispatch({
                type : MESSAGE_GET_SUCCESS,
                payload : {
                    message : response.data.message
                }
            });
        }catch (error){
            console.log(error.response?.data || error.message);
        }
    };
};

export const ImageMessageSend = (data) => async(dispatch)=>{
    try{
        const response = await axios.post(`${API_URL}/image-message-send`,data);
        dispatch({
            type: MESSAGE_SEND_SUCCESS,
            payload : {
                message : response.data.message
            }
        });
    }catch (error){
        console.log(error.response?.data || error.message);
    }
};

export const seenMessage = (msg) => async(dispatch)=> {
    try{
        const response = await axios.post(`${API_URL}/seen-message`,msg);
        console.log(response.data);
    }catch (error){
        console.log(error.response?.message || error.message);
    }
};

export const updateMessage = (msg) => async(dispatch)=> {
    try{
        const response = await axios.post(`${API_URL}/delivared-message`,msg);
        console.log(response.data);
    }catch (error){
        console.log(error.response?.message || error.message);
    }
};

export const getTheme = () => async(dispatch) => {
    const theme = localStorage.getItem('theme');
    dispatch({
        type: THEME_GET_SUCCESS,
        payload : {
            theme : theme? theme : 'white'
        }
    });
};

export const themeSet = (theme) => async(dispatch) => {
    localStorage.setItem('theme',theme);
    dispatch({
        type: THEME_SET_SUCCESS,
        payload : {
            theme : theme
        }
    });
};

// Get user groups
export const getGroups = () => async (dispatch) => {
    try {
        const response = await axios.get(`${API_URL}/get-groups`);
        dispatch({
            type: 'GET_GROUPS_SUCCESS',
            payload: {
                groups: response.data.groups
            }
        });
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
};

// Create new group
export const createGroup = (groupData) => async (dispatch) => {
    try {
        const response = await axios.post(`${API_URL}/create-group`, groupData);
        dispatch({
            type: 'CREATE_GROUP_SUCCESS',
            payload: {
                group: response.data.group
            }
        });
        return response.data.group;
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
};

// Get messages for a group
export const getGroupMessages = (groupId) => async (dispatch) => {
    try {
        const response = await axios.get(`${API_URL}/get-group-messages/${groupId}`);
        dispatch({
            type: 'GET_GROUP_MESSAGES_SUCCESS',
            payload: {
                messages: response.data.messages
            }
        });
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
};

// Send message to a group
export const sendGroupMessage = (data) => async (dispatch) => {
    try {
        const response = await axios.post(`${API_URL}/send-group-message`, data);
        dispatch({
            type: 'SEND_GROUP_MESSAGE_SUCCESS',
            payload: {
                message: response.data.message
            }
        });
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
};

// Send image message to a group
export const sendGroupImageMessage = (data) => async (dispatch) => {
    try {
        const response = await axios.post(`${API_URL}/send-group-image-message`, data);
        dispatch({
            type: 'SEND_GROUP_MESSAGE_SUCCESS',
            payload: {
                message: response.data.message
            }
        });
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
};

// CHATBOT ACTIONS

// Get Chatbot Messages
export const getChatbotMessages = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${API_URL}/chatbot/get-history`);
            dispatch({
                type: FETCH_CHATBOT_MESSAGES,
                payload: { 
                    messages: response.data.messages 
                }
            });
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };
};

// Send Message to Chatbot
export const sendChatbotMessage = (message) => {
    return async (dispatch) => {
        try {
            const response = await axios.post(`${API_URL}/chatbot/send-message`, { message });
            dispatch({
                type: CHATBOT_MESSAGE_SEND_SUCCESS,
                payload: { 
                    message: response.data.message 
                }
            });
            return response.data;
        } catch (error) {
            console.log(error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    };
};

// Clear Chatbot Conversation
export const clearChatbotConversation = () => {
    return async (dispatch) => {
        try {
            const response = await axios.post(`${API_URL}/chatbot/clear-conversation`);
            dispatch({
                type: CLEAR_CHATBOT_MESSAGES
            });
            return response.data;
        } catch (error) {
            console.log(error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    };
};
