// Re-export all components for easier imports
export { default as Avatar } from './Avatar';
export { default as SearchBox } from './SearchBox';
export { default as Tabs } from './Tabs';
export { default as ContactsList } from './ContactsList';
export { default as CreateChatModal } from './CreateChatModal';
export { default as Sidebar } from './Sidebar';
export { default as ChatHeader } from './ChatHeader';
export { default as MessagesList } from './MessagesList';
export { default as MessageInput } from './MessageInput';
export { default as ParticipantsPanel } from './ParticipantsPanel';
export { default as ChatArea } from './ChatArea';
export { default as ChatRoomModular } from './ChatRoomModular';

// Export types
export * from './types';

// Export adapters
export * from './adapters';

// Default export is the main ChatRoomModular component
export { default } from './ChatRoomModular';
