# WebRTC Video and Voice Calling Implementation

This document describes the WebRTC implementation for the chat application, including the components, functionality, and how they interact.

## Components

### 1. ChatRoomModular.tsx
The main component that orchestrates the WebRTC connections and manages the application state. It contains:
- WebRTC connection initialization
- Call state management
- Signal handling through WebSockets
- Event listeners for call events
- Methods for starting, accepting, rejecting, and ending calls

### 2. CallUI.tsx
Displays the UI for active calls, including:
- Video streams for video calls
- Audio-only interface for voice calls
- Call controls (mute, video toggle, end call)
- Connection status and call duration

### 3. IncomingCallNotification.tsx
Notification shown when receiving a call:
- Caller information
- Call type (audio/video)
- Accept/reject buttons
- Auto-rejection after timeout

## WebRTC Implementation Flow

### Starting a Call
1. User clicks on voice/video call button for a contact
2. Media devices are accessed (microphone for voice, microphone + camera for video)
3. RTCPeerConnection is created with STUN/TURN servers
4. Local media stream is added to the peer connection
5. Event handlers for ICE candidates, tracks, and connection state changes are set up
6. Offer is created and set as local description
7. Offer is sent through WebSocket to the target user
8. Active call state is updated

### Receiving a Call
1. WebSocket receives call_offer signal
2. IncomingCallNotification is shown to the user
3. If accepted:
   - Media devices are accessed
   - RTCPeerConnection is created
   - Local media stream is added to the connection
   - Remote description is set from the offer
   - Answer is created and set as local description
   - Answer is sent back through WebSocket
   - Call UI is shown
4. If rejected:
   - call_rejected signal is sent back

### ICE Candidate Exchange
1. When ICE candidates are gathered, they're sent to the peer through WebSocket
2. When receiving ICE candidates, they're added to the peer connection

### Ending a Call
1. call_end signal is sent to the peer
2. Local resources are cleaned up:
   - Media tracks are stopped
   - Peer connection event handlers are removed
   - Peer connection is closed
3. Call state is reset

## Error Handling & Recovery
- Connection state monitoring with potential reconnection
- Proper cleanup of resources when calls end or fail
- Fallback to TURN servers when direct connection isn't possible
- Timeout for unanswered calls

## Testing
To test the WebRTC functionality:
1. Log in with two different user accounts in separate browsers or browser tabs
2. Navigate to the chat room between these users
3. Initiate a voice or video call from one user
4. Accept the call on the other user

## Notes
- Requires HTTPS in production for WebRTC to work
- TURN server credentials should be secured and not hardcoded in production
- Mobile browser compatibility varies
