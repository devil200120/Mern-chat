import React, { useEffect, useState, useRef, useCallback } from "react";
import VideoCall from "./VideoCall.jsx";

import {
  FaEllipsisH,
  FaEdit,
  FaSistrix,
  FaSignOutAlt,
  FaUsers,
  FaUserFriends,
  FaPlusCircle,
  FaFileImage,
  FaGift,
  FaPaperPlane,
  FaBars,
} from "react-icons/fa";

import ActiveFriend from "./ActiveFriend";
import Friends from "./Friends";
import Group from "./Group";
import RightSide from "./RightSide";
import { useDispatch, useSelector } from "react-redux";

import {
  getFriends,
  messageSend,
  getMessage,
  ImageMessageSend,
  seenMessage,
  updateMessage,
  getTheme,
  themeSet,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  sendGroupImageMessage,
  createGroup,
  getChatbotMessages,
  sendChatbotMessage,
  clearChatbotConversation
} from "../store/actions/messengerAction";
import { userLogout } from "../store/actions/authAction";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import useSound from "use-sound";
import notificationSound from "../audio/notification.mp3";
import sendingSound from "../audio/sending.mp3";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import ChatBot from './ChatBot.jsx';
import { BsRobot } from 'react-icons/bs';
const Messenger = () => {
  const navigate = useNavigate();
  const [notificationSPlay] = useSound(notificationSound);
  const [sendingSPlay] = useSound(sendingSound);
  const scrollRef = useRef();
  const socket = useRef(null);
  const {
    friends,
    message,
    mesageSendSuccess,
    message_get_success,
    themeMood,
    new_user_add,
    groups,
    groupMessages,
    groupMessageSendSuccess,
  } = useSelector((state) => state.messenger);
  const [callStatus, setCallStatus] = useState(null);
  const { myInfo } = useSelector((state) => state.auth);
  const [currentfriend, setCurrentFriend] = useState("");
  const [currentGroup, setCurrentGroup] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("friends");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [activeUser, setActiveUser] = useState([]);
  const [socketMessage, setSocketMessage] = useState("");
  const [typingMessage, setTypingMessage] = useState("");
  const [groupTypingMessage, setGroupTypingMessage] = useState("");
  const [hide, setHide] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const [videoCallModal, setVideoCallModal] = useState(false);
  const [videoCallInfo, setVideoCallInfo] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const { chatbotMessages, chatbotMessageSendSuccess } = useSelector(state => state.messenger);
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "😝",
    "😜",
    "🧐",
    "🤓",
    "😎",
    "😕",
    "🤑",
    "🥴",
    "😱",
  ];
  const BACKEND_URL = "https://mern-chat-application-nlxu.onrender.com";


  // Initialize socket connection ONCE
  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket"], // Force WebSocket transport
      upgrade: false,
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  // Register user when socket connects
  useEffect(() => {
    if (!socket.current || !myInfo?.id) return;

    socket.current.emit("addUser", myInfo.id, myInfo);

    // Get current online users
    const handleGetUser = (users) => {
      const filterUser = users.filter((u) => u.userId !== myInfo.id);
      setActiveUser(filterUser);
    };

    // Handle new user notifications
    const handleNewUserAdd = (data) => {
      dispatch({
        type: "NEW_USER_ADD",
        payload: { new_user_add: data },
      });
    };

    socket.current.on("getUser", handleGetUser);
    socket.current.on("new_user_add", handleNewUserAdd);

    return () => {
      socket.current.off("getUser", handleGetUser);
      socket.current.off("new_user_add", handleNewUserAdd);
    };
  }, [dispatch, myInfo?.id, myInfo]);

  // Setup all socket listeners - main message events
  useEffect(() => {
    if (!socket.current) return;

    // Message event handlers
    const handleGetMessage = (data) => {
      setSocketMessage(data);
    };

    const handleTypingMessageGet = (data) => {
      setTypingMessage(data);
    };

    const handleMsgSeenResponse = (msg) => {
      dispatch({
        type: "SEEN_MESSAGE",
        payload: { msgInfo: msg },
      });
    };

    const handleMsgDeliveredResponse = (msg) => {
      dispatch({
        type: "DELIVARED_MESSAGE",
        payload: { msgInfo: msg },
      });
    };

    const handleSeenSuccess = (data) => {
      dispatch({
        type: "SEEN_ALL",
        payload: data,
      });
    };

    // Register event listeners
    socket.current.on("getMessage", handleGetMessage);
    socket.current.on("typingMessageGet", handleTypingMessageGet);
    socket.current.on("msgSeenResponse", handleMsgSeenResponse);
    socket.current.on("msgDelivaredResponse", handleMsgDeliveredResponse);
    socket.current.on("seenSuccess", handleSeenSuccess);

    // Clean up listeners on unmount
    return () => {
      if (!socket.current) return;
      socket.current.off("getMessage", handleGetMessage);
      socket.current.off("typingMessageGet", handleTypingMessageGet);
      socket.current.off("msgSeenResponse", handleMsgSeenResponse);
      socket.current.off("msgDelivaredResponse", handleMsgDeliveredResponse);
      socket.current.off("seenSuccess", handleSeenSuccess);
    };
  }, [dispatch]);
  // Add this to your socket listeners useEffect
  useEffect(() => {
    if (!socket.current) return;
  
    const handleIncomingCall = (data) => {
      // Play notification sound
      notificationSPlay();
      setCallStatus('ringing');
  
      // Create confirm dialog
      if (
        window.confirm(`Incoming call from ${data.callerInfo.name}. Accept?`)
      ) {
        setVideoCallInfo({
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerInfo.name,
          isInitiator: false,
        });
        setVideoCallModal(true);
        setCallStatus('connecting');
  
        // Accept the call
        socket.current.emit("videoCallAnswer", {
          callId: data.callId,
          callerId: data.callerId,
        });
      } else {
        // Reject the call
        socket.current.emit("rejectVideoCall", {
          callId: data.callId,
          callerId: data.callerId,
        });
        setCallStatus(null);
      }
    };
  
    const handleCallError = (error) => {
      toast.error(`Call error: ${error.message}`);
      setCallStatus(null);
    };
  
    const handleCallEnded = (data) => {
      const reasonMap = {
        'user_ended': 'Call ended',
        'not_answered': 'Call was not answered',
        'rejected': 'Call was rejected',
        'participant_disconnected': 'Participant disconnected',
        'max_duration_reached': 'Maximum call duration reached',
        'inactive': 'Call ended due to inactivity'
      };
      
      const message = reasonMap[data.reason] || 'Call ended';
      toast.info(message);
      
      setVideoCallModal(false);
      setVideoCallInfo(null);
      setCallStatus(null);
    };
  
    const handleCallRinging = () => {
      setCallStatus('ringing');
      toast.info('Call is ringing...');
    };
  
    // Register all event listeners
    socket.current.on('incomingVideoCall', handleIncomingCall);
    socket.current.on('videoCallEnded', handleCallEnded);
    socket.current.on('videoCallError', handleCallError);
    socket.current.on('videoCallRinging', handleCallRinging);
    socket.current.on('videoCallRejected', () => {
      toast.info('Call was rejected');
      setCallStatus(null);
    });
    socket.current.on('videoCallNotAnswered', () => {
      toast.info('Call was not answered');
      setCallStatus(null);
    });
  
    return () => {
      if (!socket.current) return;
      socket.current.off('incomingVideoCall', handleIncomingCall);
      socket.current.off('videoCallEnded', handleCallEnded);
      socket.current.off('videoCallError', handleCallError);
      socket.current.off('videoCallRinging', handleCallRinging);
      socket.current.off('videoCallRejected');
      socket.current.off('videoCallNotAnswered');
    };
  }, [notificationSPlay]);

  // Group-specific socket events
  useEffect(() => {
    if (!socket.current) return;

    const handleGetGroupMessage = (data) => {
      if (currentGroup && data.groupId === currentGroup._id) {
        dispatch({
          type: "SOCKET_GROUP_MESSAGE",
          payload: { message: data },
        });
        notificationSPlay();
      } else if (data.senderId !== myInfo?.id) {
        toast.success(`New message in ${data.groupName || "a group"}`);
      }
    };

    const handleTypingGroupMessageGet = (data) => {
      setGroupTypingMessage(data);
    };

    socket.current.on("getGroupMessage", handleGetGroupMessage);
    socket.current.on("typingGroupMessageGet", handleTypingGroupMessageGet);

    return () => {
      if (!socket.current) return;
      socket.current.off("getGroupMessage", handleGetGroupMessage);
      socket.current.off("typingGroupMessageGet", handleTypingGroupMessageGet);
    };
  }, [currentGroup, dispatch, myInfo?.id, notificationSPlay]);

  // Handle joining/leaving group rooms
  useEffect(() => {
    if (!socket.current || !currentGroup) return;

    // Join group room when changing to this group
    socket.current.emit("joinGroup", currentGroup._id);

    // Clean up - leave room when component unmounts or changes group
    return () => {
      if (socket.current) {
        socket.current.emit("leaveGroup", currentGroup._id);
      }
    };
  }, [currentGroup]);

  // Process received private messages
  useEffect(() => {
    if (!socketMessage || !currentfriend || !myInfo?.id) return;

    // Handle messages intended for the current chat
    if (
      socketMessage.senderId === currentfriend._id &&
      socketMessage.reseverId === myInfo.id
    ) {
      dispatch({
        type: "SOCKET_MESSAGE",
        payload: { message: socketMessage },
      });

      dispatch(seenMessage(socketMessage));
      socket.current.emit("messageSeen", socketMessage);

      dispatch({
        type: "UPDATE_FRIEND_MESSAGE",
        payload: { msgInfo: socketMessage, status: "seen" },
      });
    }

    // Clear the socket message after processing
    setSocketMessage("");
  }, [socketMessage, currentfriend, dispatch, myInfo?.id]);

  // Handle notifications for messages from users other than current chat
  useEffect(() => {
    if (!socketMessage || !myInfo?.id) return;

    if (
      socketMessage.senderId !== currentfriend?._id &&
      socketMessage.reseverId === myInfo.id
    ) {
      notificationSPlay();
      toast.success(`${socketMessage.senderName} sent a new message`);

      dispatch(updateMessage(socketMessage));
      socket.current.emit("delivaredMessage", socketMessage);

      dispatch({
        type: "UPDATE_FRIEND_MESSAGE",
        payload: { msgInfo: socketMessage, status: "delivared" },
      });
    }
  }, [socketMessage, currentfriend, dispatch, notificationSPlay, myInfo?.id]);

  // Message input handler - optimized with useCallback
  const inputHandle = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      if (!socket.current) return;

      if (currentfriend) {
        socket.current.emit("typingMessage", {
          senderId: myInfo?.id,
          reseverId: currentfriend._id,
          msg: e.target.value,
        });
      } else if (currentGroup) {
        socket.current.emit("typingGroupMessage", {
          senderId: myInfo?.id,
          groupId: currentGroup._id,
          msg: e.target.value,
        });
      }
    },
    [currentfriend, currentGroup, myInfo?.id]
  );

  // Send message - optimized with useCallback
  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!socket.current || !newMessage) return;

      sendingSPlay();

      if (currentfriend) {
        const data = {
          senderName: myInfo?.userName,
          reseverId: currentfriend._id,
          message: newMessage || "❤",
        };

        socket.current.emit("typingMessage", {
          senderId: myInfo?.id,
          reseverId: currentfriend._id,
          msg: "",
        });

        dispatch(messageSend(data));
      } else if (currentGroup) {
        const data = {
          groupId: currentGroup._id,
          senderName: myInfo?.userName,
          message: newMessage || "❤",
        };

        socket.current.emit("typingGroupMessage", {
          senderId: myInfo?.id,
          groupId: currentGroup._id,
          msg: "",
        });

        // dispatch(sendGroupMessage(data));

        socket.current.emit("sendGroupMessage", {
          groupId: currentGroup._id,
          groupName: currentGroup.name,
          senderId: myInfo?.id,
          senderName: myInfo?.userName,
          message: {
            text: newMessage || "❤",
            image: "",
          },
          time: new Date(),
        });
      }

      setNewMessage("");
    },
    [
      currentfriend,
      currentGroup,
      dispatch,
      myInfo?.id,
      myInfo?.userName,
      newMessage,
      sendingSPlay,
    ]
  );
  useEffect(() => {
    if (!socket.current) return;
    
    // Add this handler for chatbot messages
    const handleGetChatbotMessage = (data) => {
      dispatch({
        type: 'SOCKET_CHATBOT_MESSAGE',
        payload: { message: data }
      });
      
      if (!showChatbot) {
        notificationSPlay();
        toast.success('New message from AI Assistant');
      }
    };
    
    socket.current.on('getChatbotMessage', handleGetChatbotMessage);
    
    return () => {
      if (socket.current) {
        socket.current.off('getChatbotMessage', handleGetChatbotMessage);
      }
    };
  }, [dispatch, showChatbot, notificationSPlay]);

  // Update friend message status after successful send
  useEffect(() => {
    if (!mesageSendSuccess || !message.length || !socket.current) return;

    const lastMsg = message[message.length - 1];
    socket.current.emit("sendMessage", lastMsg);

    dispatch({
      type: "UPDATE_FRIEND_MESSAGE",
      payload: { msgInfo: lastMsg },
    });

    dispatch({ type: "MESSAGE_SEND_SUCCESS_CLEAR" });
  }, [mesageSendSuccess, message, dispatch]);

  // Clear group message send success flag
  useEffect(() => {
    if (groupMessageSendSuccess) {
      dispatch({ type: "GROUP_MESSAGE_SEND_SUCCESS_CLEAR" });
    }
  }, [groupMessageSendSuccess, dispatch]);

  // Load friends and groups data
  useEffect(() => {
    dispatch(getFriends());
    dispatch(getGroups());
    dispatch({ type: "NEW_USER_ADD_CLEAR" });
  }, [dispatch, new_user_add]);

  // Set default friend if none selected
  useEffect(() => {
    if (friends?.length > 0 && !currentfriend && !currentGroup) {
      setCurrentFriend(friends[0].fndInfo);
    }
  }, [friends, currentfriend, currentGroup]);

  // Load messages for selected friend
  useEffect(() => {
    if (currentfriend?._id) {
      dispatch(getMessage(currentfriend._id));
      setCurrentGroup(null);
    }
  }, [currentfriend, dispatch]);

  // Load messages for selected group
  useEffect(() => {
    if (currentGroup?._id) {
      dispatch(getGroupMessages(currentGroup._id));
      setCurrentFriend(null);
    }
  }, [currentGroup, dispatch]);

  // Mark messages as seen
  useEffect(() => {
    if (!message.length || !currentfriend || !myInfo?.id) return;

    const lastMsg = message[message.length - 1];
    if (lastMsg.senderId !== myInfo.id && lastMsg.status !== "seen") {
      dispatch({
        type: "UPDATE",
        payload: { id: currentfriend._id },
      });

      socket.current.emit("seen", {
        senderId: currentfriend._id,
        reseverId: myInfo.id,
      });

      dispatch(seenMessage({ _id: lastMsg._id }));
    }

    dispatch({ type: "MESSAGE_GET_SUCCESS_CLEAR" });
  }, [message_get_success, message, currentfriend, dispatch, myInfo?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, groupMessages]);

  // Send emoji - optimized with useCallback
  const emojiSend = useCallback(
    (emu) => {
      setNewMessage((prev) => `${prev}${emu}`);

      if (!socket.current) return;

      if (currentfriend) {
        socket.current.emit("typingMessage", {
          senderId: myInfo?.id,
          reseverId: currentfriend._id,
          msg: emu,
        });
      } else if (currentGroup) {
        socket.current.emit("typingGroupMessage", {
          senderId: myInfo?.id,
          groupId: currentGroup._id,
          msg: emu,
        });
      }
    },
    [currentfriend, currentGroup, myInfo?.id]
  );

  // Send image - optimized with useCallback
  const ImageSend = useCallback(
    (e) => {
      if (!e.target.files.length || !socket.current) return;

      sendingSPlay();
      const file = e.target.files[0];
      const imagename = file.name;
      const newImageName = Date.now() + imagename;

      if (currentfriend) {
        socket.current.emit("sendMessage", {
          senderId: myInfo?.id,
          senderName: myInfo?.userName,
          reseverId: currentfriend._id,
          time: new Date(),
          message: {
            text: "",
            image: newImageName,
          },
        });

        const formData = new FormData();
        formData.append("senderName", myInfo?.userName);
        formData.append("imageName", newImageName);
        formData.append("reseverId", currentfriend._id);
        formData.append("image", file);

        dispatch(ImageMessageSend(formData));
      } else if (currentGroup) {
        socket.current.emit("sendGroupMessage", {
          groupId: currentGroup._id,
          groupName: currentGroup.name,
          senderId: myInfo?.id,
          senderName: myInfo?.userName,
          time: new Date(),
          message: {
            text: "",
            image: newImageName,
          },
        });

        const formData = new FormData();
        formData.append("senderName", myInfo?.userName);
        formData.append("imageName", newImageName);
        formData.append("groupId", currentGroup._id);
        formData.append("image", file);

        dispatch(sendGroupImageMessage(formData));
      }
    },
    [
      currentfriend,
      currentGroup,
      dispatch,
      myInfo?.id,
      myInfo?.userName,
      sendingSPlay,
    ]
  );

  // Logout - optimized with useCallback
  // Update the logout function in Messenger.jsx
  const logout = useCallback(() => {
    // Clear Google client-side session
    googleLogout(); // From @react-oauth/google

    // Clear Redux authentication state
    dispatch(userLogout());

    // Clear localStorage tokens
    localStorage.removeItem("authToken");

    // Clear socket.io connection
    if (socket.current) {
      socket.current.emit("logout", myInfo?.id);
      socket.current.disconnect();
    }

    // Redirect to login page
    navigate("/messenger/login");
  }, [dispatch, myInfo?.id, navigate]);

  // Search functionality - optimized with useCallback
  const search = useCallback(
    (e) => {
      const searchTerm = e.target.value.toLowerCase();

      if (activeTab === "friends") {
        const getFriendClass = document.getElementsByClassName("hover-friend");
        const frienNameClass = document.getElementsByClassName("Fd_name");

        for (
          let i = 0;
          i < getFriendClass.length && i < frienNameClass.length;
          i++
        ) {
          const text = frienNameClass[i].innerText.toLowerCase();
          getFriendClass[i].style.display = text.includes(searchTerm)
            ? ""
            : "none";
        }
      } else {
        const getGroupClass = document.getElementsByClassName("hover-group");
        const groupNameClass = document.getElementsByClassName("group-name");

        for (
          let i = 0;
          i < getGroupClass.length && i < groupNameClass.length;
          i++
        ) {
          const text = groupNameClass[i].innerText.toLowerCase();
          getGroupClass[i].style.display = text.includes(searchTerm)
            ? ""
            : "none";
        }
      }
    },
    [activeTab]
  );

  // Toggle group members - optimized with useCallback
  const handleGroupMemberToggle = useCallback((id) => {
    setGroupMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  }, []);

  // Handle group image change - optimized with useCallback
  const handleGroupImageChange = useCallback((e) => {
    if (!e.target.files.length) return;

    const file = e.target.files[0];
    setGroupImage(file);

    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  }, []);

  // Create group - optimized with useCallback
  const handleCreateGroup = useCallback(
    (e) => {
      e.preventDefault();

      if (!groupName || !groupMembers.length) {
        toast.error("Group name and at least one member are required");
        return;
      }

      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("members", JSON.stringify(groupMembers));
      if (groupImage) formData.append("image", groupImage);

      dispatch(createGroup(formData))
        .then(() => {
          setShowCreateGroup(false);
          setGroupName("");
          setGroupMembers([]);
          setGroupImage(null);
          setPreviewImage("");
          toast.success("Group created successfully!");
        })
        .catch((err) => {
          toast.error(err.message || "Failed to create group");
        });
    },
    [dispatch, groupImage, groupMembers, groupName]
  );

  const sendChatbotMsg = useCallback((e) => {
    e.preventDefault();
    if (!socket.current || !newMessage) return;
    
    sendingSPlay();
    
    // Emit event to socket for chatbot interaction
    socket.current.emit('sendChatbotMessage', {
      userId: myInfo?.id,
      message: newMessage || '❤',
      token: localStorage.getItem('authToken')
    });
    
    // Add message to local state
    dispatch({
      type: 'SOCKET_CHATBOT_MESSAGE',
      payload: {
        message: {
          role: 'user',
          content: newMessage || '❤',
          timestamp: new Date()
        }
      }
    });
    
    setNewMessage('');
  }, [dispatch, myInfo?.id, newMessage, sendingSPlay]);
  const clearChatbot = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      dispatch(clearChatbotConversation());
    }
  }, [dispatch]);
  
  // Load chatbot messages
  useEffect(() => {
    if (showChatbot) {
      dispatch(getChatbotMessages());
    }
  }, [dispatch, showChatbot]);
    

  const handleVideoCall = useCallback((friend) => {
    if (!friend || !socket.current) return;
    
    // Check if user is already in a call
    if (videoCallModal || callStatus) {
      toast.error('You are already in a call');
      return;
    }
  
    // Set up call info
    const callId = `${myInfo.id}-${friend._id}-${Date.now()}`;
    setVideoCallInfo({
      callId,
      receiverId: friend._id,
      receiverName: friend.userName,
      isInitiator: true,
    });
    
    setCallStatus('connecting');
    setVideoCallModal(true);
  
    // Emit socket event
    socket.current.emit("initiateVideoCall", {
      callerId: myInfo.id,
      receiverId: friend._id,
      callerInfo: {
        name: myInfo.userName,
        image: myInfo.image,
      },
      callId
    });
  }, [myInfo, socket, videoCallModal, callStatus]);
  const handleEndCall = useCallback(() => {
    if (videoCallInfo && socket.current) {
      socket.current.emit("endVideoCall", { callId: videoCallInfo.callId });
    }
    setVideoCallModal(false);
    setVideoCallInfo(null);
    setCallStatus(null);
  }, [videoCallInfo]);

  return (
    <div className={themeMood === "dark" ? "messenger theme" : "messenger"}>
      <Toaster
        position={"top-right"}
        reverseOrder={false}
        toastOptions={{
          style: { fontSize: "18px" },
        }}
      />
      <div className="row">
        {sidebarOpen && (
          <div className="col-3">
            <div className="left-side">
              <div className="top">
                <div className="image-name">
                  <div className="image">
                    <img
                      src={${BACKEND_URL}/image/`${myInfo?.image}`}
                      alt=""
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/image/default-profile-picture1.png";
                      }}
                    />
                  </div>
                  <div className="name">
                    <h3>{myInfo?.userName}</h3>
                  </div>
                </div>
                <div className="icons">
                  <div onClick={() => setHide(!hide)} className="icon">
                    <FaEllipsisH />
                  </div>
                  <div className="icon" onClick={() => setSidebarOpen(false)}>
                    <FaEdit />
                  </div>
                  <div className={hide ? "theme_logout" : "theme_logout show"}>
                    <h3>Dark Mode</h3>
                    <div className="on">
                      <label htmlFor="dark">ON</label>
                      <input
                        onChange={(e) => dispatch(themeSet(e.target.value))}
                        type="radio"
                        value="dark"
                        name="theme"
                        id="dark"
                        checked={themeMood === "dark"}
                      />
                    </div>
                    <div className="of">
                      <label htmlFor="white">OFF</label>
                      <input
                        onChange={(e) => dispatch(themeSet(e.target.value))}
                        type="radio"
                        value="white"
                        name="theme"
                        id="white"
                        checked={themeMood === "white"}
                      />
                    </div>
                    <div onClick={logout} className="logout">
                      <FaSignOutAlt /> Logout
                    </div>
                  </div>
                </div>
              </div>
              <div className="friend-search">
                <div className="search">
                  <button>
                    <FaSistrix />
                  </button>
                  <input
                    onChange={search}
                    type="text"
                    placeholder="Search"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="tabs">
                <div
                  className={activeTab === "friends" ? "tab active" : "tab"}
                  onClick={() =>{ setActiveTab("friends")
                    setShowChatbot(false);
                  }}
                >
                  <FaUserFriends /> Friends
                </div>
                <div
                  className={activeTab === "groups" ? "tab active" : "tab"}
                  onClick={() => {setActiveTab("groups")
                    setShowChatbot(false);
                  }}
                >
                  <FaUsers /> Groups
                </div>
                <div
    className={showChatbot ? "tab active" : "tab"}
    onClick={() => {
      setActiveTab("");
      setShowChatbot(true);
      setCurrentFriend(null);
      setCurrentGroup(null);
    }}
  >
    <BsRobot /> AI Assistant
  </div>
              </div>
              {activeTab === "friends" ? (
                <div className="friends">
                  {friends && friends.length > 0
                    ? friends.map((fd) => (
                        <div
                          key={fd.fndInfo._id}
                          onClick={() => {
                            setCurrentFriend(fd.fndInfo);
                            setCurrentGroup(null);
                          }}
                          className={
                            currentfriend &&
                            currentfriend._id === fd.fndInfo._id
                              ? "hover-friend active"
                              : "hover-friend"
                          }
                        >
                          <Friends
                            activeUser={activeUser}
                            myId={myInfo?.id}
                            friend={fd}
                          />
                        </div>
                      ))
                    : "No Friends"}
                </div>
              ) : (
                <div className="groups">
                  <div className="create-group">
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="btn create-group-btn"
                    >
                      <FaPlusCircle /> Create Group
                    </button>
                  </div>
                  {groups && groups.length > 0
                    ? groups.map((group) => (
                        <div
                          key={group._id}
                          onClick={() => {
                            setCurrentGroup(group);
                            setCurrentFriend(null);
                          }}
                          className={
                            currentGroup && currentGroup._id === group._id
                              ? "hover-group active"
                              : "hover-group"
                          }
                        >
                          <Group
                            group={group}
                            setCurrentGroup={setCurrentGroup}
                            currentGroup={currentGroup}
                          />
                        </div>
                      ))
                    : "No Groups"}
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={sidebarOpen ? "col-9" : "col-12"}
          style={{
            width: sidebarOpen ? "75%" : "100%",
            position: "relative",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {!sidebarOpen && (
            <button
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                zIndex: 1000,
                background: themeMood === "dark" ? "#333" : "#fff",
                color: themeMood === "dark" ? "#fff" : "#333",
                border: "none",
                borderRadius: "50%",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                cursor: "pointer",
                transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
              }}
              onClick={() => setSidebarOpen(true)}
              title="Show Sidebar"
            >
              <FaBars />
            </button>
          )}
          {currentfriend ? (
            <RightSide
              currentfriend={currentfriend}
              inputHendle={inputHandle}
              newMessage={newMessage || ""}
              sendMessage={sendMessage}
              message={message}
              scrollRef={scrollRef}
              emojiSend={emojiSend}
              ImageSend={ImageSend}
              activeUser={activeUser}
              typingMessage={typingMessage}
              handleVideoCall={handleVideoCall}
            />
          ) : currentGroup ? (
            <div className="right-side">
              <div className="row">
                <div className="col-8">
                  <div className="message-send-show">
                    <div className="header">
                      <div className="image-name">
                        <div className="image">
                          <img
                            src={${BACKEND_URL}/image/`${
                              currentGroup?.image || "default-group.png"
                            }`}
                            alt=""
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/image/default-profile-picture1.png";
                            }}
                          />
                        </div>
                        <div className="name">
                          <h3>{currentGroup?.name}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="message-show">
                      {groupMessages && groupMessages.length > 0 ? (
                        groupMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            ref={
                              idx === groupMessages.length - 1
                                ? scrollRef
                                : null
                            }
                            className={
                              msg.senderId === myInfo?.id
                                ? "my-message"
                                : "fd-message"
                            }
                          >
                            {msg.senderId !== myInfo?.id && (
                              <div className="image-message-time">
                                <img
                                  src={${BACKEND_URL}/image/`default-profile-picture1.png`}
                                  alt=""
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "/image/default-profile-picture1.png";
                                  }}
                                />
                                <div className="message-time">
                                  <div className="fd-name">
                                    <h4>{msg.senderName}</h4>
                                  </div>
                                  <div className="fd-text">
                                    <p className="message-text">
                                      {msg.message.text === "" ? (
                                        <img
                                          src={${BACKEND_URL}/image/`${msg.message.image}`}
                                          alt=""
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "/image/default-profile-picture1.png";
                                          }}
                                        />
                                      ) : (
                                        msg.message.text
                                      )}
                                    </p>
                                  </div>
                                  <div className="time">
                                    {msg.createdAt &&
                                      new Date(
                                        msg.createdAt
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                  </div>
                                </div>
                              </div>
                            )}
                            {msg.senderId === myInfo?.id && (
                              <>
                                <div className="image-message">
                                  <div className="my-text">
                                    <p className="message-text">
                                      {msg.message.text === "" ? (
                                        <img
                                          src={${BACKEND_URL}/image/`${msg.message.image}`}
                                          alt=""
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "/image/default-profile-picture1.png";
                                          }}
                                        />
                                      ) : (
                                        msg.message.text
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="time">
                                  {msg.createdAt &&
                                    new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" }
                                    )}
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="group-welcome">
                          <img
                            src={${BACKEND_URL}/image/`${
                              currentGroup?.image || "default-group.png"
                            }`}
                            alt=""
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/image/default-profile-picture1.png";
                            }}
                          />
                          <h3>Welcome to {currentGroup?.name}</h3>
                          <p>
                            This is the beginning of your group chat history
                          </p>
                        </div>
                      )}
                      {groupTypingMessage &&
                        groupTypingMessage.senderId !== myInfo?.id &&
                        currentGroup &&
                        groupTypingMessage.groupId === currentGroup._id &&
                        groupTypingMessage.msg && ( // Added msg check to prevent empty state
                          <div className="typing-message">
                            <div className="fd-message">
                              <div className="image-message-time">
                                <img
                                  src={${BACKEND_URL}/image/`${
                                    groupTypingMessage.senderImage ||
                                    "default-profile-picture1.png"
                                  }`}
                                  alt="typing user"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "/image/default-profile-picture1.png";
                                  }}
                                />
                                <div className="message-time">
                                  <div className="fd-text">
                                    <p className="message-text typing-animation">
                                      {groupTypingMessage.senderName} is typing
                                      <span className="dot1">.</span>
                                      <span className="dot2">.</span>
                                      <span className="dot3">.</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="message-send-section">
                      <input type="checkbox" id="emoji-group" />
                      <div className="file hover-attachment">
                        <div className="add-attachment">Add Attachment</div>
                        <FaPlusCircle />
                      </div>
                      <div className="file hover-image">
                        <div className="add-image">Add Image</div>
                        <input
                          onChange={ImageSend}
                          type="file"
                          id="group-pic"
                          className="hidden-file-input"
                          accept="image/*"
                        />
                        <label htmlFor="group-pic">
                          <FaFileImage />
                        </label>
                      </div>
                      <div className="file hover-gift">
                        <div className="add-gift">Add Gift</div>
                        <FaGift />
                      </div>
                      <div className="message-type">
                        <input
                          type="text"
                          onChange={inputHandle}
                          onBlur={() => {
                            if (socket.current && currentGroup) {
                              socket.current.emit("typingGroupMessage", {
                                senderId: myInfo?.id,
                                groupId: currentGroup._id,
                                msg: "",
                              });
                            }
                          }}
                          name="message"
                          id="message"
                          placeholder="Aa"
                          className="form-control"
                          value={newMessage || ""}
                        />

                        <div className="file hover-gift">
                          <label htmlFor="emoji-group">❤️</label>
                        </div>
                      </div>
                      <div onClick={sendMessage} className="file send-button">
                        <FaPaperPlane />
                      </div>
                      <div className="emoji-section">
                        <div className="emoji">
                          {emojis.map((e, index) => (
                            <span key={index} onClick={() => emojiSend(e)}>
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="group-info">
                    <div className="image-name">
                      <div className="image">
                        <img
                          src={${BACKEND_URL}/image/`${
                            currentGroup?.image || "default-group.png"
                          }`}
                          alt=""
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "/image/default-profile-picture1.png";
                          }}
                        />
                      </div>
                      <div className="name">
                        <h4>{currentGroup?.name}</h4>
                        <p>{currentGroup?.members?.length || 0} members</p>
                      </div>
                    </div>
                    <div className="members">
                      <h3>Members</h3>
                      <div className="member-list">
                        {currentGroup?.members?.map((memberId) => {
                          const member = friends?.find(
                            (f) => f.fndInfo._id === memberId
                          );
                          return member ? (
                            <div key={memberId} className="member">
                              <div className="member-image">
                                <img
                                  src={${BACKEND_URL}/image/`${member.fndInfo.image}`}
                                  alt=""
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "/image/default-profile-picture1.png";
                                  }}
                                />
                              </div>
                              <div className="member-name">
                                <h4>{member.fndInfo.userName}</h4>
                                {currentGroup.admin === memberId && (
                                  <span className="admin-badge">Admin</span>
                                )}
                              </div>
                            </div>
                          ) : memberId === myInfo?.id ? (
                            <div key={memberId} className="member">
                              <div className="member-image">
                                <img
                                  src={${BACKEND_URL}/image/`${myInfo.image}`}
                                  alt=""
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "/image/default-profile-picture1.png";
                                  }}
                                />
                              </div>
                              <div className="member-name">
                                <h4>{myInfo.userName} (You)</h4>
                                {currentGroup.admin === memberId && (
                                  <span className="admin-badge">Admin</span>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) :showChatbot ? (
            <ChatBot
              inputHendle={inputHandle}
              newMessage={newMessage || ""}
              sendMessage={sendChatbotMsg}
              messages={chatbotMessages}
              scrollRef={scrollRef}
              emojiSend={emojiSend}
              ImageSend={ImageSend}
              clearChatbot={clearChatbot}
              myInfo={myInfo}
            />
          ): (
            <div className="right-side">
              <div className="no-chat-selected">
                <div className="content">
                  <img src="/image/chat-placeholder.png" alt="" />
                  <h2>Welcome to your messenger</h2>
                  <p>Select a friend or group to start chatting</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showCreateGroup && (
        <div className="create-group-modal">
          <div className="create-group-content">
            <div className="create-group-header">
              <h3>Create New Group</h3>
              <button onClick={() => setShowCreateGroup(false)}>×</button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="create-group-body">
                <div className="form-group">
                  <label>Group Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Select Friends</label>
                  <div className="friend-select-list">
                    {friends &&
                      friends.map((fd) => (
                        <div
                          key={fd.fndInfo._id}
                          className="friend-select-item"
                        >
                          <input
                            type="checkbox"
                            id={`friend-${fd.fndInfo._id}`}
                            checked={groupMembers.includes(fd.fndInfo._id)}
                            onChange={() =>
                              handleGroupMemberToggle(fd.fndInfo._id)
                            }
                          />
                          <label htmlFor={`friend-${fd.fndInfo._id}`}>
                            <img
                              src={${BACKEND_URL}/image/`${fd.fndInfo.image}`}
                              alt=""
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "/image/default-profile-picture1.png";
                              }}
                            />
                            <span>{fd.fndInfo.userName}</span>
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Group Image (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleGroupImageChange}
                    accept="image/*"
                  />
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        marginTop: 10,
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="create-group-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="btn cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn create-btn"
                  disabled={!groupName || groupMembers.length === 0}
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {videoCallModal && videoCallInfo && (
        <VideoCall
          callInfo={videoCallInfo}
          socket={socket}
          myInfo={myInfo}
          onClose={handleEndCall}
        />
      )}
      {/* After your current friend and group rendering conditions, add this: */}
{showChatbot && (
  <ChatBot
    inputHendle={inputHandle}
    newMessage={newMessage || ""}
    sendMessage={sendChatbotMsg}
    messages={chatbotMessages}
    scrollRef={scrollRef}
    emojiSend={emojiSend}
    ImageSend={ImageSend}
    clearChatbot={clearChatbot}
    myInfo={myInfo}
  />
)}

    </div>
  );
};

export default Messenger;
