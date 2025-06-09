import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ChatRoomModular.module.css';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { useChatService } from '../services';
import useProjectUsers from '../services/useProjectUsers';
import { collectWebRTCStats, clearStatsHistory } from '../utils/webrtcStats';

// Component imports
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ParticipantsPanel from './ParticipantsPanel';
import CreateChatModal from './CreateChatModal';
import IncomingCallNotification from './IncomingCallNotification';
import CallUI from './CallUI';
import { Contact, ChatRoom } from './types';
import { adaptServiceChatRoom } from './adapters';

const ChatRoomModular: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.user_id || 0;
  const {
    contacts: apiContacts,
    chatRooms,
    messages: apiMessages,
    loading,
    error,
    activeRoom,
    sendMessage,
    createChatRoom,
    uploadAttachment,
    setActiveChatRoom,
    setTypingStatus,
    loadMessages,
    startDirectChat,
    websocket
  } = useChatService(userId);
  
  // Lấy danh sách người dùng trong các dự án
  const { 
    projectUsers,
    loading: loadingProjectUsers,
    error: projectUsersError
  } = useProjectUsers(userId);
  // Component state
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId?: string | number; // Chấp nhận cả ID dạng chuỗi và số
    isAudioOnly: boolean;
    offer?: RTCSessionDescriptionInit;
  } | null>(null);  // State to track active call
  const [activeCall, setActiveCall] = useState<{
    targetUserId: string | number;
    roomId: string | number;
    isAudioOnly: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    peerConnection: RTCPeerConnection | null;
    isMuted: boolean;
    isVideoOff: boolean;
    connectionState: string; // Use string type to handle all RTCIceConnectionState values
    iceGatheringState: string; // Use string type to handle all RTCIceGatheringState values
    startTime?: number;
    reconnectAttempt?: number; // Track reconnection attempts
    initiator?: boolean; // Track which side initiated the call
    statsInterval?: NodeJS.Timeout; // Interval for collecting WebRTC stats
    callStats?: {
      bitrate?: number;
      packetLoss?: number;
      jitter?: number;
      roundTripTime?: number;
      qualityRating?: 'excellent' | 'good' | 'fair' | 'poor';
    };
  } | null>(null);
  
  // Create a ref for handleEndCall to break circular dependencies
  const handleEndCallRef = useRef<() => void>(() => {
    console.log('handleEndCall not yet initialized');
  });
  
  // Create wrapper function that will call the current implementation
  const handleEndCall = useCallback(() => {
    handleEndCallRef.current();
  }, []);

  // Send WebSocket signal messages for WebRTC
  const sendSignalMessage = useCallback((message: any) => {
    if (!activeRoom) {
      console.error('Cannot send signal: No active room');
      return;
    }
    
    // Make sure we send a numeric room ID to avoid format issues
    // Extract just the numeric part of the room ID to ensure consistency
    const numericRoomId = String(activeRoom.id).replace(/[^0-9]/g, '');
    
    // Keep user ID format as-is, which could be "user-1", "user-2", etc.
    const userIdString = String(userId);
    
    // Validate targetParticipantId if present
    let targetId = message.targetParticipantId;
    if (targetId && (targetId === 'undefined' || targetId === undefined)) {
      console.error('Invalid target participant ID:', targetId);
      return; // Don't proceed with invalid target IDs
    }
      // Format the message to match what the backend expects
      const websocketMessage = {
        ...message,
        roomId: numericRoomId,
        chatroom_id: numericRoomId,
        user_id: userIdString,
        userId: userIdString,
        type: message.type || 'webrtc_signal' // Ensure signal type is set
      };
      
      console.log('Sending WebRTC signal:', websocketMessage);
      
      // We're using the existing WebSocket connection from useChatService
      if (websocket && websocket.sendMessage) {      try {
          const success = websocket.sendMessage(websocketMessage);
          console.log(`WebRTC signal sent successfully: ${success}`);
          // If sending failed, retry once
          if (!success && websocket.connectionState === 'connected') {
            setTimeout(() => {
              console.log('Retrying WebRTC signal send...');
              const retrySuccess = websocket.sendMessage(websocketMessage);
              console.log(`WebRTC signal retry result: ${retrySuccess}`);
            }, 500);
          }
        } catch (error) {
          console.error('Error sending WebRTC signal:', error);
        }
      } else {
        console.error('WebSocket not available for sending signals');
      }
  }, [activeRoom, websocket, userId]);
  // Update local state when API data changes
  useEffect(() => {
    if (apiContacts && apiContacts.length > 0) {
      setContacts(apiContacts);
    }
  }, [apiContacts]);
  
  // Listen for WebRTC signals from WebSocket
  useEffect(() => {
    // Function to handle WebRTC signal events
    const handleWebRTCSignal = (event: CustomEvent) => {
      const data = event.detail;
      console.log('WebRTC signal received:', data);
      
      // Treat both roomId and chatroom_id, since the backend might use either
      const signalRoomId = data.roomId || data.chatroom_id;
      const currentRoomId = activeRoom?.id;
      
      // Debug to see if IDs match
      console.log('Signal room ID:', signalRoomId, 'Current room ID:', currentRoomId);
      console.log('Signal user ID:', data.userId || data.user_id, 'Current user ID:', userId);
      
      // Only handle signals for the current room - more flexible comparison
      // Convert both to strings for comparison to handle number/string inconsistencies
      const normalizedSignalRoomId = String(signalRoomId).replace(/[^0-9]/g, '');
      const normalizedCurrentRoomId = String(currentRoomId).replace(/[^0-9]/g, '');
      
      if (!normalizedCurrentRoomId || !normalizedSignalRoomId || normalizedSignalRoomId !== normalizedCurrentRoomId) {
        console.log('Ignoring signal - room ID mismatch');
        return;
      }
        // Don't handle your own signals
      const senderUserId = String(data.userId || data.user_id || '').trim();
      const currentUserId = String(userId || '').trim();
      
      // Log the sanitized IDs for debugging
      console.log(`Comparing signal sender ID "${senderUserId}" with current user ID "${currentUserId}"`);
      
      if (senderUserId && currentUserId && senderUserId === currentUserId) {
        console.log('Ignoring own signal');
        return;
      }        if (data.type === 'call_offer') {
        console.log('Received call offer, showing notification');
        // Handle incoming call offer
        setIncomingCall({
          callerId: data.userId || data.user_id,  // Giữ nguyên định dạng của ID
          isAudioOnly: !!data.isAudioOnly,
          offer: data.sdp
        });
      } else if (data.type === 'call_end') {
        // Handle call end
        console.log('Received call end signal');
        setIncomingCall(null);
        
        // If we have an active call, also end it
        if (activeCall) {
          handleEndCall();
        }
      } else if (data.type === 'call_rejected') {
        // Handle call rejection
        console.log('Call was rejected');
        
        // If we have an active call with the person who rejected, end it
        if (activeCall && String(activeCall.targetUserId) === String(data.userId || data.user_id)) {
          alert('Call was declined');
          handleEndCall();
        }
      } else if (data.type === 'ice_candidate' || data.type === 'call_answer') {
        console.log(`Received ${data.type} from ${data.userId || data.user_id}, re-dispatching to CallModal`);
        
        // Ensure important fields are set for both call_answer and ice_candidate
        if (data.type === 'ice_candidate' && !data.candidate) {
          console.error('Received ice_candidate without candidate data, cannot forward');
          return;
        }
        
        if (data.type === 'call_answer' && !data.sdp) {
          console.error('Received call_answer without SDP data, cannot forward');
          return;
        }
        
        // Re-dispatch the event to be handled by CallModal
        const newEvent = new CustomEvent('webrtc_signal', { detail: data });
        window.dispatchEvent(newEvent);
      }
    };

    // Add event listener
    window.addEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    };
  }, [activeRoom, userId]);

  // Reset incoming calls and messages when changing rooms
  useEffect(() => {
    if (activeRoom?.id) {
      // Clear messages and reset any incoming call notification
      setMessages([]);
      setIncomingCall(null);
      console.log('Changed room, reset messages and call status');
    }
  }, [activeRoom?.id]);

  useEffect(() => {
    // Cải tiến xử lý cập nhật tin nhắn từ API chỉ khi có phòng hiện tại
    if (apiMessages && apiMessages.length > 0 && activeRoom) {
      setMessages(prevMessages => {
        // Luôn sử dụng danh sách tin nhắn từ API khi phòng mới được chọn (prevMessages rỗng)
        if (prevMessages.length === 0) {
          console.log('Hiển thị tin nhắn từ API cho phòng mới:', apiMessages.length);
          return apiMessages;
        }

        // Tạo một Map để tra cứu tin nhắn nhanh hơn theo nhiều tiêu chí
        const messageMap = new Map();
        prevMessages.forEach(msg => {
          // Lưu theo ID chính
          messageMap.set(msg.id, msg);
          
          // Lưu thêm theo tempId nếu có
          if (msg.tempId) {
            messageMap.set(`temp-${msg.tempId}`, msg);
          }
        });
        
        // Lọc tin nhắn API mới (chưa có trong danh sách hiện tại)
        const newMessages = apiMessages.filter(apiMsg => !messageMap.has(apiMsg.id));
        
        if (newMessages.length > 0) {
          console.log(`Cập nhật ${newMessages.length} tin nhắn mới từ API`);
          
          // Kết hợp tin nhắn hiện tại với tin nhắn mới và sắp xếp theo thời gian
          const updatedMessages = [...prevMessages, ...newMessages].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB;
          });
          
          return updatedMessages;
        }
        
        return prevMessages;
      });
    }
  }, [apiMessages, activeRoom]);
  useEffect(() => {
    if (activeRoom) {
      // Handle null avatar by converting it to undefined
      const avatar = activeRoom.isGroup ? undefined : 
        (activeRoom.participants[0]?.avatar === null ? undefined : activeRoom.participants[0]?.avatar);
      
      const contact: Contact = {
        id: activeRoom.id,
        name: activeRoom.name,
        avatar: avatar,
        isOnline: activeRoom.isGroup ? false : activeRoom.participants[0]?.isOnline,
        lastSeen: activeRoom.isGroup 
          ? `${activeRoom.participants.length} participants` 
          : activeRoom.participants[0]?.lastSeen,
        unread: activeRoom.unreadCount,
        isActive: true,
      };
      setActiveContact(contact);
    }
  }, [activeRoom]);

  // Add a periodic refresh mechanism to ensure messages are up to date
  useEffect(() => {
    if (!activeRoom || !loadMessages) return;
    
    console.log('Setting up message sync for room:', activeRoom.id);
    
    // Initial load of messages
    loadMessages(activeRoom.id);
    
    // Set up a periodic check for new messages
    const syncInterval = setInterval(() => {
      if (activeRoom) {
        console.log('Performing periodic message sync for room:', activeRoom.id);
        loadMessages(activeRoom.id);
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [activeRoom, loadMessages]);

  // Event handlers
  const handleContactClick = (contact: any) => {
    // Find the corresponding chat room
    const room = chatRooms.find(r => r.id === contact.id);
    if (room) {
      setActiveChatRoom(room);
    }

    // Chỉ cập nhật activeContact mà không làm thay đổi danh sách contacts
    setActiveContact(contact);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeRoom) return;
    
    const message = newMessage;
    setNewMessage('');
    
    const tempId = Date.now().toString();
    // Thêm tin nhắn optimistic vào danh sách tin nhắn hiện tại
    const optimisticMessage = {
      id: `temp-${tempId}`,
      senderId: userId.toString(),
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent',
      tempId,
      isOptimistic: true
    };
    
    // Thêm tin nhắn tạm thời vào UI ngay lập tức
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
  
    try {
      // Gửi tin nhắn qua API (không cần chờ đợi kết quả)
      sendMessage({
        roomId: activeRoom.id,
        text: message,
        receiverId: activeRoom.participants.find(p => p.id !== userId)?.id,
        tempId
      }).catch(err => console.error('Error in background message sending:', err));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (!e.target.files || !e.target.files[0] || !activeRoom) return;
    
    const file = e.target.files[0];
    const receiverId = activeRoom.isGroup 
      ? undefined 
      : activeRoom.participants.find(p => p.id !== userId)?.id;
    
    // Ensure roomId is a number
    const roomIdNumber = typeof activeRoom.id === 'string' 
      ? parseInt(activeRoom.id.replace(/\D/g, ''), 10)
      : activeRoom.id;
      
    uploadAttachment({
      roomId: roomIdNumber,
      file: file,
      receiverId: receiverId ? Number(receiverId) : undefined
    });
  };

  const handleCreateChatRoom = async () => {
    if (newChatName.trim() === '') {
      alert('Please enter a chat room name');
      return;
    }
    
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant');
      return;
    }
    
    try {
      // Create new chat room
      const newRoom = await createChatRoom({
        name: newChatName,
        participantIds: selectedParticipants
      });
      
      // Close modal before updating active room to avoid unnecessary rendering
      setShowNewChatModal(false);
      setNewChatName('');
      setSelectedParticipants([]);
      
      // Set the new room as active after modal closes
      setTimeout(() => {
        if (newRoom && newRoom.id) {
          console.log('Setting new room as active:', newRoom);
          setActiveChatRoom(newRoom);
        } else {
          console.error('Invalid new room object:', newRoom);
          alert('Created chat room but received invalid data. Please refresh.');
        }
      }, 100); // Increased timeout to ensure modal fully closes
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('Failed to create chat room. Please try again.');
    }
  };
  
  const handleParticipantToggle = (userId: number) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };  // Create a ref to store the real implementation of handleEndCall
  const handleEndCallRef = useRef<() => void>(() => {
    console.log('handleEndCall not yet initialized');
  });
  
  // Create a stable wrapper function that will always call the current implementation
  const handleEndCall = useCallback(() => {
    handleEndCallRef.current();
  }, []);
  
  // Setup the actual implementation of handleEndCall
  useEffect(() => {
    handleEndCallRef.current = () => {
      if (!activeCall) return;
      
      // Notify the other user
      sendSignalMessage({
        type: 'call_end',
        targetParticipantId: activeCall.targetUserId
      });
      
      // Clean up WebRTC resources
      cleanupWebRTCResources(activeCall.localStream, activeCall.peerConnection);
      
      // Reset call state
      setActiveCall(null);
      console.log('Call ended and resources cleaned up');
    };  }, [activeCall, sendSignalMessage, cleanupWebRTCResources]);

  // Function to start monitoring call statistics
  const startCallStatsMonitoring = useCallback((peerConnection: RTCPeerConnection, connectionId: string) => {
    if (!peerConnection) return null;
    
    console.log('Starting WebRTC statistics monitoring for:', connectionId);
    
    // Clear any existing interval for this call
    if (activeCall?.statsInterval) {
      clearInterval(activeCall.statsInterval);
    }
    
    // Create a new interval for stats collection
    const statsInterval = setInterval(async () => {
      try {
        // Only collect stats if call is active
        if (!activeCall?.peerConnection || activeCall.peerConnection.connectionState !== 'connected') {
          return;
        }
        
        // Use our utility function to collect stats
        const callStats = await collectWebRTCStats(peerConnection, connectionId);
        
        if (callStats) {
          // Update call stats in state
          setActiveCall(current => {
            if (!current) return null;
            return {
              ...current,
              callStats
            };
          });
        }
      } catch (error) {
        console.error('Error collecting WebRTC stats:', error);
      }
    }, 2000); // Update every 2 seconds
    
    return statsInterval;
  }, [activeCall]);
  
  // Function to stop call stats monitoring and clear history
  const stopCallStatsMonitoring = useCallback((connectionId: string) => {
    if (activeCall?.statsInterval) {
      clearInterval(activeCall.statsInterval);
      console.log('Stopped WebRTC statistics monitoring');
    }
    
    // Clear stats history for this connection
    clearStatsHistory(connectionId);
  }, [activeCall]);

  // Function to collect and analyze WebRTC statistics
  const monitorCallStatistics = useCallback((peerConnection: RTCPeerConnection) => {
    if (!peerConnection) return null;
    
    console.log('Starting WebRTC statistics monitoring');
    
    // Previous stats for bitrate calculation
    let lastResult: any = null;
    let lastTimestamp = 0;

    // Store last few quality ratings to prevent flickering
    const qualityRatings: string[] = [];
    const getSmoothedQualityRating = (newRating: string): 'excellent' | 'good' | 'fair' | 'poor' => {
      // Add new rating to the history
      qualityRatings.push(newRating);
      
      // Keep only the most recent ratings
      if (qualityRatings.length > 5) {
        qualityRatings.shift();
      }
      
      // Count the occurrences of each rating
      const counts: Record<string, number> = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      };
      
      qualityRatings.forEach(rating => {
        counts[rating] = (counts[rating] || 0) + 1;
      });
      
      // Return the most common rating
      let maxRating = 'good';
      let maxCount = 0;
      
      Object.entries(counts).forEach(([rating, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxRating = rating;
        }
      });
      
      return maxRating as 'excellent' | 'good' | 'fair' | 'poor';
    };

    // Clear any existing interval
    if (activeCall?.statsInterval) {
      clearInterval(activeCall.statsInterval);
    }
    
    // Create a new interval for stats collection
    const statsInterval = setInterval(async () => {
      try {
        // Only proceed if call is active and connected
        if (!activeCall || !peerConnection || peerConnection.connectionState !== 'connected') {
          return;
        }
        
        const stats = await peerConnection.getStats();
        let inboundRtp: any = null;
        let candidatePair: any = null;
        let outboundRtp: any = null;
        
        // Process all stats reports
        stats.forEach((report: any) => {
          if (report.type === 'inbound-rtp' && !report.isRemote && report.mediaType === 'video') {
            inboundRtp = report;
          } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            candidatePair = report;
          } else if (report.type === 'outbound-rtp' && !report.isRemote && report.mediaType === 'video') {
            outboundRtp = report;
          }
        });
        
        // Initialize statistics
        let bitrate = 0;
        let packetLoss = 0;
        let jitter = 0;
        let roundTripTime = 0;
        
        // Calculate bitrate based on bytes received
        if (inboundRtp && lastResult && lastResult.bytesReceived) {
          const bytesNow = inboundRtp.bytesReceived;
          const bytesLast = lastResult.bytesReceived;
          
          // Time delta in seconds
          const timeDelta = (inboundRtp.timestamp - lastTimestamp) / 1000;
          
          if (timeDelta > 0) {
            bitrate = 8 * (bytesNow - bytesLast) / timeDelta; // Convert to bits per second
          }
        }
        
        // Get packet loss info
        if (inboundRtp && inboundRtp.packetsLost !== undefined && inboundRtp.packetsReceived) {
          const totalPackets = inboundRtp.packetsLost + inboundRtp.packetsReceived;
          packetLoss = totalPackets > 0 ? (inboundRtp.packetsLost / totalPackets) * 100 : 0;
        }
        
        // Get jitter (in seconds, convert to ms)
        if (inboundRtp && inboundRtp.jitter !== undefined) {
          jitter = inboundRtp.jitter * 1000;
        }
        
        // Get round-trip time
        if (candidatePair && candidatePair.currentRoundTripTime !== undefined) {
          roundTripTime = candidatePair.currentRoundTripTime * 1000;
        }
        
        // Determine quality rating based on various factors
        let qualityRating: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        
        // Simplified algorithm for quality rating
        if (packetLoss > 5 || roundTripTime > 500 || jitter > 100) {
          qualityRating = 'poor';
        } else if (packetLoss > 2 || roundTripTime > 250 || jitter > 50) {
          qualityRating = 'fair';
        } else if (packetLoss > 0.5 || roundTripTime > 100 || jitter > 20) {
          qualityRating = 'good';
        } else {
          qualityRating = 'excellent';
        }
        
        // Apply smoothing to prevent rapid quality indicator changes
        const smoothedRating = getSmoothedQualityRating(qualityRating);
        
        // Update call stats in state
        setActiveCall(current => {
          if (!current) return null;
          return {
            ...current,
            callStats: {
              bitrate,
              packetLoss,
              jitter,
              roundTripTime,
              qualityRating: smoothedRating,
            }
          };
        });
        
        // Store this result for next comparison
        lastResult = inboundRtp;
        lastTimestamp = inboundRtp?.timestamp || Date.now();
      } catch (error) {
        console.error('Error collecting WebRTC stats:', error);
      }
    }, 2000); // Update every 2 seconds
    
    return statsInterval;
  }, [activeCall]);
  // Handler for when remote stream is received and call is established
  const handleCallEstablished = useCallback((peerConnection: RTCPeerConnection, remoteStream: MediaStream, startTime?: number) => {
    console.log('Call established, remote stream received');
    
    // Update active call state with remote stream
    setActiveCall(current => {
      if (!current) return null;
      
      return {
        ...current,
        remoteStream,
        connectionState: 'connected',
        startTime: startTime || Date.now()
      };
    });
    
    // Start call quality monitoring
    if (peerConnection && activeCall) {
      // Generate a unique connection ID for stats tracking
      const connectionId = `call-${activeCall.roomId}-${activeCall.targetUserId}-${Date.now()}`;
      
      // Wait a moment for the connection to stabilize before starting statistics
      setTimeout(() => {
        const statsInterval = startCallStatsMonitoring(peerConnection, connectionId);
        
        // Add the interval to the active call state
        if (statsInterval) {
          setActiveCall(current => current ? {
            ...current,
            statsInterval
          } : null);
        }
      }, 1000);
    }
  }, [activeCall, startCallStatsMonitoring]);
  
  // Handle voice call initialization
  const handleVoiceCall = useCallback((targetUserId: number | string, roomId: string | number, startTime?: number) => {
    if (!activeRoom) return;
    
    console.log('Starting voice call with user:', targetUserId, 'in room:', roomId);
    
    // Initialize WebRTC connection
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        // Create RTCPeerConnection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { 
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            }
          ]
        });
        
        // Add local stream tracks to connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
        
        // Set up event handlers
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // Send ICE candidate to peer
            sendSignalMessage({
              type: 'ice_candidate',
              candidate: event.candidate,
              targetParticipantId: targetUserId
            });
          } else {
            console.log('All ICE candidates have been gathered');
          }
        };

        // Monitor ICE gathering state
        peerConnection.onicegatheringstatechange = () => {
          console.log('ICE gathering state:', peerConnection.iceGatheringState);
          
          // Update the active call state with the current ICE gathering state
          setActiveCall(current => current ? {
            ...current,
            iceGatheringState: peerConnection.iceGatheringState
          } : null);
        };
        
        // Monitor ICE connection state
        peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', peerConnection.iceConnectionState);
          
          // Update active call state with connection state
          setActiveCall(current => current ? {
            ...current,
            connectionState: peerConnection.iceConnectionState
          } : null);
          
          // Handle disconnected/failed states
          if (['failed', 'closed'].includes(peerConnection.iceConnectionState)) {
            console.log('ICE connection failed or closed');
            alert('Call connection failed. Please try again.');
            handleEndCall();
          }
        };
          peerConnection.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            // Use the handleCallEstablished function to set remote stream and start monitoring
            handleCallEstablished(peerConnection, event.streams[0], startTime);
          }
        };// Create and send offer
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => {
            // Send the offer through the websocket
            sendSignalMessage({
              type: 'call_offer',
              sdp: peerConnection.localDescription,
              targetParticipantId: targetUserId,
              isAudioOnly: true
            });
            
            // Set a timeout to automatically end call if no answer is received
            const callTimeoutId = setTimeout(() => {
              // If call is still in connecting state after 30 seconds, end it
              if (peerConnection.iceConnectionState === 'new' || 
                  peerConnection.iceConnectionState === 'checking' || 
                  peerConnection.iceConnectionState === 'connecting') {
                alert('Call timed out. The other user may be unavailable.');
                cleanupWebRTCResources(stream, peerConnection);
                setActiveCall(null);
              }
            }, 30000); // 30 seconds timeout
            
            // Set active call state
            setActiveCall({
              targetUserId,
              roomId,
              isAudioOnly: true,
              localStream: stream,
              remoteStream: null,
              peerConnection: peerConnection,
              isMuted: false,
              isVideoOff: true,
              connectionState: 'new',
              iceGatheringState: 'new',              startTime: startTime || Date.now(),
              reconnectAttempt: 0 
            });
          })
          .catch(error => {
            console.error('Error creating offer:', error);
            alert('Failed to start call. Please try again.');
            // Clean up resources
            stream.getTracks().forEach(track => track.stop());
          });
      })
      .catch(err => {
        console.error('Error accessing audio devices:', err);
        alert('Could not access your microphone. Please check your permissions and try again.');
      });
  }, [activeRoom, sendSignalMessage, handleEndCall]);  // Handle video call initialization
  const handleVideoCall = useCallback((targetUserId: number | string, roomId: string | number, startTime?: number) => {
    if (!activeRoom) return;
    
    console.log('Starting video call with user:', targetUserId, 'in room:', roomId);
    
    // Initialize WebRTC connection
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        // Create RTCPeerConnection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { 
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            }
          ]
        });
        
        // Add local stream tracks to connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
        
        // Set up event handlers
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // Send ICE candidate to peer
            sendSignalMessage({
              type: 'ice_candidate',
              candidate: event.candidate,
              targetParticipantId: targetUserId
            });
          } else {
            console.log('All ICE candidates have been gathered');
          }
        };
        
        // Monitor ICE gathering state
        peerConnection.onicegatheringstatechange = () => {
          console.log('ICE gathering state:', peerConnection.iceGatheringState);
          
          // Update the active call state with the current ICE gathering state
          setActiveCall(current => current ? {
            ...current,
            iceGatheringState: peerConnection.iceGatheringState
          } : null);
        };
        
        // Monitor ICE connection state        peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', peerConnection.iceConnectionState);
          
          // Update active call state with connection state
          setActiveCall(current => current ? {
            ...current,
            connectionState: peerConnection.iceConnectionState
          } : null);
          
          // Start stats monitoring when connected
          if (peerConnection.iceConnectionState === 'connected' || 
              peerConnection.iceConnectionState === 'completed') {
            // Start call statistics monitoring
            const statsInterval = monitorCallStatistics(peerConnection);
            if (statsInterval) {
              setActiveCall(current => current ? {
                ...current,
                statsInterval
              } : null);
            }
          }
          
          // Handle disconnected/failed states
          if (['failed', 'closed'].includes(peerConnection.iceConnectionState)) {
            console.log('ICE connection failed or closed');
            handleConnectionFailure();
          }
        };
          peerConnection.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            // Use the handleCallEstablished function to set remote stream and start monitoring
            handleCallEstablished(peerConnection, event.streams[0], startTime);
          }
        };// Create and send offer - with error handling
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => {
            // Send the offer through the websocket
            sendSignalMessage({
              type: 'call_offer',
              sdp: peerConnection.localDescription,
              targetParticipantId: targetUserId,
              isAudioOnly: false
            });
            
            // Set a timeout to automatically end call if no answer is received
            const callTimeoutId = window.setTimeout(() => {
              if (!activeCall || !activeCall.remoteStream) {
                console.log('Call timeout - no response received');
                alert('Call timed out. The other user may be unavailable.');
                cleanupWebRTCResources(stream, peerConnection);
                setActiveCall(null);
              }
            }, 30000); // 30 seconds timeout
            
            // Set active call state
            setActiveCall({
              targetUserId,
              roomId,
              isAudioOnly: false,
              localStream: stream,
              remoteStream: null,
              peerConnection: peerConnection,
              isMuted: false,
              isVideoOff: false,
              connectionState: 'new',
              iceGatheringState: 'new',
              startTime: startTime || Date.now(),
              reconnectAttempt: 0,
              initiator: true // Mark as call initiator
            });
          })
          .catch(error => {
            console.error('Error creating offer:', error);
            alert('Failed to start call. Please try again.');
            cleanupWebRTCResources(stream, peerConnection);
          });
      })
      .catch(err => {
        console.error('Error accessing media devices:', err);
        if (err.name === 'NotAllowedError') {
          alert('Camera or microphone access denied. Please check your browser permissions and try again.');
        } else if (err.name === 'NotFoundError') {
          alert('No camera or microphone found. Please connect a device and try again.');
        } else {          alert('Could not access your camera or microphone. Please check your permissions and try again.');
        }
      });
  }, [activeRoom, sendSignalMessage, cleanupWebRTCResources, handleConnectionFailure, handleCallEstablished]);
  // Handle accepting incoming call
  const handleAcceptCall = useCallback(() => {
    if (!incomingCall || !incomingCall.offer) return;
    
    // Access media based on call type
    navigator.mediaDevices.getUserMedia({ 
      audio: true, 
      video: !incomingCall.isAudioOnly 
    })
    .then(stream => {
      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { 
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ]
      });
      
      // Add local stream tracks to connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Set remote description from offer (we already confirmed offer exists in the guard at the top)
      peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer as RTCSessionDescriptionInit))
        .then(() => {
          // Create answer
          return peerConnection.createAnswer();
        })
        .then(answer => {
          // Set local description
          return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
          // Send answer to peer
          sendSignalMessage({
            type: 'call_answer',
            sdp: peerConnection.localDescription,
            targetParticipantId: incomingCall.callerId
          });
          
          // Update state to reflect active call
          setActiveCall({
            targetUserId: incomingCall.callerId!,
            roomId: activeRoom!.id,
            isAudioOnly: incomingCall.isAudioOnly,
            localStream: stream,
            remoteStream: null,
            peerConnection: peerConnection,
            isMuted: false,
            isVideoOff: incomingCall.isAudioOnly,
            connectionState: 'connecting',
            iceGatheringState: 'new',
            startTime: Date.now()
          });
          
          // Clear incoming call notification
          setIncomingCall(null);
        })
        .catch(error => {
          console.error('Error creating answer:', error);
          alert('Failed to accept call. Please try again.');
          stream.getTracks().forEach(track => track.stop());
          setIncomingCall(null);
        });
      
      // Set up ICE candidate handling
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalMessage({
            type: 'ice_candidate',
            candidate: event.candidate,
            targetParticipantId: incomingCall.callerId
          });
        } else {
          console.log('All ICE candidates have been gathered');
        }
      };
      
      // Monitor ICE gathering state
      peerConnection.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', peerConnection.iceGatheringState);
        
        // Update the active call state with the current ICE gathering state
        setActiveCall(current => current ? {
          ...current,
          iceGatheringState: peerConnection.iceGatheringState
        } : null);
      };
      
      // Monitor ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
        
        // Update active call state with connection state
        setActiveCall(current => current ? {
          ...current,
          connectionState: peerConnection.iceConnectionState
        } : null);
        
        // Handle disconnected/failed states
        if (['failed', 'closed'].includes(peerConnection.iceConnectionState)) {
          console.log('ICE connection failed or closed');
          alert('Call connection failed. Please try again.');
          handleEndCall();
        }
      };
      
      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          // Set remote stream when we receive it
          setActiveCall(current => current ? {
            ...current,
            remoteStream: event.streams[0],
            connectionState: 'connected'
          } : null);
        }
      };
    })
    .catch(err => {
      console.error('Error accessing media devices:', err);
      alert('Could not access your camera or microphone. Please check your permissions and try again.');
      setIncomingCall(null);
    });
  }, [incomingCall, activeRoom, sendSignalMessage, handleEndCall]);
  // Handle rejecting incoming call
  const handleRejectCall = useCallback(() => {
    if (!incomingCall || !incomingCall.callerId) return;
    
    // Send rejection to caller
    sendSignalMessage({
      type: 'call_rejected',
      targetParticipantId: incomingCall.callerId
    });
    
    // Clear incoming call notification
    setIncomingCall(null);  }, [incomingCall, sendSignalMessage]);
    // Utility function to clean up WebRTC resources
  const cleanupWebRTCResources = useCallback((stream?: MediaStream | null, peerConnection?: RTCPeerConnection | null) => {
    console.log('Cleaning up WebRTC resources');
    
    // Clear statistics monitoring
    if (activeCall) {
      if (activeCall.statsInterval) {
        clearInterval(activeCall.statsInterval);
        console.log('Stopped WebRTC statistics monitoring');
      }
      
      // Generate connection ID in the same format as in handleCallEstablished
      const connectionId = `call-${activeCall.roomId}-${activeCall.targetUserId}-${activeCall.startTime || Date.now()}`;
      stopCallStatsMonitoring(connectionId);
    }
    
    try {
      // Stop all tracks in the stream
      if (stream) {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
            console.log(`Stopped ${track.kind} track with ID: ${track.id}`);
          } catch (err) {
            console.error('Error stopping track:', err);
          }
        });
      }
      
      // Close the peer connection
      if (peerConnection) {
        try {
          // First remove all event listeners to avoid memory leaks
          peerConnection.onicecandidate = null;
          peerConnection.ontrack = null;
          peerConnection.oniceconnectionstatechange = null;
          peerConnection.onicegatheringstatechange = null;
          peerConnection.onnegotiationneeded = null;
          peerConnection.onconnectionstatechange = null;
          peerConnection.onsignalingstatechange = null;
          peerConnection.ondatachannel = null;
          
          // Remove all transceivers if supported
          if (peerConnection.getTransceivers) {
            try {
              peerConnection.getTransceivers().forEach(transceiver => {
                try {
                  if (transceiver.stop) {
                    transceiver.stop();
                  }
                } catch (e) {
                  console.error('Error stopping transceiver:', e);
                }
              });
            } catch (err) {
              console.error('Error accessing transceivers:', err);
            }
          }
          
          // Stop all sender tracks
          try {
            if (peerConnection.getSenders) {
              peerConnection.getSenders().forEach(sender => {
                if (sender.track) {
                  sender.track.stop();
                }
                
                // Remove the sender if possible (not fully supported in all browsers)
                try {
                  if (peerConnection.removeTrack) {
                    peerConnection.removeTrack(sender);
                  }
                } catch (e) {
                  console.error('Error removing track from sender:', e);
                }
              });
            }
          } catch (err) {
            console.error('Error stopping sender tracks:', err);
          }

          // Remove all receivers (if supported)
          try {
            if (peerConnection.getReceivers) {
              peerConnection.getReceivers().forEach(receiver => {
                if (receiver.track) {
                  // Just stop the track
                  receiver.track.stop();
                }
              });
            }
          } catch (err) {
            console.error('Error stopping receiver tracks:', err);
          }
          
          // Close the connection
          peerConnection.close();
          console.log('Peer connection closed successfully');
        } catch (err) {
          console.error('Error closing peer connection:', err);
        }
      }
        // Request garbage collection hint (not guaranteed to run)
      if (window.gc) {
        try {
          window.gc();
          console.log('Suggested garbage collection to browser');
        } catch (err) {
          // Do nothing, gc() might not be available
        }
      }
    } catch (err) {
      console.error('Error during WebRTC cleanup:', err);
    }
  }, [activeCall, stopCallStatsMonitoring]);

  // Toggle mute for active call
  const handleToggleMute = useCallback(() => {
    if (!activeCall || !activeCall.localStream) return;
    
    const audioTracks = activeCall.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const track = audioTracks[0];
      track.enabled = !track.enabled;
      
      setActiveCall({
        ...activeCall,
        isMuted: !track.enabled
      });
    }
  }, [activeCall]);
  // Toggle video for active call
  const handleToggleVideo = useCallback(() => {
    if (!activeCall || !activeCall.localStream || activeCall.isAudioOnly) return;
    
    const videoTracks = activeCall.localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const track = videoTracks[0];
      track.enabled = !track.enabled;
      
      setActiveCall({
        ...activeCall,
        isVideoOff: !track.enabled
      });
    }
  }, [activeCall]);  // Handle WebRTC connection failures with potential reconnect
  const handleConnectionFailure = useCallback(() => {
    if (!activeCall) return;
    
    // Track reconnection attempts
    const reconnectAttempt = activeCall.reconnectAttempt || 0;
    const maxReconnectAttempts = 3;
    
    // Update connection state to reflect failure
    setActiveCall(current => current ? {
      ...current,
      connectionState: 'failed',
      reconnectAttempt: reconnectAttempt
    } : null);
    
    if (reconnectAttempt < maxReconnectAttempts) {
      console.log(`Attempting reconnection ${reconnectAttempt + 1}/${maxReconnectAttempts}`);
      
      // Store the call info we need for reconnection
      const targetId = activeCall.targetUserId;
      const roomId = activeCall.roomId;
      const isAudioOnly = activeCall.isAudioOnly;
      const startTime = activeCall.startTime; // Preserve original call start time
      
      // End current call but don't send end signal to remote peer
      cleanupWebRTCResources(activeCall.localStream, activeCall.peerConnection);
      
      // Temporarily mark call as reconnecting
      setActiveCall(current => current ? {
        ...current,
        connectionState: 'reconnecting',
        peerConnection: null,
        localStream: null,
        remoteStream: null,
        reconnectAttempt: reconnectAttempt + 1
      } : null);
      
      // Try to restart the call after a brief delay - use exponential backoff
      const delay = 1000 * Math.pow(1.5, reconnectAttempt);
      
      setTimeout(() => {
        if (isAudioOnly) {
          handleVoiceCall(targetId, roomId, startTime);
        } else {
          handleVideoCall(targetId, roomId, startTime);
        }
      }, delay);
    } else {
      // We've exhausted our reconnection attempts
      // Ask user if they want to try manually reconnecting
      const wantToReconnect = window.confirm(`Connection failed after ${maxReconnectAttempts} automatic attempts. Try again manually?`);
      
      if (wantToReconnect && activeCall) {
        // Store the call info we need for reconnection
        const targetId = activeCall.targetUserId;
        const roomId = activeCall.roomId;
        const isAudioOnly = activeCall.isAudioOnly;
        
        // End current call but don't send end signal
        cleanupWebRTCResources(activeCall.localStream, activeCall.peerConnection);
        
        // Reset the call state
        setActiveCall(null);
        
        // Try to restart the call after a brief delay
        setTimeout(() => {
          if (isAudioOnly) {
            handleVoiceCall(targetId, roomId);
          } else {
            handleVideoCall(targetId, roomId);
          }
        }, 1000);
      } else {
        // User doesn't want to reconnect, end the call completely
        handleEndCall();
      }
    }
  }, [activeCall, cleanupWebRTCResources, handleVoiceCall, handleVideoCall, handleEndCall]);  // Monitor WebRTC connection state and handle disconnections
  useEffect(() => {
    if (!activeCall || !activeCall.peerConnection) return;
    
    // Create handlers for different types of connection state changes
    const handleIceConnectionStateChange = () => {
      if (!activeCall || !activeCall.peerConnection) return;
      
      const connectionState = activeCall.peerConnection.iceConnectionState;
      console.log('ICE connection state changed:', connectionState);
      
      // Update state with new connection state - convert to string to avoid type issues
      setActiveCall(current => {
        if (!current) return null;
        return {
          ...current,
          connectionState: connectionState.toString()
        };
      });
      
      // Handle connection state transitions
      if (connectionState === 'failed') {
        console.log('ICE Connection failed, attempting to recover');
        handleConnectionFailure();
      } else if (connectionState === 'disconnected') {
        console.log('ICE Connection temporarily disconnected, waiting for auto-reconnect');
        // Update state but wait for potential auto-recovery by ICE
        // ICE will attempt to reconnect automatically in this state
      } else if (connectionState === 'connected' || connectionState === 'completed') {
        console.log('ICE Connection established successfully');
        // Reset reconnection attempt counter on successful connection
        setActiveCall(current => {
          if (!current) return null;
          return {
            ...current,
            reconnectAttempt: 0
          };
        });
      }
    };

    const handleConnectionStateChange = () => {
      if (!activeCall || !activeCall.peerConnection) return;
      
      // This is different from iceConnectionState
      const state = activeCall.peerConnection.connectionState;
      console.log('RTCPeerConnection connection state changed:', state);
      
      if (state === 'failed') {
        console.log('RTCPeerConnection failed, attempting recovery');
        handleConnectionFailure();
      } else if (state === 'disconnected') {
        console.log('RTCPeerConnection disconnected');
      }
    };

    const handleSignalingStateChange = () => {
      if (!activeCall || !activeCall.peerConnection) return;
      const state = activeCall.peerConnection.signalingState;
      console.log('Signaling state changed:', state);
      
      if (state === 'closed') {
        console.log('Signaling state closed');
      }
    };
    
    // Add various state change listeners for comprehensive monitoring
    activeCall.peerConnection.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
    activeCall.peerConnection.addEventListener('connectionstatechange', handleConnectionStateChange);
    activeCall.peerConnection.addEventListener('signalingstatechange', handleSignalingStateChange);
    
    // Cleanup all listeners
    return () => {
      if (activeCall.peerConnection) {
        activeCall.peerConnection.removeEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
        activeCall.peerConnection.removeEventListener('connectionstatechange', handleConnectionStateChange);
        activeCall.peerConnection.removeEventListener('signalingstatechange', handleSignalingStateChange);
      }
    };
  }, [activeCall, handleConnectionFailure]);

  // Utility function to safely update connection states
  const safeUpdateConnectionState = useCallback((
    peerConnection: RTCPeerConnection,
    updateType: 'connection' | 'gathering'
  ) => {
    if (!peerConnection) return;
    
    if (updateType === 'connection') {
      // Update connection state
      setActiveCall(current => {
        if (!current) return null;
        return {
          ...current,
          connectionState: peerConnection.iceConnectionState.toString()
        };
      });
    } else {
      // Update gathering state
      setActiveCall(current => {
        if (!current) return null;
        return {
          ...current,
          iceGatheringState: peerConnection.iceGatheringState.toString()
        };
      });
    }
  }, []);
  // Function to collect and analyze WebRTC statistics
  const monitorCallStatistics = useCallback((peerConnection: RTCPeerConnection) => {
    if (!peerConnection) return null;
    
    console.log('Starting WebRTC statistics monitoring');
    
    // Previous stats for bitrate calculation
    let lastResult: any = null;
    let lastTimestamp = 0;

    // Store last few quality ratings to prevent flickering
    const qualityRatings: string[] = [];
    const getSmoothedQualityRating = (newRating: string): 'excellent' | 'good' | 'fair' | 'poor' => {
      // Add new rating to the history
      qualityRatings.push(newRating);
      
      // Keep only the most recent ratings
      if (qualityRatings.length > 5) {
        qualityRatings.shift();
      }
      
      // Count the occurrences of each rating
      const counts: Record<string, number> = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      };
      
      qualityRatings.forEach(rating => {
        counts[rating] = (counts[rating] || 0) + 1;
      });
      
      // Return the most common rating
      let maxRating = 'good';
      let maxCount = 0;
      
      Object.entries(counts).forEach(([rating, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxRating = rating;
        }
      });
      
      return maxRating as 'excellent' | 'good' | 'fair' | 'poor';
    };

    // Clear any existing interval
    if (activeCall?.statsInterval) {
      clearInterval(activeCall.statsInterval);
    }
    
    // Create a new interval for stats collection
    const statsInterval = setInterval(async () => {
      try {
        // Only proceed if call is active and connected
        if (!activeCall || !peerConnection || peerConnection.connectionState !== 'connected') {
          return;
        }
        
        const stats = await peerConnection.getStats();
        let inboundRtp: any = null;
        let candidatePair: any = null;
        let outboundRtp: any = null;
        
        // Process all stats reports
        stats.forEach((report: any) => {
          if (report.type === 'inbound-rtp' && !report.isRemote && report.mediaType === 'video') {
            inboundRtp = report;
          } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            candidatePair = report;
          } else if (report.type === 'outbound-rtp' && !report.isRemote && report.mediaType === 'video') {
            outboundRtp = report;
          }
        });
        
        // Initialize statistics
        let bitrate = 0;
        let packetLoss = 0;
        let jitter = 0;
        let roundTripTime = 0;
        
        // Calculate bitrate based on bytes received
        if (inboundRtp && lastResult && lastResult.bytesReceived) {
          const bytesNow = inboundRtp.bytesReceived;
          const bytesLast = lastResult.bytesReceived;
          
          // Time delta in seconds
          const timeDelta = (inboundRtp.timestamp - lastTimestamp) / 1000;
          
          if (timeDelta > 0) {
            bitrate = 8 * (bytesNow - bytesLast) / timeDelta; // Convert to bits per second
          }
        }
        
        // Get packet loss info
        if (inboundRtp && inboundRtp.packetsLost !== undefined && inboundRtp.packetsReceived) {
          const totalPackets = inboundRtp.packetsLost + inboundRtp.packetsReceived;
          packetLoss = totalPackets > 0 ? (inboundRtp.packetsLost / totalPackets) * 100 : 0;
        }
        
        // Get jitter (in seconds, convert to ms)
        if (inboundRtp && inboundRtp.jitter !== undefined) {
          jitter = inboundRtp.jitter * 1000;
        }
        
        // Get round-trip time
        if (candidatePair && candidatePair.currentRoundTripTime !== undefined) {
          roundTripTime = candidatePair.currentRoundTripTime * 1000;
        }
        
        // Determine quality rating based on various factors
        let qualityRating: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        
        // Simplified algorithm for quality rating
        if (packetLoss > 5 || roundTripTime > 500 || jitter > 100) {
          qualityRating = 'poor';
        } else if (packetLoss > 2 || roundTripTime > 250 || jitter > 50) {
          qualityRating = 'fair';
        } else if (packetLoss > 0.5 || roundTripTime > 100 || jitter > 20) {
          qualityRating = 'good';
        } else {
          qualityRating = 'excellent';
        }
        
        // Apply smoothing to prevent rapid quality indicator changes
        const smoothedRating = getSmoothedQualityRating(qualityRating);
        
        // Update call stats in state
        setActiveCall(current => {
          if (!current) return null;
          return {
            ...current,
            callStats: {
              bitrate,
              packetLoss,
              jitter,
              roundTripTime,
              qualityRating: smoothedRating,
            }
          };
        });
        
        // Store this result for next comparison
        lastResult = inboundRtp;
        lastTimestamp = inboundRtp?.timestamp || Date.now();
      } catch (error) {
        console.error('Error collecting WebRTC stats:', error);
      }
    }, 2000); // Update every 2 seconds
    
    return statsInterval;
  }, [activeCall]);

  return (    <div className={styles.chatContainer}>      {/* Sidebar Component */}
      <Sidebar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        error={error}
        chatRooms={chatRooms.map(room => adaptServiceChatRoom(room))}
        projectUsers={projectUsers}
        loadingProjectUsers={loadingProjectUsers}
        projectUsersError={projectUsersError}
        activeRoom={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
        setActiveChatRoom={(room) => setActiveChatRoom(room as any)}
        startDirectChat={startDirectChat}
        setShowNewChatModal={setShowNewChatModal}
        handleContactClick={handleContactClick}
        onVoiceCallClick={handleVoiceCall}
        onVideoCallClick={handleVideoCall}
      />{/* Chat Area Component */}      <ChatArea
        activeRoom={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
        activeContact={activeContact}
        messages={messages}
        userId={userId}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleAttachmentUpload={handleAttachmentUpload}
        setTypingStatus={setTypingStatus}
        sendSignalMessage={sendSignalMessage}
        incomingCall={incomingCall}
        setIncomingCall={setIncomingCall}
      />

      {/* Participants Panel Component */}      <ParticipantsPanel
        activeRoom={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        userId={userId}
      />

      {/* Create Chat Modal Component */}
      <CreateChatModal
        showNewChatModal={showNewChatModal}
        setShowNewChatModal={setShowNewChatModal}
        newChatName={newChatName}
        setNewChatName={setNewChatName}
        selectedParticipants={selectedParticipants}
        setSelectedParticipants={setSelectedParticipants}
        contacts={contacts}
        handleCreateChatRoom={handleCreateChatRoom}
        handleParticipantToggle={handleParticipantToggle}
      />

      {/* Incoming Call Notification */}
      {incomingCall && (
        <IncomingCallNotification
          callerId={incomingCall.callerId || ''}
          callerName={
            contacts.find(c => String(c.id) === String(incomingCall.callerId))?.name || 
            'Unknown Caller'
          }
          callerAvatar={
            contacts.find(c => String(c.id) === String(incomingCall.callerId))?.avatar
          }
          room={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
          isAudioOnly={incomingCall.isAudioOnly}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}      {/* Active Call UI */}
      {activeCall && (
        <CallUI
          isAudioOnly={activeCall.isAudioOnly}
          localStream={activeCall.localStream}
          remoteStream={activeCall.remoteStream}
          isMuted={activeCall.isMuted}
          isVideoOff={activeCall.isVideoOff}
          connectionState={activeCall.connectionState}
          startTime={activeCall.startTime}
          callStats={activeCall.callStats}
          callerName={
            contacts.find(c => String(c.id) === String(activeCall.targetUserId))?.name || 
            'Unknown Contact'
          }
          onMuteToggle={handleToggleMute}
          onVideoToggle={handleToggleVideo}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
};

export default ChatRoomModular;
