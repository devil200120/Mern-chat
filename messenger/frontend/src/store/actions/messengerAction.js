import axios from 'axios';
import {
    FRIEND_GET_SUCCESS,
    MESSAGE_GET_SUCCESS,
    MESSAGE_SEND_SUCCESS,
    THEME_GET_SUCCESS,
    THEME_SET_SUCCESS,
    // Add new chatbot action types
    FETCH_CHATBOT_MESSAGES,
    CHATBOT_MESSAGE_SEND_SUCCESS,
    CLEAR_CHATBOT_MESSAGES
} from "../types/messengerType";
const API_URL = "https://mern-chat-application-nlxu.onrender.com"
export const getFriends = () => async(dispatch) => {
     try{
          const response = await axios.get(`${API_URL}/api/messenger/get-friends`);
           dispatch({
                type: FRIEND_GET_SUCCESS,
                payload : {
                     friends : response.data.friends
                }
           })

     }catch (error){
          console.log(error.response.data);
     }
}

export const messageSend = (data) => async(dispatch) => {
    try{
     const response = await axios.post(`${API_URL}/api/messenger/send-message`,data);
     dispatch({
          type : MESSAGE_SEND_SUCCESS,
          payload : {
               message : response.data.message
          }
     })
    }catch (error){
     console.log(error.response.data);
    }
}


export const getMessage = (id) => {
     return async(dispatch) => {
          try{
               const response = await axios.get(`${API_URL}/api/messenger/get-message/${id}`)
              dispatch({
                   type : MESSAGE_GET_SUCCESS,
                   payload : {
                    message : response.data.message
                   }
              })
          }catch (error){
               console.log(error.response.data)
          }
     }
}


export const ImageMessageSend = (data) => async(dispatch)=>{

     try{
          const response = await axios.post(`${API_URL}/api/messenger/image-message-send`,data);
          dispatch({
               type: MESSAGE_SEND_SUCCESS,
               payload : {
                    message : response.data.message
               }
          })
     }catch (error){
          console.log(error.response.data);

     }

}

export const seenMessage = (msg) => async(dispatch)=> {
     try{
          const response = await axios.post(`${API_URL}/api/messenger/seen-message`,msg);
          console.log(response.data);
     }catch (error){
          console.log(error.response.message)

     }
}


export const updateMessage = (msg) => async(dispatch)=> {
     try{
          const response = await axios.post(`${API_URL}/api/messenger/delivared-message`,msg);
          console.log(response.data);
     }catch (error){
          console.log(error.response.message)

     }
}


export const getTheme = () => async(dispatch) => {

     const theme = localStorage.getItem('theme');
     dispatch({
          type: "THEME_GET_SUCCESS",
          payload : {
               theme : theme? theme : 'white'
          }
     })

}


export const themeSet = (theme) => async(dispatch) => {

     localStorage.setItem('theme',theme);
     dispatch({
          type: "THEME_SET_SUCCESS",
          payload : {
               theme : theme
          }
     })
     
}
// Get user groups
export const getGroups = () => async (dispatch) => {
     try {
       const response = await axios.get(`${API_URL}/api/messenger/get-groups`);
       dispatch({
         type: 'GET_GROUPS_SUCCESS',
         payload: {
           groups: response.data.groups
         }
       });
     } catch (error) {
       console.log(error.response.data);
     }
   };
   
   // Create new group
   export const createGroup = (groupData) => async (dispatch) => {
     try {
       const response = await axios.post(`${API_URL}/api/messenger/create-group`, groupData);
       dispatch({
         type: 'CREATE_GROUP_SUCCESS',
         payload: {
           group: response.data.group
         }
       });
       return response.data.group;
     } catch (error) {
       console.log(error.response.data);
     }
   };
   
   // Get messages for a group
   export const getGroupMessages = (groupId) => async (dispatch) => {
     try {
       const response = await axios.get(`${API_URL}/api/messenger/get-group-messages/${groupId}`);
       dispatch({
         type: 'GET_GROUP_MESSAGES_SUCCESS',
         payload: {
           messages: response.data.messages
         }
       });
     } catch (error) {
       console.log(error.response.data);
     }
   };
   
   // Send message to a group
   export const sendGroupMessage = (data) => async (dispatch) => {
     try {
       const response = await axios.post(`${API_URL}/api/messenger/send-group-message`, data);
       dispatch({
         type: 'SEND_GROUP_MESSAGE_SUCCESS',
         payload: {
           message: response.data.message
         }
       });
     } catch (error) {
       console.log(error.response.data);
     }
   };
   
   // Send image message to a group
   export const sendGroupImageMessage = (data) => async (dispatch) => {
     try {
       const response = await axios.post(`${API_URL}/api/messenger/send-group-image-message`, data);
       dispatch({
         type: 'SEND_GROUP_MESSAGE_SUCCESS',
         payload: {
           message: response.data.message
         }
       });
     } catch (error) {
       console.log(error.response.data);
     }
   };

// CHATBOT ACTIONS

// Get Chatbot Messages
export const getChatbotMessages = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`${API_URL}/api/messenger/chatbot/get-history`);
      dispatch({
        type: FETCH_CHATBOT_MESSAGES,
        payload: { 
          messages: response.data.messages 
        }
      });
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  }
}

// Send Message to Chatbot
export const sendChatbotMessage = (message) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${API_URL}/api/messenger/chatbot/send-message`, { message });
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
  }
}

// Clear Chatbot Conversation
export const clearChatbotConversation = () => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${API_URL}/api/messenger/chatbot/clear-conversation`);
      dispatch({
        type: CLEAR_CHATBOT_MESSAGES
      });
      return response.data;
    } catch (error) {
      console.log(error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}
