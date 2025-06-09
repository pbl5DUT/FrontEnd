import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatRoom as ServiceChatRoom } from '../types/message.types';
import { ChatRoom as ComponentChatRoom } from '../components/types';

interface WebRTCState {
  localStream?: MediaStream;
  remoteStreams: Map<string, MediaStream>;
  peerConnections: Map<string, RTCPeerConnection>;
  isInitiator: boolean;
  isAudioOnly: boolean;
  participants: string[];
}

type ChatRoomType = ServiceChatRoom | ComponentChatRoom;

interface UseWebRTCOptions {
  activeRoom: ChatRoomType | null;
  userId: string | number;
  sendSignalMessage: (message: any) => void;
}

// Helper function to normalize user IDs consistently
const normalizeUserId = (userId: string | number | undefined): string => {
  if (userId === undefined || userId === null) return 'unknown';
  return String(userId);
};

// Improved ICE servers configuration with more reliable STUN/TURN servers
const iceServers = {
  iceServers: [
    // STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Free TURN servers
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    // Added more free STUN servers for redundancy
    { urls: 'stun:stun.ekiga.net' },
    { urls: 'stun:stun.ideasip.com' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.voiparound.com' },
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRTC = ({ activeRoom, userId, sendSignalMessage }: UseWebRTCOptions) => {
  // State and refs
  const [state, setState] = useState<WebRTCState>({
    isInitiator: false,
    isAudioOnly: false,
    remoteStreams: new Map<string, MediaStream>(),
    peerConnections: new Map<string, RTCPeerConnection>(),
    participants: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  
  // Cleanup function to stop all media tracks and close all peer connections
  const cleanup = useCallback(() => {
    console.log('Cleaning up WebRTC resources');
    
    // First stop all tracks
    if (localStreamRef.current) {
      console.log('Stopping local media tracks...');
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Then close all peer connections
    if (peerConnectionsRef.current.size > 0) {
      console.log(`Closing ${peerConnectionsRef.current.size} peer connections...`);
      peerConnectionsRef.current.forEach((pc, participantId) => {
        console.log(`Closing peer connection for participant: ${participantId}`);
        pc.close();
      });
      peerConnectionsRef.current.clear();
    }

    // Reset state
    setState(prev => ({
      ...prev,
      localStream: undefined,
      remoteStreams: new Map<string, MediaStream>(),
      peerConnections: new Map<string, RTCPeerConnection>(),
      participants: []
    }));
    remoteStreamsRef.current.clear();
    setIsConnected(false);
    
    console.log('WebRTC cleanup complete');
  }, []);
  
  // Initialize local media stream
  const initializeLocalStream = useCallback(async (isAudioOnly: boolean = false) => {
    try {
      console.log(`Initializing local stream, audio only: ${isAudioOnly}`);

      // Define more detailed constraints for better compatibility
      let streamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: !isAudioOnly ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 360 },
          facingMode: "user"
        } : false
      };

      // First try to get both audio and video (if needed)
      let stream;
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Your browser doesn't support media devices access.");
        }

        stream = await navigator.mediaDevices.getUserMedia(streamConstraints);
        console.log("Successfully accessed camera and microphone", stream.getTracks().map(t => t.kind));
      } catch (mediaError) {
        console.error("Error accessing media devices:", mediaError);
        
        // If it fails and we were trying video, fall back to audio only
        if (!isAudioOnly) {
          console.log("Falling back to audio only");
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              audio: {
                echoCancellation: true,
                noiseSuppression: true
              }, 
              video: false 
            });
            console.log("Successfully accessed microphone only");
            // Set flag that we're in audio-only mode even though it wasn't requested
            isAudioOnly = true;
          } catch (audioError) {
            console.error("Error accessing microphone:", audioError);
            throw new Error("Cannot access microphone. Please check your permissions and try again.");
          }
        } else {
          // If we're already trying audio only and it fails, propagate the error
          throw new Error("Cannot access microphone. Please check your permissions and try again.");
        }
      }
      
      // Update local stream state
      localStreamRef.current = stream;
      setState(prev => ({
        ...prev,
        localStream: stream,
        isAudioOnly
      }));
      
      return { stream, isAudioOnly };
    } catch (err) {
      console.error('Error initializing local stream:', err);
      throw err;
    }
  }, []);
    // Create peer connection for a specific participant
  const createPeerConnection = useCallback((targetParticipantId: string) => {
    // Validate participant ID first to prevent undefined IDs
    if (!targetParticipantId || targetParticipantId === 'undefined') {
      console.error('Invalid participant ID - cannot create peer connection for:', targetParticipantId);
      return null;
    }
    
    console.log(`Creating peer connection for participant: ${targetParticipantId}`);
    
    if (!localStreamRef.current) {
      console.error('Cannot create peer connection: No local stream');
      return null;
    }
    
    // Create and configure peer connection with advanced options
    const peerConnection = new RTCPeerConnection({
      ...iceServers,
      // Add additional RTCPeerConnection options for better reliability
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });
    
    // Add local stream tracks to peer connection
    localStreamRef.current.getTracks().forEach(track => {
      console.log(`Adding track to peer connection for ${targetParticipantId}: ${track.kind}, enabled: ${track.enabled}`);
      
      try {
        peerConnection.addTrack(track, localStreamRef.current!);
      } catch (e) {
        console.error(`Failed to add ${track.kind} track:`, e);
      }
    });
    
    // Handle ICE candidates for this peer connection
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && activeRoom) {
        console.log(`Generated ICE candidate for ${targetParticipantId}:`, event.candidate);
        
        // Send ICE candidate via signaling
        sendSignalMessage({
          type: 'ice_candidate',
          candidate: event.candidate,
          roomId: activeRoom.id,
          userId,
          targetParticipantId
        });
      } else if (!event.candidate) {
        console.log(`ICE candidate gathering complete for ${targetParticipantId}`);
      }
    };
    
    // Log ICE gathering state changes
    peerConnection.onicegatheringstatechange = () => {
      console.log(`ICE gathering state for ${targetParticipantId}: ${peerConnection.iceGatheringState}`);
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state changed for ${targetParticipantId}: ${peerConnection.connectionState}`);
      
      // Update overall connection state based on all peer connections
      const allConnected = Array.from(peerConnectionsRef.current.values())
        .every(pc => pc.connectionState === 'connected');
      
      setIsConnected(allConnected);
      
      if (peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'closed' ||
          peerConnection.connectionState === 'disconnected') {
        console.error(`WebRTC connection for ${targetParticipantId} ${peerConnection.connectionState}`);
      }
    };
    
    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state changed for ${targetParticipantId}: ${peerConnection.iceConnectionState}`);
      if (peerConnection.iceConnectionState === 'failed' || 
          peerConnection.iceConnectionState === 'disconnected') {
        console.error(`ICE connection for ${targetParticipantId} ${peerConnection.iceConnectionState}. This might happen if NAT traversal fails.`);
      }
    };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log(`Remote track received from ${targetParticipantId}:`, event.streams);
      if (event.streams && event.streams.length > 0) {
        const remoteStream = event.streams[0];
        console.log(`Setting remote stream for ${targetParticipantId} with tracks:`, remoteStream.getTracks().map(t => t.kind));
        
        // Store remote stream for this participant
        remoteStreamsRef.current.set(targetParticipantId, remoteStream);
        
        // Update state with all remote streams
        setState(prev => ({ 
          ...prev, 
          remoteStreams: new Map(remoteStreamsRef.current)
        }));
      } else {
        console.warn(`Received track event from ${targetParticipantId} without streams`);
      }
    };
    
    // Store this peer connection in the map
    peerConnectionsRef.current.set(targetParticipantId, peerConnection);
    
    // Update state with all peer connections
    setState(prev => ({ 
      ...prev, 
      peerConnections: new Map(peerConnectionsRef.current)
    }));
    
    return peerConnection;
  }, [activeRoom, userId, sendSignalMessage, iceServers]);
  
  // Initialize a call with a specific participant or all participants in a group
  const initializeCall = useCallback(async (isAudioOnly: boolean = false, targetParticipantId?: string) => {    try {
      if (!activeRoom) {
        console.error('Cannot initialize call: No active room');
        return null;
      }
      
      // Only clean up if explicitly requested (optional parameter)
      // Otherwise, keep existing connections
      
      // Initialize local media stream first (reuse existing if available)
      const { stream } = localStreamRef.current 
        ? { stream: localStreamRef.current } 
        : await initializeLocalStream(isAudioOnly);
      
      const participants = activeRoom.participants || [];
      let targetParticipants: string[] = [];
      
      // Determine target participants
      if (targetParticipantId) {
        // One-on-one call to a specific participant
        targetParticipants = [targetParticipantId];      } else if (activeRoom.isGroup) {
        // Group call to all participants except self
        targetParticipants = participants
          .filter(p => p && (p.id || p.user_id)) // Ensure participant exists and has an ID
          .map(p => {
            const id = String(p.id || p.user_id);
            console.log(`Found group participant with ID: ${id}`);
            return id;
          })
          .filter(id => id && id !== "undefined" && id !== String(userId));      } else {
        // One-on-one call to the other participant in a non-group chat
        console.log('Finding other participant in non-group chat. All participants:', JSON.stringify(participants));
        
        // Additional debugging
        if (!participants || participants.length === 0) {
          console.error('No participants available in the room to call');
        }
        
        // First try to find a participant that's not the current user
        const otherParticipant = participants.find(p => {
          // Ensure p exists and has either id or user_id
          if (!p || (!p.id && !p.user_id)) {
            console.log('Found invalid participant in list:', p);
            return false;
          }
          
          const participantId = String(p.id || p.user_id);
          const currentUserId = String(userId);
          console.log(`Comparing participant ${participantId} with current user ${currentUserId}`);
          
          return participantId !== currentUserId;
        });
        
        if (otherParticipant) {
          const participantId = String(otherParticipant.id || otherParticipant.user_id);
          console.log('Found other participant with ID:', participantId);
          
          // Extra validation to prevent undefined IDs
          if (participantId && participantId !== "undefined") {
            targetParticipants = [participantId];
          } else {
            console.error('Invalid participant ID detected:', participantId);
          }
        } else {
          console.error('Could not find any valid participants to call');
        }
      }
      
      console.log(`Initializing call to participants:`, targetParticipants);
      
      // Store participants list in state
      setState(prev => ({
        ...prev,
        participants: targetParticipants
      }));
      
      if (targetParticipants.length === 0) {
        console.warn('No participants to call');
        return null;
      }
      
      // Create a peer connection for each target participant
      const peerConnections = targetParticipants.map(participantId => 
        createPeerConnection(participantId)
      ).filter(Boolean);
      
      return { stream, peerConnections };
    } catch (err) {
      console.error('Error initializing call:', err);
      cleanup();
      throw err;
    }
  }, [activeRoom, userId, cleanup, initializeLocalStream, createPeerConnection]);
  // Create and send offer to start a call with a participant or group
  const createOffer = useCallback(async (isAudioOnly: boolean = false, targetParticipantId?: string) => {
    if (!activeRoom) {
      console.error('Cannot create offer: No active room');
      return;
    }
    
    // Validate targetParticipantId if provided
    if (targetParticipantId && (targetParticipantId === 'undefined' || targetParticipantId === 'null')) {
      console.error('Invalid target participant ID provided:', targetParticipantId);
      return;
    }

    try {
      // Always convert userId to string to ensure consistent display and prevent NaN
      // Handle format: user-13, user-1, etc.
      const userIdStr = userId ? String(userId) : 'unknown';
      console.log(`Creating offer for ${isAudioOnly ? 'audio-only' : 'video'} call by user ${userIdStr}`);
        try {
        // Initialize the call (this might switch to audio-only if video fails)
        console.log(`Initializing call with targetParticipantId: ${targetParticipantId || 'none (group call)'}`);
        const result = await initializeCall(isAudioOnly, targetParticipantId);
        
        if (!result) {
          console.error('Call initialization failed - no result returned');
          return;
        }
        
        // Create an offer for each peer connection
        const participants = state.participants || [];
        console.log(`Creating offers for participants: ${JSON.stringify(participants)}`);
        
        if (participants.length === 0) {
          console.error('No participants to create offers for. Check if participant IDs were properly extracted.');
          return;
        }
        
        for (const participantId of participants) {
          const peerConnection = peerConnectionsRef.current.get(participantId);
          if (!peerConnection) {
            console.warn(`No peer connection for participant ${participantId}`);
            continue;
          }
          
          console.log(`Creating offer for participant ${participantId}`);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          sendSignalMessage({
            type: 'call_offer',
            sdp: offer,
            roomId: activeRoom.id,
            userId,
            targetParticipantId: participantId,
            isAudioOnly
          });
        }

        setState(prev => ({ ...prev, isInitiator: true }));
      } catch (initError) {
        console.error("Failed to initialize media for call:", initError);
        alert(`Could not access your camera or microphone. Please check your device permissions and try again.`);
        return;
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      // Show alert to user
      alert(`Failed to start call: ${err instanceof Error ? err.message : 'Unknown error'}`);
      cleanup();
    }
  }, [activeRoom, userId, state.participants, initializeCall, sendSignalMessage, cleanup]);
    // Handle receiving a call offer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, isAudioOnly: boolean, fromParticipantId: string) => {
    if (!activeRoom) {
      console.error('Cannot handle offer: No active room');
      return;
    }

    // Add a guard to prevent processing the same offer multiple times
    if (peerConnectionsRef.current.has(fromParticipantId)) {
      console.log(`Already have a peer connection for ${fromParticipantId}, ignoring duplicate offer`);
      return;
    }

    try {
      console.log(`Handling offer from participant ${fromParticipantId} for ${isAudioOnly ? 'audio-only' : 'video'} call`);
      
      // Initialize local stream if not already done
      if (!localStreamRef.current) {
        await initializeLocalStream(isAudioOnly);
      }
        // Create or get peer connection for this participant
      let peerConnection = peerConnectionsRef.current.get(fromParticipantId);
      if (!peerConnection) {
        const newPeerConnection = createPeerConnection(fromParticipantId);
        if (!newPeerConnection) {
          throw new Error('Failed to create peer connection');
        }
        peerConnection = newPeerConnection;
      }
      
      // Set remote description from offer
      console.log('Setting remote description from offer');
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create answer
      console.log('Creating answer');
      const answer = await peerConnection.createAnswer();
      
      // Set local description from answer
      console.log('Setting local description from answer');
      await peerConnection.setLocalDescription(answer);

      // Send answer back
      sendSignalMessage({
        type: 'call_answer',
        sdp: answer,
        roomId: activeRoom.id,
        userId,
        targetParticipantId: fromParticipantId
      });

      // Update participants list if not already included
      setState(prev => {
        const participants = [...prev.participants];
        if (!participants.includes(fromParticipantId)) {
          participants.push(fromParticipantId);
        }
        return { 
          ...prev, 
          participants,
          isInitiator: false 
        };
      });
    } catch (err) {
      console.error('Error handling offer:', err);
      // Show alert to user
      alert(`Failed to answer call: ${err instanceof Error ? err.message : 'Unknown error'}`);
      cleanup();
    }
  }, [activeRoom, userId, initializeLocalStream, createPeerConnection, sendSignalMessage, cleanup]);

  // Handle receiving a call answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit, fromParticipantId: string) => {
    try {
      console.log(`Handling answer from participant ${fromParticipantId}`);
      
      const peerConnection = peerConnectionsRef.current.get(fromParticipantId);
      if (!peerConnection) {
        console.error(`Cannot handle answer: No peer connection for participant ${fromParticipantId}`);
        return;
      }
      
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`Successfully set remote description for participant ${fromParticipantId}`);
    } catch (err) {
      console.error(`Error handling answer from ${fromParticipantId}:`, err);
      
      // If this specific connection fails, don't terminate the entire call
      // Just remove this participant from the active connections
      peerConnectionsRef.current.delete(fromParticipantId);
      remoteStreamsRef.current.delete(fromParticipantId);
      
      // Update state
      setState(prev => {
        const peerConnections = new Map(peerConnectionsRef.current);
        const remoteStreams = new Map(remoteStreamsRef.current);
        const participants = prev.participants.filter(id => id !== fromParticipantId);
        
        return {
          ...prev,
          peerConnections,
          remoteStreams,
          participants
        };
      });
    }
  }, []);
  
  // Handle receiving an ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit, fromParticipantId: string) => {
    try {
      if (!candidate) {
        console.error('Received empty ICE candidate');
        return;
      }
      
      const peerConnection = peerConnectionsRef.current.get(fromParticipantId);
      if (!peerConnection) {
        console.error(`Cannot handle ICE candidate: No peer connection for participant ${fromParticipantId}`);
        return;
      }
      
      console.log(`Adding ICE candidate from participant ${fromParticipantId}:`, candidate);
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`Successfully added ICE candidate for participant ${fromParticipantId}`);
    } catch (err) {
      console.error(`Error handling ICE candidate from ${fromParticipantId}:`, err);
    }
  }, []);
  
  // Add participant to an ongoing call
  const addParticipant = useCallback(async (participantId: string) => {
    if (!activeRoom || !localStreamRef.current) {
      console.error('Cannot add participant: No active room or local stream');
      return;
    }
    
    try {
      console.log(`Adding participant ${participantId} to call`);
      
      // Create a peer connection for this participant
      const peerConnection = createPeerConnection(participantId);
      if (!peerConnection) return;
      
      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      sendSignalMessage({
        type: 'call_offer',
        sdp: offer,
        roomId: activeRoom.id,
        userId,
        targetParticipantId: participantId,
        isAudioOnly: state.isAudioOnly
      });
      
      // Update participants list
      setState(prev => {
        const participants = [...prev.participants];
        if (!participants.includes(participantId)) {
          participants.push(participantId);
        }
        return { ...prev, participants };
      });
    } catch (err) {
      console.error(`Error adding participant ${participantId}:`, err);
    }
  }, [activeRoom, userId, state.isAudioOnly, createPeerConnection, sendSignalMessage]);
  
  // Remove participant from call
  const removeParticipant = useCallback((participantId: string) => {
    console.log(`Removing participant ${participantId} from call`);
    
    // Close the peer connection for this participant
    const peerConnection = peerConnectionsRef.current.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(participantId);
    }
    
    // Remove remote stream
    remoteStreamsRef.current.delete(participantId);
    
    // Update state
    setState(prev => {
      const peerConnections = new Map(peerConnectionsRef.current);
      const remoteStreams = new Map(remoteStreamsRef.current);
      const participants = prev.participants.filter(id => id !== participantId);
      
      return {
        ...prev,
        peerConnections,
        remoteStreams,
        participants
      };
    });
    
    // If this was the last participant in a one-on-one call, end the call
    if (!activeRoom?.isGroup && peerConnectionsRef.current.size === 0) {
      cleanup();
    }
  }, [activeRoom, cleanup]);
  
  // Handle participant leaving call
  const handleParticipantLeft = useCallback((participantId: string) => {
    console.log(`Participant ${participantId} left the call`);
    removeParticipant(participantId);
  }, [removeParticipant]);
  
  // Handle call end
  const endCall = useCallback(() => {
    console.log('Ending call and sending call_end signal');
    
    // First stop all media tracks to ensure camera and mic are turned off
    if (localStreamRef.current) {
      console.log('Stopping all local media tracks...');
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });
    }
    
    if (activeRoom) {
      console.log('Sending call_end signal');
      sendSignalMessage({
        type: 'call_end',
        roomId: activeRoom.id,
        userId
      });
    }
    
    cleanup();
  }, [activeRoom, userId, sendSignalMessage, cleanup]);  // Track if this is the initial mount to prevent cleanup on first render
  const isInitialMount = useRef(true);
  
  // Clean up only on unmount, not when room changes
  useEffect(() => {
    // Skip cleanup on first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Only return the cleanup function for when the component unmounts
    return () => {
      console.log('Component unmounting - performing final cleanup');
      cleanup();
    };
  }, []); // Empty dependency array to only run on mount/unmount

  return {
    ...state,
    isConnected,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    addParticipant,
    removeParticipant,
    handleParticipantLeft,
    endCall
  };
};
