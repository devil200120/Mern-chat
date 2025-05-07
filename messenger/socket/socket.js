const Group = require('../backend/models/groupModel');

let users = [];
let activeVideoCalls = new Map(); // Track active video calls
 // Track active video calls
const CALL_TIMEOUT = 45000; // 45 seconds
const MAX_CALL_DURATION = 3600000; // 1 hour - prevents zombie calls

module.exports = function(io) {
  // Debug middleware to log incoming and outgoing socket events
  io.use((socket, next) => {
    const originalOnEvent = socket.onevent;
    socket.onevent = function(packet) {
      const args = packet.data || [];
      console.log(`[${new Date().toISOString()}] INCOMING [${socket.id}]:`, args);
      originalOnEvent.call(this, packet);
    };

    const originalEmit = socket.emit;
    socket.emit = function(event, ...args) {
      if (event !== 'newListener') {
        console.log(`[${new Date().toISOString()}] OUTGOING [${socket.id}]: ${event}`, JSON.stringify(args));
      }
      return originalEmit.apply(this, [event, ...args]);
    };

    next();
  });

  // --- User management helpers ---
  const addUser = (userId, socketId, userInfo) => {
    users = users.filter(u => u.userId !== userId);
    users.push({ userId, socketId, userInfo });
    console.log('Current users:', users);
  };

  const userRemove = (socketId) => {
    users = users.filter(u => u.socketId !== socketId);
    console.log('User removed. Current users:', users);
  };

  const findFriend = (id) => {
    const user = users.find(u => u.userId === id);
    return user;
  };

  const userLogout = (userId) => {
    users = users.filter(u => u.userId !== userId);
    console.log('User logged out. Current users:', users);
  };

  // --- Video call helpers ---
  

  const createCallId = (callerId, receiverId) => {
    return `${callerId}-${receiverId}-${Date.now()}`;
  };

  const endActiveCall = (callId, reason = 'ended') => {
    if (activeVideoCalls.has(callId)) {
      const call = activeVideoCalls.get(callId);
      
      // Log call stats
      const callDuration = call.answerTime 
        ? (new Date() - call.answerTime) / 1000 
        : 0;
      console.log(`Call ${callId} ${reason}. Duration: ${callDuration.toFixed(1)}s`);
      
      // Notify all participants that call has ended
      if (call.caller) {
        const callerSocket = findFriend(call.caller);
        if (callerSocket) {
          io.to(callerSocket.socketId).emit('videoCallEnded', { 
            callId, 
            reason,
            duration: callDuration 
          });
        }
      }
      
      if (call.receiver) {
        const receiverSocket = findFriend(call.receiver);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('videoCallEnded', { 
            callId, 
            reason,
            duration: callDuration 
          });
        }
      }
      
      // Clean up timeouts
      if (call.timeoutId) clearTimeout(call.timeoutId);
      if (call.maxDurationTimeoutId) clearTimeout(call.maxDurationTimeoutId);
      
      activeVideoCalls.delete(callId);
    }
  };


  // --- Main socket logic ---
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('addUser', (userId, userInfo) => {
      addUser(userId, socket.id, userInfo);
      io.emit('getUser', users);

      const otherUsers = users.filter(u => u.userId !== userId);
      otherUsers.forEach(u => {
        io.to(u.socketId).emit('new_user_add', 'new_user_add');
      });
    });

    socket.on('sendMessage', (data) => {
      const user = findFriend(data.reseverId);
      if (user) {
        io.to(user.socketId).emit('getMessage', data);
        io.to(socket.id).emit('messageDelivered', {
          messageId: data._id || Date.now(),
          reseverId: data.reseverId,
          status: 'delivered'
        });
      }
    });

    socket.on('sendGroupMessage', async (data) => {
      socket.join(`group_${data.groupId}`);
      io.to(`group_${data.groupId}`).emit('getGroupMessage', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('joinGroup', (groupId) => {
      if (groupId) {
        socket.join(`group_${groupId}`);
      }
    });

    socket.on('leaveGroup', (groupId) => {
      if (groupId) {
        socket.leave(`group_${groupId}`);
      }
    });

    socket.on('messageSeen', msg => {
      const user = findFriend(msg.senderId);
      if (user) {
        io.to(user.socketId).emit('msgSeenResponse', msg);
      }
    });

    socket.on('deliveredMessage', msg => {
      const user = findFriend(msg.senderId);
      if (user) {
        io.to(user.socketId).emit('msgDeliveredResponse', msg);
      }
    });

    socket.on('seen', data => {
      const user = findFriend(data.senderId);
      if (user) {
        io.to(user.socketId).emit('seenSuccess', data);
      }
    });

    socket.on('typingMessage', (data) => {
      const user = findFriend(data.reseverId);
      if (user) {
        io.to(user.socketId).emit('typingMessageGet', {
          senderId: data.senderId,
          reseverId: data.reseverId,
          msg: data.msg
        });
      }
    });

    socket.on('typingGroupMessage', (data) => {
      if (data.groupId) {
        socket.to(`group_${data.groupId}`).emit('typingGroupMessageGet', {
          senderId: data.senderId,
          groupId: data.groupId,
          senderName: data.senderName || '',
          msg: data.msg
        });
      }
    });
    // Inside the io.on('connection', (socket) => {}) handler
socket.on('sendChatbotMessage', async (data) => {
  try {
    const { message, userId } = data;
    const user = findFriend(userId);
    
    // Make internal HTTP request to chatbot API
    const axios = require('axios');
    const response = await axios.post('https://mern-chat-application-nlxu.onrender.com/api/messenger/chatbot/send-message', 
      { message },
      { 
        headers: { 
          Cookie: `authToken=${data.token}` 
        } 
      }
    );
    
    if (response.data.success) {
      // Send bot response back to user
      if (user) {
        io.to(user.socketId).emit('getChatbotMessage', {
          role: 'bot',
          content: response.data.message.content,
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Socket chatbot error:', error);
    if (user) {
      io.to(user.socketId).emit('getChatbotMessage', {
        senderId: 'chatbot',
        senderName: 'Assistant',
        message: {
          text: 'Sorry, I encountered an error. Please try again later.',
          image: ''
        },
        createdAt: new Date()
      });
    }
  }
});


    // --- Video Call Handlers ---
    socket.on('initiateVideoCall', (data) => {
      const { callerId, receiverId, callerInfo } = data;
      const receiver = findFriend(receiverId);
      
      if (!receiver) {
        return socket.emit('videoCallError', { 
          message: 'User is offline',
          code: 'RECEIVER_OFFLINE'
        });
      }
      let userInCall = false;
      activeVideoCalls.forEach((call) => {
        if ((call.caller === callerId || call.receiver === callerId) && 
            call.status !== 'ended') {
          userInCall = true;
        }
        if ((call.caller === receiverId || call.receiver === receiverId) && 
            call.status !== 'ended') {
          userInCall = true;
        }
      });
      
      if (userInCall) {
        return socket.emit('videoCallError', { 
          message: 'User is busy in another call',
          code: 'USER_BUSY'
        });
      }
      
      // Generate a unique call ID
      const callId = createCallId(callerId, receiverId);
      
      // Store call data with 45 second timeout for answer
      const timeoutId = setTimeout(() => {
        socket.emit('videoCallNotAnswered', { callId, receiverId });
        endActiveCall(callId, 'not_answered');
      }, CALL_TIMEOUT);
      const maxDurationTimeoutId = setTimeout(() => {
        endActiveCall(callId, 'max_duration_reached');
      }, MAX_CALL_DURATION);
      
      activeVideoCalls.set(callId, {
        callId,
        caller: callerId,
        receiver: receiverId,
        status: 'ringing',
        startTime: new Date(),
        lastActivity: new Date(),
        timeoutId,
        maxDurationTimeoutId
      });
      
      // Notify the receiver of incoming call
      io.to(receiver.socketId).emit('incomingVideoCall', {
        callId,
        callerId,
        callerInfo
      });
      
      // Confirm to caller that call is ringing
      socket.emit('videoCallRinging', {
        callId,
        receiverId
      });
      
      console.log(`Video call initiated: ${callId} from ${callerId} to ${receiverId}`);
    });
    
    socket.on('videoCallOffer', (data) => {
      const { callId, offer, receiverId } = data;
      const receiver = findFriend(receiverId);
      
      if (receiver && activeVideoCalls.has(callId)) {
        const call = activeVideoCalls.get(callId);
        call.lastActivity = new Date();
        activeVideoCalls.set(callId, call);
        
        io.to(receiver.socketId).emit('videoCallOfferReceived', {
          callId,
          offer
        });
      } else if (!activeVideoCalls.has(callId)) {
        socket.emit('videoCallError', {
          callId,
          message: 'Call no longer active',
          code: 'CALL_ENDED'
        });
      }
    });
    
    socket.on('videoCallAnswer', (data) => {
      const { callId, answer, callerId } = data;
      const caller = findFriend(callerId);
      
      if (caller && activeVideoCalls.has(callId)) {
        const call = activeVideoCalls.get(callId);
        
        // Update call status
        call.status = 'ongoing';
        call.answerTime = new Date();
        call.lastActivity = new Date();
        
        // Clear the timeout as call is answered
        if (call.timeoutId) {
          clearTimeout(call.timeoutId);
          call.timeoutId = null;
        }
        
        activeVideoCalls.set(callId, call);
        
        // Send answer to caller
        io.to(caller.socketId).emit('videoCallAnswered', {
          callId,
          answer
        });
      }
    });
    
    socket.on('videoCallIceCandidate', (data) => {
      const { callId, candidate, targetId } = data;
      const target = findFriend(targetId);
      
      if (target && activeVideoCalls.has(callId)) {
        const call = activeVideoCalls.get(callId);
        call.lastActivity = new Date();
        activeVideoCalls.set(callId, call);
        
        io.to(target.socketId).emit('videoCallIceCandidateReceived', {
          callId,
          candidate
        });
      }
    });
    socket.on('videoCallReconnect', (data) => {
      const { callId, participantId } = data;
      const participant = findFriend(participantId);
      
      if (participant && activeVideoCalls.has(callId)) {
        const call = activeVideoCalls.get(callId);
        call.lastActivity = new Date();
        call.reconnectAttempt = (call.reconnectAttempt || 0) + 1;
        activeVideoCalls.set(callId, call);
        
        io.to(participant.socketId).emit('videoCallReconnectRequest', { callId });
      } else if (!activeVideoCalls.has(callId)) {
        socket.emit('videoCallError', {
          callId,
          message: 'Cannot reconnect: call ended',
          code: 'CALL_ENDED'
        });
      }
    });
    
    
    socket.on('rejectVideoCall', (data) => {
      const { callId, callerId } = data;
      const caller = findFriend(callerId);
      
      if (caller && activeVideoCalls.has(callId)) {
        io.to(caller.socketId).emit('videoCallRejected', { callId });
        endActiveCall(callId, 'rejected');
      }
    });
    
    socket.on('endVideoCall', (data) => {
      const { callId } = data;
      if (activeVideoCalls.has(callId)) {
        endActiveCall(callId, 'user_ended');
      }
    });
    socket.on('whiteboard-draw', (data) => {
      socket.to(data.callId).emit('whiteboard-draw', data);
    });
    
    socket.on('whiteboard-clear', (data) => {
      socket.to(data.callId).emit('whiteboard-clear');
    });

    socket.on('logout', (userId) => {
      // End any active calls for this user
      activeVideoCalls.forEach((call, callId) => {
        if (call.caller === userId || call.receiver === userId) {
          endActiveCall(callId);
        }
      });
      
      userLogout(userId);
      io.emit('getUser', users);
    });

    socket.on('disconnect', () => {
      // Find user ID from socket ID
      const user = users.find(u => u.socketId === socket.id);
      
      if (user) {
        // End any active calls for this user
        activeVideoCalls.forEach((call, callId) => {
          if (call.caller === user.userId || call.receiver === user.userId) {
            endActiveCall(callId, 'participant_disconnected');
          }
        });
      }
      
      userRemove(socket.id);
      io.emit('getUser', users);
    });
  });
};
