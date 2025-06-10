import React, { useRef, useEffect, useState } from 'react';
import styles from './CallUI.module.css';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiWifi } from 'react-icons/fi';

interface CallUIProps {
  isAudioOnly: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callerName: string;
  connectionState?: string; // Use string type to handle all possible connection states
  startTime?: number;
  callStats?: {
    bitrate?: number;
    packetLoss?: number;
    jitter?: number;
    roundTripTime?: number;
    qualityRating?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
}

const CallUI: React.FC<CallUIProps> = ({
  isAudioOnly,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  callerName,
  connectionState = 'new',
  startTime,
  callStats,
  onMuteToggle,
  onVideoToggle,
  onEndCall,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [showStats, setShowStats] = useState<boolean>(false);
  
  // Connect streams to video elements when they change
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);
  
  // Track call duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (remoteStream && startTime) {
      // Initial calculation
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      
      // Start timer to update every second
      timer = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [remoteStream, startTime]);
  
  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get connection status text with better state handling
  const getConnectionStatus = (): string => {
    if (remoteStream && connectionState === 'connected') {
      return formatDuration(callDuration);
    }
    
    switch (connectionState) {
      case 'new': return 'Setting up call...';
      case 'connecting': return 'Connecting...';
      case 'connected': return remoteStream ? formatDuration(callDuration) : 'Connected, waiting for media...';
      case 'reconnecting': return 'Reconnecting...';
      case 'disconnected': return 'Disconnected, attempting to reconnect...';
      case 'failed': return 'Connection failed';
      case 'checking': return 'Testing connection...';
      case 'closed': return 'Call ended';
      case 'completed': return formatDuration(callDuration);
      default: return 'Connecting...';
    }
  };

  // Get the call quality indicator based on stats
  const getCallQualityIndicator = () => {
    if (!callStats || !remoteStream || connectionState !== 'connected') {
      return null;
    }

    const { qualityRating } = callStats;
    
    let qualityColor = '#4CAF50'; // Default green for good quality
    let qualityText = 'Good';
    let bars = 3;
    
    if (qualityRating) {
      switch (qualityRating) {
        case 'excellent':
          qualityColor = '#4CAF50'; // Green
          qualityText = 'Excellent';
          bars = 4;
          break;
        case 'good':
          qualityColor = '#8BC34A'; // Light Green
          qualityText = 'Good';
          bars = 3;
          break;
        case 'fair':
          qualityColor = '#FFC107'; // Yellow
          qualityText = 'Fair';
          bars = 2;
          break;
        case 'poor':
          qualityColor = '#FF5722'; // Orange/Red
          qualityText = 'Poor';
          bars = 1;
          break;
      }
    }
    
    return (
      <div className={styles.qualityIndicator} onClick={() => setShowStats(!showStats)}>
        <FiWifi size={16} color={qualityColor} />
        <span className={styles.qualityText}>{qualityText}</span>
        <div className={styles.signalBars}>
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={styles.bar} 
              style={{ 
                backgroundColor: i < bars ? qualityColor : '#e0e0e0',
                height: `${(i+1) * 3}px`
              }} 
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.callContainer}>
      <div className={styles.callHeader}>
        <h3>{isAudioOnly ? 'Voice Call' : 'Video Call'} with {callerName}</h3>
        <div className={styles.callStatus}>
          {getConnectionStatus()}
          {getCallQualityIndicator()}
        </div>
      </div>
      
      {!isAudioOnly && (
        <div className={styles.videoContainer}>
          <div className={styles.remoteVideo}>
            {remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline />
            ) : (
              <div className={styles.waitingConnection}>
                <div className={styles.connectingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                {getConnectionStatus()}
              </div>
            )}
          </div>
          
          <div className={styles.localVideo}>
            {localStream && !isVideoOff ? (
              <video ref={localVideoRef} autoPlay playsInline muted />
            ) : (
              <div className={styles.videoOffIndicator}>
                Camera Off
              </div>
            )}
          </div>
        </div>
      )}
      
      {isAudioOnly && (
        <div className={styles.audioCallDisplay}>
          <div className={styles.callerAvatar}>
            {callerName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.callerName}>{callerName}</div>
          <div className={styles.callStatus}>
            {getConnectionStatus()}
          </div>
          {getCallQualityIndicator()}
        </div>
      )}
      
      {showStats && callStats && (
        <div className={styles.callStatsContainer}>
          <h4>Call Statistics</h4>
          <div className={styles.statRow}>
            <span>Bitrate:</span>
            <span>{callStats.bitrate ? `${(callStats.bitrate / 1000).toFixed(1)} kbps` : 'N/A'}</span>
          </div>
          <div className={styles.statRow}>
            <span>Packet Loss:</span>
            <span>{callStats.packetLoss !== undefined ? `${callStats.packetLoss.toFixed(2)}%` : 'N/A'}</span>
          </div>
          <div className={styles.statRow}>
            <span>Jitter:</span>
            <span>{callStats.jitter !== undefined ? `${callStats.jitter.toFixed(2)} ms` : 'N/A'}</span>
          </div>
          <div className={styles.statRow}>
            <span>Round Trip Time:</span>
            <span>{callStats.roundTripTime !== undefined ? `${callStats.roundTripTime.toFixed(0)} ms` : 'N/A'}</span>
          </div>
        </div>
      )}
      
      <div className={styles.callControls}>
        <button 
          className={`${styles.controlButton} ${isMuted ? styles.controlActive : ''}`} 
          onClick={onMuteToggle}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
        </button>
        
        {!isAudioOnly && (
          <button 
            className={`${styles.controlButton} ${isVideoOff ? styles.controlActive : ''}`} 
            onClick={onVideoToggle}
            title={isVideoOff ? "Turn video on" : "Turn video off"}
          >
            {isVideoOff ? <FiVideoOff size={24} /> : <FiVideo size={24} />}
          </button>
        )}
        
        <button 
          className={`${styles.controlButton} ${styles.endCallButton}`}
          onClick={onEndCall}
          title="End call"
        >
          <FiPhoneOff size={24} />
        </button>
      </div>
      
      <div className={styles.callTimer}>
        {remoteStream ? 
          connectionState === 'connected' || connectionState === 'completed' ? 
            formatDuration(callDuration) : 'Connecting...' 
          : 'Waiting for connection...'}
      </div>
    </div>
  );
};

export default CallUI;
