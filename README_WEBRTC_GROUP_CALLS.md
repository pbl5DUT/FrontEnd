# WebRTC Group Call Implementation

## Overview
This implementation enhances the existing chat application with WebRTC video calling capabilities, including support for group calls. It builds upon the previously fixed WebRTC implementation for one-on-one calls.

## Features Added
1. **Group Video Call Support**: Multiple participants can join a call in a group chat
2. **Dynamic Video Grid Layout**: Video layout adapts based on the number of participants
3. **Add Participants During Call**: Ability to add more participants to an ongoing call
4. **Improved WebSocket Signaling**: Enhanced backend consumer to support WebRTC signaling for group calls
5. **Audio-Only Mode Support**: Ability to make audio-only calls when video is not required or available
6. **Incoming Call UI**: Updated notification system for incoming calls with audio ringtone

## Implementation Details

### WebRTC Service (`useWebRTC.ts`)
- Replaced single peer connection with a map of peer connections, one per participant
- Added participant management functions (add/remove)
- Implemented multi-stream handling for group calls
- Improved error handling and resource management

### UI Components
- Updated `CallModal.tsx` to support multiple video streams in a grid layout
- Created responsive layouts for different numbers of participants
- Added "Add Participant" functionality in the UI
- Enhanced audio/video controls for better user experience

### Backend Changes
- Updated WebSocket consumer (`consumers.py`) to handle WebRTC signaling for group calls
- Enhanced message handling to support participant-specific signaling
- Added proper handling of ICE candidates in a multi-peer environment

### WebSocket Hook
- Implemented `useWebSocket.ts` hook to handle WebSocket connections and signaling events

## How to Test

### One-on-One Calls
1. Open the chat application in two different browsers or tabs
2. Log in as different users in each browser
3. Start a conversation between the users
4. Click the video call button to initiate a call
5. Accept the call on the other side
6. Test video and audio controls (mute/unmute and video on/off)
7. End the call from either side

### Group Calls
1. Open the chat application in 3+ different browsers or tabs
2. Log in as different users in each browser
3. Create a group chat with these users
4. Initiate a video call from one user
5. Accept the call on the other browsers
6. Test adding a participant during an ongoing call
7. Test the video grid layout with multiple participants
8. Test audio/video controls for each participant
9. End the call and verify all connections are properly closed

### Audio-Only Calls
1. Disable camera permissions in the browser settings
2. Initiate a call
3. Verify that the call falls back to audio-only mode
4. Test audio controls

## Known Limitations
1. Currently limited by device performance - many simultaneous video streams may cause performance issues
2. Mobile browser compatibility may vary
3. Network NAT traversal relies on the configured STUN/TURN servers

## Future Improvements
1. Screen sharing functionality
2. Recording capabilities
3. Better bandwidth management for low-connection environments
4. More advanced UI features like participant lists and call statistics
5. Enhanced security mechanisms
