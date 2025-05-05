import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaSync, FaDesktop, FaChalkboard, FaTimes, FaUndo, FaRedo, FaFont, FaSquare, FaCircle, FaArrowUp, FaImage, FaFileDownload } from 'react-icons/fa';
const VideoCall = ({ callInfo, socket, myInfo, onClose }) => {
  // Existing state and refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  const [errorMessage, setErrorMessage] = useState('');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const screenStreamRef = useRef(null);
  const originalVideoStreamRef = useRef(null);

  // ICE Configuration
  const getIceConfiguration = useCallback(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      {
        urls: 'turn:numb.viagenie.ca',
        username: 'webrtc@live.com',
        credential: 'muazkh'
      }
    ],
    iceCandidatePoolSize: 10
  }), []);

  // Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        originalVideoStreamRef.current = localStreamRef.current?.getVideoTracks()[0];
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: true
        });

        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (sender) {
          await sender.replaceTrack(screenVideoTrack);
          screenStreamRef.current = screenStream;
          
          if (localVideoRef.current) {
            const combinedStream = new MediaStream([
              ...localStreamRef.current.getAudioTracks(),
              screenVideoTrack
            ]);
            localVideoRef.current.srcObject = combinedStream;
          }

          screenVideoTrack.onended = () => toggleScreenShare();
          setIsScreenSharing(true);
        }
      } else {
        const sender = peerConnectionRef.current.getSenders()
          .find(s => s.track?.kind === 'video');

        if (sender && originalVideoStreamRef.current) {
          await sender.replaceTrack(originalVideoStreamRef.current);
          
          if (localVideoRef.current) {
            const originalStream = new MediaStream([
              ...localStreamRef.current.getAudioTracks(),
              originalVideoStreamRef.current
            ]);
            localVideoRef.current.srcObject = originalStream;
          }

          screenStreamRef.current?.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        }
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      setIsScreenSharing(false);
      if (error.name !== 'NotAllowedError') {
        setErrorMessage('Failed to share screen. Please try again.');
      }
    }
  }, [isScreenSharing]);

  // Peer Connection
  const createPeerConnection = useCallback(() => {
    try {
      const configuration = getIceConfiguration();
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        setConnectionState(pc.iceConnectionState);
        if (['failed', 'disconnected'].includes(pc.iceConnectionState)) {
          setErrorMessage('Connection lost. Attempting to reconnect...');
          setTimeout(() => tryReconnect(), 2000);
        }
      };

      pc.onsignalingstatechange = () => {
        console.log('Signaling state:', pc.signalingState);
      };

      return pc;
    } catch (error) {
      console.error('Failed to create PeerConnection:', error);
      setErrorMessage('Failed to create peer connection. Please try again.');
      return null;
    }
  }, [getIceConfiguration]);

  // Reconnect Logic
  const tryReconnect = useCallback(() => {
    setIsReconnecting(true);
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    
    const pc = createPeerConnection();
    if (!pc) {
      setIsReconnecting(false);
      return;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }
    
    socket.current?.emit('videoCallReconnect', {
      callId: callInfo.callId,
      participantId: callInfo.isInitiator ? callInfo.receiverId : callInfo.callerId
    });
    setIsReconnecting(false);
  }, [callInfo, createPeerConnection, socket]);

  // WebRTC Setup
  useEffect(() => {
    let cleanupSocketListeners = null;
    let cleanupCalled = false;

    const setupCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        localStreamRef.current = stream;
        originalVideoStreamRef.current = stream.getVideoTracks()[0];
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = createPeerConnection();
        if (!pc) return;

        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socket.current?.connected) {
            socket.current.emit('videoCallIceCandidate', {
              callId: callInfo.callId,
              candidate: event.candidate,
              targetId: callInfo.isInitiator ? callInfo.receiverId : callInfo.callerId
            });
          }
        };

        if (callInfo.isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.current.emit('videoCallOffer', {
            callId: callInfo.callId,
            offer: pc.localDescription,
            receiverId: callInfo.receiverId
          });
        }

        const setupSocketListeners = (pc) => {
          const handleOfferReceived = async (data) => {
            await pc.setRemoteDescription(data.offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.current.emit('videoCallAnswer', {
              callId: data.callId,
              answer: pc.localDescription,
              callerId: callInfo.callerId
            });
          };

          const handleAnswerReceived = async (data) => {
            await pc.setRemoteDescription(data.answer);
          };

          const handleIceCandidateReceived = (data) => {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          };

          socket.current.on('videoCallOfferReceived', handleOfferReceived);
          socket.current.on('videoCallAnswered', handleAnswerReceived);
          socket.current.on('videoCallIceCandidateReceived', handleIceCandidateReceived);

          return () => {
            socket.current.off('videoCallOfferReceived', handleOfferReceived);
            socket.current.off('videoCallAnswered', handleAnswerReceived);
            socket.current.off('videoCallIceCandidateReceived', handleIceCandidateReceived);
          };
        };

        cleanupSocketListeners = setupSocketListeners(pc);

      } catch (error) {
        console.error("Error in call setup:", error);
        setErrorMessage(`Call setup failed: ${error.message}`);
      }
    };

    setupCall();

    return () => {
      if (cleanupCalled) return;
      cleanupCalled = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [callInfo, socket, createPeerConnection]);

  // Control Handlers
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff(!isVideoOff);
  }, [isVideoOff]);

  const endCall = useCallback(() => {
    socket.current?.emit('endVideoCall', { callId: callInfo.callId });
    onClose();
  }, [callInfo, onClose, socket]);

  // Close whiteboard handler
  const closeWhiteboard = useCallback(() => {
    setShowWhiteboard(false);
  }, []);

  return (
    <div className="video-call-modal">
      <div className="video-call-container">
        {errorMessage && (
          <div className="error-banner">
            <p>{errorMessage}</p>
            {['failed', 'disconnected'].includes(connectionState) && (
              <button onClick={tryReconnect} className="reconnect-btn">
                <FaSync /> Reconnect
              </button>
            )}
          </div>
        )}

        <div className="connection-status">
          {connectionState === 'checking' && 'Connecting...'}
          {connectionState === 'connected' && 'Connected'}
          {isReconnecting && 'Reconnecting...'}
        </div>

        <div className="video-grid">
          <div className="video-box local-video">
            <video ref={localVideoRef} autoPlay playsInline muted />
            <div className="video-label">You</div>
            {isScreenSharing && (
              <div className="screen-sharing-indicator">Screen Sharing</div>
            )}
          </div>
          <div className="video-box remote-video">
            <video ref={remoteVideoRef} autoPlay playsInline />
            <div className="video-label">{callInfo.callerName || 'Caller'}</div>
          </div>
        </div>

        <div className="call-controls">
          <button onClick={toggleMute} className={`control-btn ${isMuted ? 'active' : ''}`}>
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button onClick={toggleVideo} className={`control-btn ${isVideoOff ? 'active' : ''}`}>
            {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
          </button>
          <button onClick={toggleScreenShare} className={`control-btn ${isScreenSharing ? 'active' : ''}`}>
            <FaDesktop />
          </button>
          <button 
            onClick={() => setShowWhiteboard(!showWhiteboard)} 
            className={`control-btn ${showWhiteboard ? 'active' : ''}`}
          >
            <FaChalkboard />
          </button>
          <button onClick={endCall} className="end-call-btn">
            <FaPhoneSlash />
          </button>
        </div>

        {showWhiteboard && (
          <div className="whiteboard-overlay">
            <Whiteboard 
              socket={socket.current} 
              callId={callInfo.callId} 
              onClose={closeWhiteboard}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Whiteboard = ({ socket, callId, onClose, localUserId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('pen');
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isTextMode, setIsTextMode] = useState(false);
  const [startPos, setStartPos] = useState(null);

  const snapshotStackRef = useRef([]);
  const textInputRef = useRef(null);
  const textPositionRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    // Save initial state
    saveSnapshot();
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    const snapshot = ctxRef.current.getImageData(0, 0, canvas.width, canvas.height);
    snapshotStackRef.current = [...snapshotStackRef.current.slice(-50), snapshot];
    setHistory(prev => [...prev.slice(-50), snapshot]);
    setRedoStack([]);
  };

  const drawFromData = (data) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    
    switch(data.tool) {
      case 'pen':
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.lineWidth;
        ctx.moveTo(data.start.x, data.start.y);
        ctx.lineTo(data.end.x, data.end.y);
        ctx.stroke();
        break;
        
      case 'rect':
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.lineWidth;
        ctx.strokeRect(
          data.start.x, data.start.y,
          data.end.x - data.start.x,
          data.end.y - data.start.y
        );
        break;
        
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(data.end.x - data.start.x, 2) +
          Math.pow(data.end.y - data.start.y, 2)
        );
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.lineWidth;
        ctx.beginPath();
        ctx.arc(data.start.x, data.start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
        
      case 'text':
        ctx.fillStyle = data.color;
        ctx.font = `${data.lineWidth * 2}px Arial`;
        ctx.fillText(data.text, data.x, data.y);
        break;
      default:
       
    }
  };

  // Socket handlers
  useEffect(() => {
    const handleRemoteDraw = (data) => {
      if (data.userId === localUserId) return;
      drawFromData(data);
      saveSnapshot();
    };

    const handleRemoteClear = () => {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveSnapshot();
    };

    const handleUndoRedo = ({ type, snapshot }) => {
      if (type === 'undo') {
        ctxRef.current.putImageData(snapshot, 0, 0);
      }
    };

    socket.on('whiteboard-draw', handleRemoteDraw);
    socket.on('whiteboard-clear', handleRemoteClear);
    socket.on('whiteboard-history', handleUndoRedo);

    return () => {
      socket.off('whiteboard-draw', handleRemoteDraw);
      socket.off('whiteboard-clear', handleRemoteClear);
      socket.off('whiteboard-history', handleUndoRedo);
    };
  }, [localUserId, socket]);

  // Drawing handlers
  const startDrawing = (e) => {
    if (isTextMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setIsDrawing(true);
    setStartPos(pos);
    
    if (tool === 'pen') {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    if (!isDrawing || isTextMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    switch(tool) {
      case 'pen':
        ctxRef.current.lineTo(currentPos.x, currentPos.y);
        ctxRef.current.stroke();
        break;
        
      case 'rect':
      case 'circle':
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.putImageData(snapshotStackRef.current.slice(-1)[0], 0, 0);
        drawFromData({
          tool,
          start: startPos,
          end: currentPos,
          color,
          lineWidth
        });
        break;
      default:

    }
  };
  const getCurrentPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  
  const endDrawing = (e) => {
    if (!isDrawing) return;
    
    const data = {
      tool,
      color,
      lineWidth,
      start: startPos,
      
      end: getCurrentPos(e),
      userId: localUserId
    };
    
    socket.emit('whiteboard-draw', { callId, ...data });
    saveSnapshot();
    setIsDrawing(false);
  };

  // Text handling
  const addText = (e) => {
    if (!isTextMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    textPositionRef.current = { x, y };
    textInputRef.current.style.display = 'block';
    textInputRef.current.style.left = `${x}px`;
    textInputRef.current.style.top = `${y}px`;
    textInputRef.current.focus();
  };

  const finalizeText = () => {
    if (!text.trim()) return;
    
    const data = {
      tool: 'text',
      text,
      x: textPositionRef.current.x,
      y: textPositionRef.current.y,
      color,
      lineWidth,
      userId: localUserId
    };
    
    socket.emit('whiteboard-draw', { callId, ...data });
    drawFromData(data);
    saveSnapshot();
    
    setText('');
    textInputRef.current.style.display = 'none';
    setIsTextMode(false);
  };

  // History management
  const undo = () => {
    if (history.length < 2) return;
    
    const prevSnapshot = history[history.length - 2];
    setRedoStack([...redoStack, snapshotStackRef.current.pop()]);
    setHistory(history.slice(0, -1));
    
    ctxRef.current.putImageData(prevSnapshot, 0, 0);
    socket.emit('whiteboard-history', { 
      callId,
      type: 'undo',
      snapshot: prevSnapshot
    });
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextSnapshot = redoStack[redoStack.length - 1];
    setHistory([...history, nextSnapshot]);
    setRedoStack(redoStack.slice(0, -1));
    
    ctxRef.current.putImageData(nextSnapshot, 0, 0);
    socket.emit('whiteboard-history', { 
      callId,
      type: 'redo',
      snapshot: nextSnapshot
    });
  };

  // Export handling
  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <button className="whiteboard-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="whiteboard-tools">
        <div className="tool-group">
          <button onClick={() => setTool('pen')} className={tool === 'pen' ? 'active' : ''}>
            <FaArrowUp />
          </button>
          <button onClick={() => setTool('rect')} className={tool === 'rect' ? 'active' : ''}>
            <FaSquare />
          </button>
          <button onClick={() => setTool('circle')} className={tool === 'circle' ? 'active' : ''}>
            <FaCircle />
          </button>
          <button onClick={() => setIsTextMode(!isTextMode)} className={isTextMode ? 'active' : ''}>
            <FaFont />
          </button>
        </div>

        <div className="tool-group">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
        </div>

        <div className="tool-group">
          <button onClick={undo} disabled={history.length < 2}>
            <FaUndo />
          </button>
          <button onClick={redo} disabled={redoStack.length === 0}>
            <FaRedo />
          </button>
          <button onClick={exportImage}>
            <FaFileDownload />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={isTextMode ? addText : startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />

      <input
        ref={textInputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={finalizeText}
        onKeyPress={(e) => e.key === 'Enter' && finalizeText()}
        style={{
          display: 'none',
          position: 'absolute',
          background: '#e0e5ec',
          border: 'none',
          padding: '5px',
          borderRadius: '4px',
          boxShadow: '2px 2px 5px #a3b1c6, -2px -2px 5px #ffffff'
        }}
      />
    </div>
  );
};

export default VideoCall;