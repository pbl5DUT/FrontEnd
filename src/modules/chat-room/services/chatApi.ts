import axiosInstance from '../../../services/axiosInstance';
import { ChatMessage, ChatRoom, CreateRoomParams, SendMessageParams, UploadAttachmentParams } from './types';
import { formatChatRoomFromResponse, formatContactFromResponse, formatMessageFromResponse } from './formatters';
import { CHATROOMS_ENDPOINT } from './constants';

/**
 * Tải danh sách phòng chat và người dùng
 */
export const fetchChatRooms = async () => {
  const response = await axiosInstance.get(CHATROOMS_ENDPOINT);
  const formattedRooms = response.data.map(formatChatRoomFromResponse);
  
  const usersResponse = await axiosInstance.get('/users/');
  const formattedContacts = usersResponse.data.map(formatContactFromResponse);
  
  return { rooms: formattedRooms, contacts: formattedContacts };
};

/**
 * Tải tin nhắn cho một phòng chat cụ thể
 */
export const fetchMessages = async (roomId: string | number) => {
  const response = await axiosInstance.get(`/chatrooms/${roomId}/messages/`);
  return {
    messages: response.data.map(formatMessageFromResponse),
    unreadMessageIds: response.data
      .filter((msg: any) => !msg.is_read && msg.receiver_id?.user_id)
      .map((msg: any) => msg.message_id)
  };
};

/**
 * Gửi tin nhắn qua API
 */
export const sendMessageViaApi = async ({ roomId, text, receiverId, tempId }: SendMessageParams) => {
  console.log('Original roomId in API call:', roomId);
  
  // Safely format the roomId, ensuring we don't end up with NaN
  let formattedRoomId = roomId;
//   if (typeof roomId === 'string') {
//     // If the ID already has the required prefix, use it as is
//     if (roomId.startsWith('chat-') ) {
//       formattedRoomId = roomId;
//     } else {
//       // Otherwise, add the prefix
//       formattedRoomId = `chat-${roomId}`;
//     }
//   } else if (roomId) {
//     // It's a number, add the prefix
//     formattedRoomId = `chat-${roomId}`;
//   } else {
//     // Handle null or undefined roomId - this shouldn't happen but for safety
//     console.error('Invalid roomId provided:', roomId);
//     throw new Error('Invalid room ID');
//   }
  
  console.log('Sending message to chatroom:', formattedRoomId);

  // Sửa URL endpoint từ /chatrooms/{id}/messages/ thành /messages/
  const response = await axiosInstance.post(`/messages/`, {
    content: text,
    chatroom_id: formattedRoomId,  // Truyền chatroom_id trong body
    receiver_id: receiverId,
    temp_id: tempId
  });
    const formattedResponse = formatMessageFromResponse(response.data);
  return {
    formattedResponse,
    tempId
  };
};

/**
 * Tạo phòng chat mới
 */
export const createNewChatRoom = async ({ name, participantIds, isDirectChat }: CreateRoomParams): Promise<ChatRoom> => {
  console.log('Creating chat room with API:', { name, participantIds, isDirectChat });
  
  try {
    const response = await axiosInstance.post(CHATROOMS_ENDPOINT, {
      name,
      participant_ids: participantIds,
      is_direct: isDirectChat || false
    });
    
    console.log('Chat room creation API response:', response.data);
    
    // Validate that we got a valid response
    if (!response.data || !response.data.chatroom_id) {
      console.error('Invalid API response when creating chat room:', response.data);
      throw new Error('Server returned invalid data when creating chat room');
    }
    
    // Format and return the new chat room
    return formatChatRoomFromResponse(response.data);
  } catch (error: any) {
    console.error('API Error creating chat room:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload file đính kèm
 */
export const uploadFileAttachment = async ({ roomId, file, receiverId }: UploadAttachmentParams): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chatroom_id', roomId.toString());
  
  if (receiverId) {
    formData.append('receiver_id', receiverId.toString());
  }
  
  const response = await axiosInstance.post(
    `/messages/upload_attachment/`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return formatMessageFromResponse(response.data);
};
