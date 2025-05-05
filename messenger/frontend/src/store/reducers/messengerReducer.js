import {
  FRIEND_GET_SUCCESS,
  MESSAGE_GET_SUCCESS,
  MESSAGE_SEND_SUCCESS,
  SOCKET_MESSAGE,
  UPDATE_FRIEND_MESSAGE,
  MESSAGE_SEND_SUCCESS_CLEAR,
  SEEN_MESSAGE,
  DELIVARED_MESSAGE,
  UPDATE,
  MESSAGE_GET_SUCCESS_CLEAR,
  SEEN_ALL,
  THEME_GET_SUCCESS,
  THEME_SET_SUCCESS,
  GET_GROUPS_SUCCESS,
  CREATE_GROUP_SUCCESS,
  GET_GROUP_MESSAGES_SUCCESS,
  SEND_GROUP_MESSAGE_SUCCESS,
  GROUP_MESSAGE_SEND_SUCCESS_CLEAR,
  // Add new chatbot action types
  FETCH_CHATBOT_MESSAGES,
  CHATBOT_MESSAGE_SEND_SUCCESS,
  CLEAR_CHATBOT_MESSAGES
} from "../types/messengerType";

const messengerState = {
  friends: [],
  message: [],
  mesageSendSuccess: false,
  message_get_success: false,
  themeMood: '',
  new_user_add: '',
  // Add missing initial state properties
  groups: [],
  groupMessages: [],
  groupMessageSendSuccess: false,
  // Add chatbot state properties
  chatbotMessages: [],
  chatbotMessageSendSuccess: false
}

