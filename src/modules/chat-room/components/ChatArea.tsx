import React, { useState, useEffect } from 'react';
import styles from './ChatArea.module.css';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import CallModal from './CallModal';
import IncomingCallNotification from './IncomingCallNotification';
import { ChatRoom, Contact } from './types';

interface ChatAreaProps {
  activeRoom: ChatRoom | null;
  activeContact: Contact | null;
  messages: any[];
  userId: number | string;
  showParticipants: boolean;
  setShowParticipants: React.Dispatch<React.SetStateAction<boolean>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  handleAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => void;
  setTypingStatus: (isTyping: boolean) => void;  sendSignalMessage?: (message: any) => void;
  incomingCall?: {
    callerId?: string | number;
    isAudioOnly: boolean;
    offer?: RTCSessionDescriptionInit;
  } | null;
  setIncomingCall?: React.Dispatch<React.SetStateAction<{
    callerId?: string | number;
    isAudioOnly: boolean;
    offer?: RTCSessionDescriptionInit;
  } | null>>;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  activeRoom,
  activeContact,
  messages,
  userId,
  showParticipants,
  setShowParticipants,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleAttachmentUpload,
  setTypingStatus,
  sendSignalMessage,
  incomingCall,
  setIncomingCall
}) => {
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(false);
  
  // Listen for WebRTC signals
  useEffect(() => {
    // If we're already managing incoming calls at the parent level, we don't need this
    if (!setIncomingCall) return;

    const handleWebRTCSignal = (event: CustomEvent) => {
      const data = event.detail;
      
      if (data.type === 'call_offer' && !showCallModal) {
        // Handle incoming call
        setIncomingCall({
          callerId: data.userId,
          isAudioOnly: data.isAudioOnly,
          offer: data.sdp
        });
      } else if (data.type === 'call_end' && (showCallModal || incomingCall)) {
        // Handle call end
        setShowCallModal(false);
        setIncomingCall(null);
      }
    };

    window.addEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    
    return () => {
      window.removeEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    };
  }, [showCallModal, incomingCall, setIncomingCall]);

  const handleVoiceCallClick = () => {
    if (!activeRoom) return;
    setIsAudioOnly(true);
    setShowCallModal(true);
  };

  const handleVideoCallClick = () => {
    if (!activeRoom) return;
    setIsAudioOnly(false);
    setShowCallModal(true);
  };

  const handleAcceptIncomingCall = () => {
    setShowCallModal(true);
  };
  const handleRejectIncomingCall = () => {
    if (setIncomingCall) {
      setIncomingCall(null);
    }
    if (sendSignalMessage && activeRoom) {
      sendSignalMessage({
        type: 'call_end',
        roomId: activeRoom.id,
        userId
      });
    }
  };

  return (
    <div className={styles.chatArea}>
      <ChatHeader 
        activeContact={activeContact}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        onVoiceCallClick={handleVoiceCallClick}
        onVideoCallClick={handleVideoCallClick}
      />
      
      <MessagesList 
        messages={messages}
        userId={userId}
      />
        <MessageInput 
        activeRoom={activeRoom}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleAttachmentUpload={handleAttachmentUpload}
        setTypingStatus={setTypingStatus}
      />      
      {/* Call Modal */}
      {showCallModal && sendSignalMessage && activeRoom && (
        <CallModal
          activeRoom={activeRoom}
          userId={Number(userId)}
          sendSignalMessage={sendSignalMessage}
          onClose={() => {
            console.log('Call modal closing, cleaning up resources');
            setShowCallModal(false);
            if (setIncomingCall) {
              setIncomingCall(null);
            }
            // Send call_end signal when modal is closed to ensure proper cleanup
            if (sendSignalMessage && activeRoom) {
              sendSignalMessage({
                type: 'call_end',
                roomId: activeRoom.id,
                userId
              });
            }
          }}
          isAudioOnly={isAudioOnly}
          incomingOffer={incomingCall?.offer}
        />
      )}
        {/* Incoming Call Notification */}
      {incomingCall && !showCallModal && activeRoom && (
        <IncomingCallNotification
          callerName={
            activeRoom.participants.find(p => p.id === incomingCall.callerId)?.name || 
            'Unknown caller'
          }
          callerAvatar={
            activeRoom.participants.find(p => p.id === incomingCall.callerId)?.avatar
          }
          isAudioOnly={incomingCall.isAudioOnly}
          onAccept={handleAcceptIncomingCall}
          onReject={handleRejectIncomingCall}
        />
      )}
    </div>
  );
};

export default ChatArea;
