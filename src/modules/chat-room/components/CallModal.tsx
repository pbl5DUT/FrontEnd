import React, { useEffect, useRef, useState } from 'react';
import styles from './CallModal.module.css';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiUserPlus } from 'react-icons/fi';
import Avatar from './Avatar';
import { useWebRTC } from '../services/useWebRTC';
import { ChatRoom } from './types';

interface CallModalProps {
  activeRoom: ChatRoom | null;
  userId: string | number;
  sendSignalMessage: (message: any) => void;
  onClose: () => void;
  isAudioOnly: boolean;
  incomingOffer?: RTCSessionDescriptionInit;
}

const CallModal: React.FC<CallModalProps> = ({
  activeRoom,
  userId,
  sendSignalMessage,
  onClose,
  isAudioOnly,
  incomingOffer
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(isAudioOnly);
  const [participants, setParticipants] = useState<number[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const {
    localStream,
    remoteStream,
    isConnected,
    isInitiator,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    endCall
  } = useWebRTC({
    activeRoom,
    userId,
    sendSignalMessage
  });

  // Initialize participants
  useEffect(() => {
    if (activeRoom) {
      const roomParticipants = activeRoom.participants.map(p => Number(p.id));
      setParticipants(roomParticipants);
    }
  }, [activeRoom]);

  // Set up local and remote streams
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);
  // Handle incoming call
  useEffect(() => {
    if (incomingOffer) {
      handleOffer(incomingOffer, isAudioOnly);
    } else {
      // Start outgoing call
      createOffer(isAudioOnly);
    }
  }, [incomingOffer, isAudioOnly, handleOffer, createOffer]);

  // Listen for WebRTC signaling events
  useEffect(() => {
    const handleWebRTCSignal = (event: CustomEvent) => {
      const data = event.detail;
      
      if (data.type === 'call_answer' && isInitiator) {
        // Handle call answer when we are the caller
        handleAnswer(data.sdp);
      } else if (data.type === 'ice_candidate') {
        // Handle ICE candidate
        handleIceCandidate(data.candidate);
      }
    };

    window.addEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    
    return () => {
      window.removeEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    };
  }, [isInitiator, handleAnswer, handleIceCandidate]);

  // Handle mute toggle
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn('No audio tracks found');
        return;
      }
      
      console.log(`Toggling audio mute, current state: ${isMuted}`);
      audioTracks.forEach(track => {
        console.log(`Setting audio track enabled: ${isMuted}`);
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };  // Handle video toggle
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length === 0) {
        console.warn('No video tracks found');
        return;
      }
      
      console.log(`Toggling video, current state: ${isVideoOff ? 'OFF' : 'ON'}`);
      videoTracks.forEach(track => {
        const newState = !isVideoOff;
        console.log(`Setting video track enabled: ${!newState}`);
        track.enabled = !newState;
      });
      
      setIsVideoOff(!isVideoOff);
    } else {
      console.warn('No localStream available for toggling video');
    }
  };
  // Handle call end
  const handleEndCall = () => {
    console.log('Ending call and releasing resources');
    endCall();
    onClose();
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      console.log('CallModal unmounting, cleaning up resources');
      endCall();
    };
  }, [endCall]);
  // Get caller name
  const getCallerName = () => {
    if (!activeRoom) return 'Unknown';
    return activeRoom.name;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.callModal}>
        <div className={styles.callHeader}>
          <h2>Call with {getCallerName()}</h2>
        </div>
        
        <div className={styles.videoContainer}>
          {isAudioOnly ? (
            <div className={styles.audioOnlyContainer}>
              <Avatar 
                name={activeRoom?.name || ''}
                size="large"
                isOnline={true}
                isGroup={activeRoom?.isGroup || false}
              />
              <div className={styles.callerName}>{getCallerName()}</div>
              <div className={styles.callStatus}>
                {isConnected ? 'Connected' : incomingOffer ? 'Answering call...' : 'Calling...'}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.remoteVideo}>
                {remoteStream ? (
                  <video ref={remoteVideoRef} autoPlay playsInline />
                ) : (
                  <div className={styles.waitingForConnection}>
                    {isConnected ? 'Connected' : incomingOffer ? 'Answering call...' : 'Calling...'}
                  </div>
                )}
              </div>
              <div className={styles.localVideo}>
                <video ref={localVideoRef} autoPlay playsInline muted />
              </div>
            </>
          )}
        </div>
        
        <div className={styles.callControls}>
          <button 
            className={`${styles.controlButton} ${isMuted ? styles.controlActive : ''}`}
            onClick={toggleMute}
          >
            {isMuted ? <FiMicOff /> : <FiMic />}
          </button>
          
          {!isAudioOnly && (
            <button 
              className={`${styles.controlButton} ${isVideoOff ? styles.controlActive : ''}`}
              onClick={toggleVideo}
            >
              {isVideoOff ? <FiVideoOff /> : <FiVideo />}
            </button>
          )}
          
          <button 
            className={`${styles.controlButton} ${styles.endCallButton}`}
            onClick={handleEndCall}
          >
            <FiPhoneOff />
          </button>
          
          {isConnected && activeRoom?.isGroup && (
            <button className={styles.controlButton}>
              <FiUserPlus />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