export const messengerReducer = (state = messengerState, action) => {
  const { type, payload } = action;

  if(type === THEME_GET_SUCCESS || type === THEME_SET_SUCCESS){
    return {
      ...state,
      themeMood: payload.theme
    }
  }

  if(type === FRIEND_GET_SUCCESS){
    return {
      ...state,
      friends: payload.friends
    }
  }

  if(type === MESSAGE_GET_SUCCESS){
    return {
      ...state,
      message_get_success: true,
      message: payload.message
    }
  }

  if(type === MESSAGE_SEND_SUCCESS){
    return {
      ...state,
      mesageSendSuccess: true,
      message: [...state.message, payload.message]
    }
  }

  if(type === SOCKET_MESSAGE){
    return {
      ...state,
      message: [...state.message, payload.message]
    }
  }

  if(type === UPDATE_FRIEND_MESSAGE){
    // Fixed: Create a new friends array instead of mutating state directly
    const friendsCopy = [...state.friends];
    const index = friendsCopy.findIndex(f => 
      f.fndInfo._id === payload.msgInfo.reseverId || 
      f.fndInfo._id === payload.msgInfo.senderId
    );
    
    if(index !== -1) {
      friendsCopy[index] = {
        ...friendsCopy[index],
        msgInfo: {
          ...payload.msgInfo,
          status: payload.status || payload.msgInfo.status
        }
      };
    }
    
    return {
      ...state,
      friends: friendsCopy
    };
  }
  
  if(type === MESSAGE_SEND_SUCCESS_CLEAR){
    return {
      ...state,
      mesageSendSuccess: false               
    }
  }

  if(type === SEEN_MESSAGE){
    // Fixed: Create a new friends array instead of mutating state directly
    const friendsCopy = [...state.friends];
    const index = friendsCopy.findIndex(f => 
      f.fndInfo._id === payload.msgInfo.reseverId || 
      f.fndInfo._id === payload.msgInfo.senderId
    );
    
    if(index !== -1) {
      friendsCopy[index] = {
        ...friendsCopy[index],
        msgInfo: {
          ...(friendsCopy[index].msgInfo || {}),
          status: 'seen'
        }
      };
    }
    
    return {
      ...state,
      friends: friendsCopy
    };
  }

  if(type === DELIVARED_MESSAGE){
    // Fixed: Create a new friends array instead of mutating state directly
    const friendsCopy = [...state.friends];
    const index = friendsCopy.findIndex(f => 
      f.fndInfo._id === payload.msgInfo.reseverId || 
      f.fndInfo._id === payload.msgInfo.senderId
    );
    
    if(index !== -1) {
      friendsCopy[index] = {
        ...friendsCopy[index],
        msgInfo: {
          ...(friendsCopy[index].msgInfo || {}),
          status: 'delivared'
        }
      };
    }
    
    return {
      ...state,
      friends: friendsCopy
    };
  }

  if(type === UPDATE){
    // Fixed: Create a new friends array instead of mutating state directly
    const friendsCopy = [...state.friends];
    const index = friendsCopy.findIndex(f => f.fndInfo._id === payload.id);
    
    if(index !== -1 && friendsCopy[index].msgInfo) {
      friendsCopy[index] = {
        ...friendsCopy[index],
        msgInfo: {
          ...friendsCopy[index].msgInfo,
          status: 'seen'
        }
      };
    }
    
    return {
      ...state,
      friends: friendsCopy
    };
  }

  if(type === MESSAGE_GET_SUCCESS_CLEAR){
    return {
      ...state,
      message_get_success: false
    }
  }

  if(type === SEEN_ALL){
    // Fixed: Create a new friends array instead of mutating state directly
    const friendsCopy = [...state.friends];
    const index = friendsCopy.findIndex(f => f.fndInfo._id === payload.reseverId);
    
    if(index !== -1 && friendsCopy[index].msgInfo) {
      friendsCopy[index] = {
        ...friendsCopy[index],
        msgInfo: {
          ...friendsCopy[index].msgInfo,
          status: 'seen'
        }
      };
    }
    
    return {
      ...state,
      friends: friendsCopy
    };
  }

  if(type === 'LOGOUT_SUCCESS'){
    return {
      ...state,
      friends: [],
      message: [],
      mesageSendSuccess: false,
      message_get_success: false,
      groups: [],
      groupMessages: [],
      chatbotMessages: [] // Clear chatbot messages on logout
    }
  }

  if(type === 'NEW_USER_ADD'){
    return{
      ...state,
      new_user_add: payload.new_user_add
    }
  }

  if(type === 'NEW_USER_ADD_CLEAR'){
    return{
      ...state,
      new_user_add: ''
    }
  }

  if(type === GET_GROUPS_SUCCESS) {
    return {
      ...state,
      groups: payload.groups || []
    };
  }

  if(type === CREATE_GROUP_SUCCESS) {
    return {
      ...state,
      groups: [...(state.groups || []), payload.group]
    };
  }

  if(type === GET_GROUP_MESSAGES_SUCCESS) {
    return {
      ...state,
      groupMessages: payload.messages || []
    };
  }

  if(type === SEND_GROUP_MESSAGE_SUCCESS) {
    return {
      ...state,
      groupMessages: [...(state.groupMessages || []), payload.message],
      groupMessageSendSuccess: true
    };
  }

  // Fixed: Using string instead of undefined constant
  if(type === 'SOCKET_GROUP_MESSAGE') {
    return {
      ...state,
      groupMessages: [...(state.groupMessages || []), payload.message]
    };
  }

  if(type === GROUP_MESSAGE_SEND_SUCCESS_CLEAR) {
    return {
      ...state,
      groupMessageSendSuccess: false
    };
  }

  // Chatbot cases
  if(type === FETCH_CHATBOT_MESSAGES) {
    return {
      ...state,
      chatbotMessages: payload.messages
    };
  }
  
  if(type === CHATBOT_MESSAGE_SEND_SUCCESS) {
    return {
      ...state,
      chatbotMessages: [...state.chatbotMessages, payload.message],
      chatbotMessageSendSuccess: true
    };
  }
  
  if(type === CLEAR_CHATBOT_MESSAGES) {
    return {
      ...state,
      chatbotMessages: []
    };
  }
  
  // Socket chatbot messages
  if(type === 'SOCKET_CHATBOT_MESSAGE') {
    return {
      ...state,
      chatbotMessages: [...state.chatbotMessages, payload]
    };
  }
  

  return state;
}
