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
  fromParticipantId?: string; // Added to track who sent the incoming offer
}

const CallModal: React.FC<CallModalProps> = ({
  activeRoom,
  userId,
  sendSignalMessage,
  onClose,
  isAudioOnly,
  incomingOffer,
  fromParticipantId
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(isAudioOnly);
  const [participants, setParticipants] = useState<string[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState<boolean>(false);
  const [availableContacts, setAvailableContacts] = useState<Array<{id: string, name: string}>>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const handledOfferRef = useRef<boolean>(false);
  
  const {
    localStream,
    remoteStreams,
    peerConnections,
    isConnected,
    isInitiator,
    participants: connectedParticipants,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    addParticipant,
    removeParticipant,
    handleParticipantLeft,
    endCall
  } = useWebRTC({
    activeRoom,
    userId,
    sendSignalMessage
  });

  // Initialize participants
  useEffect(() => {
    if (activeRoom && activeRoom.participants) {
      const roomParticipants = activeRoom.participants
        .map(p => String(p.id || p.user_id))
        .filter(id => id !== String(userId));
      setParticipants(roomParticipants);
    }
  }, [activeRoom, userId]);

  // Set up local stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  // Set up remote streams
  useEffect(() => {
    if (!remoteStreams || remoteStreams.size === 0) return;
    
    // For each remote stream, attach it to the corresponding video element
    remoteStreams.forEach((stream, participantId) => {
      // Find or create video element for this participant
      let videoElement = remoteVideoRefs.current.get(participantId);
      
      if (!videoElement) {
        // Create new video element if it doesn't exist
        videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        
        // Add to refs map
        remoteVideoRefs.current.set(participantId, videoElement);
        
        // Add to the DOM
        const remoteVideosContainer = document.getElementById('remote-videos-container');
        if (remoteVideosContainer) {
          const videoContainer = document.createElement('div');
          videoContainer.className = styles.remoteVideoItem;
          videoContainer.id = `remote-video-${participantId}`;
          videoContainer.appendChild(videoElement);
          remoteVideosContainer.appendChild(videoContainer);
        }
      }
      
      // Set stream as source
      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }
    });
    
    // Clean up any video elements for participants who are no longer connected
    remoteVideoRefs.current.forEach((videoElement, participantId) => {
      if (!remoteStreams.has(participantId)) {
        // Remove from DOM
        const videoContainer = document.getElementById(`remote-video-${participantId}`);
        if (videoContainer) {
          videoContainer.remove();
        }
        
        // Remove from refs map
        remoteVideoRefs.current.delete(participantId);
      }
    });  }, [remoteStreams]);
  
  // Handle incoming call
  useEffect(() => {
    // Use the already defined ref to track if we've already handled this offer to prevent infinite loops
    if (incomingOffer && fromParticipantId && !handledOfferRef.current) {
      handledOfferRef.current = true;
      handleOffer(incomingOffer, isAudioOnly, fromParticipantId);
    } else if (!incomingOffer && !handledOfferRef.current) {
      // Start outgoing call (only once)
      handledOfferRef.current = true;
      createOffer(isAudioOnly);
    }
  }, [incomingOffer, fromParticipantId, isAudioOnly, handleOffer, createOffer]);

  // Listen for WebRTC signaling events
  useEffect(() => {
    const handleWebRTCSignal = (event: CustomEvent) => {
      const data = event.detail;
      
      if (data.type === 'call_answer' && isInitiator) {
        // Handle call answer when we are the caller
        handleAnswer(data.sdp, data.userId);
      } else if (data.type === 'ice_candidate') {
        // Handle ICE candidate
        handleIceCandidate(data.candidate, data.userId);
      } else if (data.type === 'participant_left') {
        // Handle participant leaving
        handleParticipantLeft(data.userId);
      }
    };

    window.addEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    
    return () => {
      window.removeEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    };
  }, [isInitiator, handleAnswer, handleIceCandidate, handleParticipantLeft]);  // Update participants when connected participants change
  useEffect(() => {
    if (connectedParticipants && connectedParticipants.length > 0) {
      // Only update if the participants have actually changed
      // to avoid unnecessary rerenders
      if (JSON.stringify(connectedParticipants) !== JSON.stringify(participants)) {
        setParticipants(connectedParticipants);
      }
    }
  }, [connectedParticipants, participants]);

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
  };
  
  // Handle video toggle
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length === 0) {
        console.warn('No video tracks found');
        return;
      }
      
      console.log(`Toggling video, current state: ${isVideoOff ? 'OFF' : 'ON'}`);
      
      // The correct way to toggle video is to directly set track.enabled
      videoTracks.forEach(track => {
        // When isVideoOff is true, we want to enable video (set to true)
        // When isVideoOff is false, we want to disable video (set to false)
        track.enabled = isVideoOff;
        console.log(`Video track ${track.id} enabled: ${track.enabled}`);
      });
      
      // Update local state after changing track state
      setIsVideoOff(!isVideoOff);
    } else {
      console.warn('No localStream available for toggling video');
    }
  };
  
  // Handle add participant toggle
  const toggleAddParticipant = () => {
    setShowAddParticipant(!showAddParticipant);
    
    // Fetch available contacts that aren't already in the call
    if (!showAddParticipant && activeRoom) {
      // This would typically be a call to your API to get contacts
      // For now, we'll simulate this with a timeout
      setTimeout(() => {
        const allParticipantsIds = activeRoom.participants
          .map(p => String(p.id || p.user_id));
        
        const currentParticipantsIds = connectedParticipants || [];
        
        const availableParticipants = allParticipantsIds
          .filter(id => !currentParticipantsIds.includes(id) && id !== String(userId))
          .map(id => {
            const participant = activeRoom.participants.find(p => 
              String(p.id || p.user_id) === id
            );
            return {
              id,
              name: participant?.name || participant?.username || `User ${id}`
            };
          });
        
        setAvailableContacts(availableParticipants);
      }, 500);
    }
  };
  
  // Handle adding a new participant to the call
  const handleAddParticipant = (participantId: string) => {
    console.log(`Adding participant ${participantId} to call`);
    addParticipant(participantId);
    setShowAddParticipant(false);
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

  // Get layout class based on number of participants
  const getVideoLayoutClass = () => {
    const count = remoteStreams ? remoteStreams.size : 0;
    if (count === 0) return styles.videoContainerEmpty;
    if (count === 1) return styles.videoContainerSingle;
    if (count === 2) return styles.videoContainerDouble;
    if (count === 3) return styles.videoContainerTriple;
    return styles.videoContainerGrid;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.callModal}>
        <div className={styles.callHeader}>
          <h2>
            {activeRoom?.isGroup ? 'Group Call: ' : 'Call with '}
            {getCallerName()}
          </h2>
          {participants.length > 0 && (
            <div className={styles.participantCount}>
              {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
            </div>
          )}
        </div>
        
        <div className={`${styles.videoContainer} ${getVideoLayoutClass()}`}>
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
              <div className={styles.localVideoWrapper}>
                <video ref={localVideoRef} autoPlay playsInline muted />
                <div className={styles.localVideoLabel}>You</div>
              </div>
              
              <div id="remote-videos-container" className={styles.remoteVideosContainer}>
                {remoteStreams && remoteStreams.size > 0 ? (
                  Array.from(remoteStreams.keys()).map(participantId => (
                    <div key={participantId} id={`remote-video-${participantId}`} className={styles.remoteVideoItem}>
                      {/* Video elements will be added to these containers dynamically */}
                      <div className={styles.participantName}>
                        {activeRoom?.participants.find(p => String(p.id || p.user_id) === participantId)?.name || 
                         `Participant ${participantId}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.waitingForConnection}>
                    {isConnected ? 'Connected' : incomingOffer ? 'Answering call...' : 'Calling...'}
                  </div>
                )}
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
            <button 
              className={`${styles.controlButton} ${showAddParticipant ? styles.controlActive : ''}`}
              onClick={toggleAddParticipant}
            >
              <FiUserPlus />
            </button>
          )}
        </div>
        
        {showAddParticipant && (
          <div className={styles.addParticipantPanel}>
            <h3>Add people to call</h3>
            <div className={styles.contactsList}>
              {availableContacts.length > 0 ? (
                availableContacts.map(contact => (
                  <div 
                    key={contact.id} 
                    className={styles.contactItem}
                    onClick={() => handleAddParticipant(contact.id)}
                  >
                    <Avatar 
                      name={contact.name}
                      size="small"
                      isOnline={true}
                      isGroup={false}
                    />
                    <div className={styles.contactName}>{contact.name}</div>
                  </div>
                ))
              ) : (
                <div className={styles.noContacts}>
                  No additional participants available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
