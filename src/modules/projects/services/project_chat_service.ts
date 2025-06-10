import { ProjectFormData, Project } from '../types/project';
import { createProject } from './project_service';
import { createNewChatRoom } from '@/modules/chat-room/services/chatApi';
import { ChatRoom } from '@/modules/chat-room/services/types';

/**
 * Creates a project and an associated chat room with the same name and members
 * @param projectData The project data
 * @param currentUserId The ID of the current user
 * @returns Object containing the created project and chat room
 */
export const createProjectWithChatRoom = async (
  projectData: ProjectFormData,
  currentUserId: string | number
): Promise<{ project: Project; chatRoom: ChatRoom | null }> => {
  try {
    // Step 1: Create the project
    const project = await createProject(projectData);
    console.log('Project created successfully:', project);

    // Step 2: Extract user IDs from project data
    const participantIds: string[] = [];
    
    // Extract numeric ID from string format like "user-1"
    const extractUserId = (userId: string | number): string => {
      if (typeof userId === 'string' && userId.startsWith('user-')) {
        return userId; // Return in format "user-1", "user-2"
      }
      return typeof userId === 'number' ? `user-${userId}` : String(userId);
    };
    
    // Add the project manager
    if (project.manager && project.manager.user_id) {
      const managerId = extractUserId(project.manager.user_id);
      if (!participantIds.includes(managerId)) {
        participantIds.push(managerId);
      }
    }
    
    // Add project members
    if (project.members && Array.isArray(project.members)) {
      project.members.forEach(member => {
        if (member.user && member.user.user_id) {
          const memberId = extractUserId(member.user.user_id);
          if (!participantIds.includes(memberId)) {
            participantIds.push(memberId);
          }
        }
      });
    }
    
    // Add current user if not already included
    const currentUserIdStr = extractUserId(currentUserId);
    if (!participantIds.includes(currentUserIdStr)) {
      participantIds.push(currentUserIdStr);
    }

    // Step 3: Create a chat room with the same name and members
    try {
      console.log('Creating chat room with participants:', participantIds);
      
      const chatRoom = await createNewChatRoom({
        name: project.project_name,
        participantIds: participantIds,
        isDirectChat: false
      });
      
      console.log('Chat room created successfully:', chatRoom);
      return { project, chatRoom };
    } catch (error) {
      // If chat room creation fails, still return the project
      console.error('Failed to create chat room:', error);
      return { project, chatRoom: null };
    }
  } catch (error) {
    console.error('Error in createProjectWithChatRoom:', error);
    throw error;
  }
};
