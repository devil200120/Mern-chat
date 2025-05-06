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
  groups: [],
  groupMessages: [],
  groupMessageSendSuccess: false,
  chatbotMessages: [],
  chatbotMessageSendSuccess: false
};

export const messengerReducer = (state = messengerState, action) => {
  const { type, payload } = action;

  switch (type) {
    case THEME_GET_SUCCESS:
    case THEME_SET_SUCCESS:
      return {
        ...state,
        themeMood: payload.theme
      };

    case FRIEND_GET_SUCCESS:
      return {
        ...state,
        friends: payload.friends
      };

    case MESSAGE_GET_SUCCESS:
      return {
        ...state,
        message_get_success: true,
        message: payload.message
      };

    case MESSAGE_SEND_SUCCESS:
      return {
        ...state,
        mesageSendSuccess: true,
        message: [...state.message, payload.message]
      };

    case SOCKET_MESSAGE:
      return {
        ...state,
        message: [...state.message, payload.message]
      };

    case UPDATE_FRIEND_MESSAGE: {
      const friendsCopy = [...state.friends];
      const index = friendsCopy.findIndex(f =>
        f.fndInfo._id === payload.msgInfo.reseverId ||
        f.fndInfo._id === payload.msgInfo.senderId
      );
      if (index !== -1) {
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

    case MESSAGE_SEND_SUCCESS_CLEAR:
      return {
        ...state,
        mesageSendSuccess: false
      };

    case SEEN_MESSAGE: {
      const friendsCopy = [...state.friends];
      const index = friendsCopy.findIndex(f =>
        f.fndInfo._id === payload.msgInfo.reseverId ||
        f.fndInfo._id === payload.msgInfo.senderId
      );
      if (index !== -1) {
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

    case DELIVARED_MESSAGE: {
      const friendsCopy = [...state.friends];
      const index = friendsCopy.findIndex(f =>
        f.fndInfo._id === payload.msgInfo.reseverId ||
        f.fndInfo._id === payload.msgInfo.senderId
      );
      if (index !== -1) {
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

    case UPDATE: {
      const friendsCopy = [...state.friends];
      const index = friendsCopy.findIndex(f => f.fndInfo._id === payload.id);
      if (index !== -1 && friendsCopy[index].msgInfo) {
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

    case MESSAGE_GET_SUCCESS_CLEAR:
      return {
        ...state,
        message_get_success: false
      };

    case SEEN_ALL: {
      const friendsCopy = [...state.friends];
      const index = friendsCopy.findIndex(f => f.fndInfo._id === payload.reseverId);
      if (index !== -1 && friendsCopy[index].msgInfo) {
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

    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        friends: [],
        message: [],
        mesageSendSuccess: false,
        message_get_success: false,
        groups: [],
        groupMessages: [],
        chatbotMessages: [],
        chatbotMessageSendSuccess: false
      };

    case 'NEW_USER_ADD':
      return {
        ...state,
        new_user_add: payload.new_user_add
      };

    case 'NEW_USER_ADD_CLEAR':
      return {
        ...state,
        new_user_add: ''
      };

    case GET_GROUPS_SUCCESS:
      return {
        ...state,
        groups: payload.groups || []
      };

    case CREATE_GROUP_SUCCESS:
      return {
        ...state,
        groups: [...(state.groups || []), payload.group]
      };

    case GET_GROUP_MESSAGES_SUCCESS:
      return {
        ...state,
        groupMessages: payload.messages || []
      };

    case SEND_GROUP_MESSAGE_SUCCESS:
      return {
        ...state,
        groupMessages: [...(state.groupMessages || []), payload.message],
        groupMessageSendSuccess: true
      };

    case 'SOCKET_GROUP_MESSAGE':
      return {
        ...state,
        groupMessages: [...(state.groupMessages || []), payload.message]
      };

    case GROUP_MESSAGE_SEND_SUCCESS_CLEAR:
      return {
        ...state,
        groupMessageSendSuccess: false
      };

    case FETCH_CHATBOT_MESSAGES:
      return {
        ...state,
        chatbotMessages: payload.messages
      };

    case CHATBOT_MESSAGE_SEND_SUCCESS:
      return {
        ...state,
        chatbotMessages: [...state.chatbotMessages, payload.message],
        chatbotMessageSendSuccess: true
      };

    case CLEAR_CHATBOT_MESSAGES:
      return {
        ...state,
        chatbotMessages: []
      };

    case 'SOCKET_CHATBOT_MESSAGE':
      return {
        ...state,
        chatbotMessages: [...state.chatbotMessages, payload]
      };

    default:
      return state;
  }
};
