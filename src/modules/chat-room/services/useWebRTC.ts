import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatRoom as ServiceChatRoom } from '../types/message.types';
import { ChatRoom as ComponentChatRoom } from '../components/types';

interface WebRTCState {
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  isInitiator: boolean;
  isAudioOnly: boolean;
}

type ChatRoomType = ServiceChatRoom | ComponentChatRoom;

interface UseWebRTCOptions {
  activeRoom: ChatRoomType | null;
  userId: string | number;
  sendSignalMessage: (message: any) => void;
}

// ICE servers configuration for WebRTC peer connection
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Free TURN servers - consider adding your own for production
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
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRTC = ({ activeRoom, userId, sendSignalMessage }: UseWebRTCOptions) => {  // State and refs
  const [state, setState] = useState<WebRTCState>({
    isInitiator: false,
    isAudioOnly: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);  // Cleanup function to stop all media tracks and close peer connection
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

    // Then close the peer connection
    if (peerRef.current) {
      console.log('Closing peer connection...');
      peerRef.current.close();
      peerRef.current = null;
    }

    // Reset state
    setState(prev => ({
      ...prev,
      localStream: undefined,
      remoteStream: undefined,
      peerConnection: undefined
    }));
    setIsConnected(false);
    
    console.log('WebRTC cleanup complete');
  }, []);  // Initialize media stream and peer connection for a call
  const initializeCall = useCallback(async (isAudioOnly: boolean = false) => {
    try {
      cleanup();

      console.log(`Initializing call, audio only: ${isAudioOnly}`);

      let streamConstraints = {
        audio: true,
        video: !isAudioOnly
      };

      // First try to get both audio and video (if needed)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(streamConstraints);
        console.log("Successfully accessed camera and microphone");
      } catch (mediaError) {
        console.error("Error accessing media devices:", mediaError);
        
        // If it fails and we were trying video, fall back to audio only
        if (!isAudioOnly) {
          console.log("Falling back to audio only");
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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

      // Create and configure peer connection
      const peerConnection = new RTCPeerConnection(iceServers);
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log(`Adding track to peer connection: ${track.kind}, enabled: ${track.enabled}`);
        peerConnection.addTrack(track, stream);
        
        // Initialize video tracks properly
        if (track.kind === 'video' && isAudioOnly) {
          console.log('Audio-only call: Disabling video track');
          track.enabled = false;
        }
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && activeRoom) {
          console.log('Generated ICE candidate, sending to peer');
          sendSignalMessage({
            type: 'ice_candidate',
            candidate: event.candidate,
            roomId: activeRoom.id,
            userId
          });
        }
      };      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state changed to: ${peerConnection.connectionState}`);
        setIsConnected(peerConnection.connectionState === 'connected');
        
        if (peerConnection.connectionState === 'failed' || 
            peerConnection.connectionState === 'closed' ||
            peerConnection.connectionState === 'disconnected') {
          console.error(`WebRTC connection ${peerConnection.connectionState}`);
        }
      };
      
      // Add ice connection state monitoring
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state changed to: ${peerConnection.iceConnectionState}`);
        if (peerConnection.iceConnectionState === 'failed' || 
            peerConnection.iceConnectionState === 'disconnected') {
          console.error(`ICE connection ${peerConnection.iceConnectionState}. This might happen if NAT traversal fails.`);
        }
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        setState(prev => ({ ...prev, remoteStream }));
      };

      // Update refs and state
      localStreamRef.current = stream;
      peerRef.current = peerConnection;
      setState(prev => ({
        ...prev,
        localStream: stream,
        peerConnection,
        isAudioOnly
      }));

      return { stream, peerConnection };
    } catch (err) {
      console.error('Error initializing call:', err);
      cleanup();
      throw err;
    }
  }, [activeRoom, userId, sendSignalMessage, cleanup]);  // Create and send offer to start a call
  const createOffer = useCallback(async (isAudioOnly: boolean = false) => {
    if (!activeRoom) {
      console.error('Cannot create offer: No active room');
      return;
    }

    try {
      // Use template literal to ensure userId is shown as a string to avoid NaN
      console.log(`Creating offer for ${isAudioOnly ? 'audio-only' : 'video'} call by user ${String(userId)}`);
      
      let peerConnection;
      try {
        // Initialize the call (this might switch to audio-only if video fails)
        const result = await initializeCall(isAudioOnly);
        peerConnection = result.peerConnection;
      } catch (initError) {
        console.error("Failed to initialize media for call:", initError);
        alert(`Could not access your camera or microphone. Please check your device permissions and try again.`);
        return;
      }
      
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log('Setting local description and sending offer');

      sendSignalMessage({
        type: 'call_offer',
        sdp: offer,
        roomId: activeRoom.id,
        userId,
        isAudioOnly
      });

      setState(prev => ({ ...prev, isInitiator: true }));
    } catch (err) {
      console.error('Error creating offer:', err);
      // Show alert to user
      alert(`Failed to start call: ${err instanceof Error ? err.message : 'Unknown error'}`);
      cleanup();
    }
  }, [activeRoom, userId, initializeCall, sendSignalMessage, cleanup]);
  // Handle receiving a call offer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, isAudioOnly: boolean) => {
    if (!activeRoom) {
      console.error('Cannot handle offer: No active room');
      return;
    }

    try {
      console.log(`Handling offer for ${isAudioOnly ? 'audio-only' : 'video'} call`);
      const { peerConnection } = await initializeCall(isAudioOnly);
      
      console.log('Setting remote description from offer');
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      console.log('Creating answer');
      const answer = await peerConnection.createAnswer();
      
      console.log('Setting local description from answer');
      await peerConnection.setLocalDescription(answer);

      sendSignalMessage({
        type: 'call_answer',
        sdp: answer,
        roomId: activeRoom.id,
        userId
      });

      setState(prev => ({ ...prev, isInitiator: false }));
    } catch (err) {
      console.error('Error handling offer:', err);
      // Show alert to user
      alert(`Failed to answer call: ${err instanceof Error ? err.message : 'Unknown error'}`);
      cleanup();
    }
  }, [activeRoom, userId, initializeCall, sendSignalMessage, cleanup]);

  // Handle receiving a call answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.error('Error handling answer:', err);
      cleanup();
      throw err;
    }
  }, [cleanup]);
  // Handle receiving an ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      if (!peerRef.current) {
        console.error('Cannot handle ICE candidate: No peer connection');
        return;
      }
      
      if (!candidate) {
        console.error('Received empty ICE candidate');
        return;
      }
      
      console.log('Adding ICE candidate to peer connection:', candidate);
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('Successfully added ICE candidate');
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  }, []);  // Handle call end
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
  }, [activeRoom, userId, sendSignalMessage, cleanup]);

  // Clean up on unmount or when room changes
  useEffect(() => {
    return cleanup;
  }, [activeRoom?.id, cleanup]);

  return {
    ...state,
    isConnected,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    endCall
  };
};
