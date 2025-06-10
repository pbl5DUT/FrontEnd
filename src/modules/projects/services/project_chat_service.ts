import { createProject } from './project_service';
import { createNewChatRoom } from '../../chat-room/services/chatApi';
import { Project, ProjectFormData } from '../types/project';

/**
 * Tạo project và chatroom liên quan với cùng tên và thành viên
 */
export const createProjectWithChatRoom = async (projectData: ProjectFormData): Promise<Project> => {
  try {
    console.log('🔄 Creating project with chat room...', projectData);
    
    // 1. Tạo project trước
    const newProject = await createProject(projectData);
    console.log('✅ Project created successfully:', newProject);

    // 2. Chuẩn bị danh sách người tham gia cho chatroom
    // Bao gồm manager và tất cả thành viên của project
    const participantIds: number[] = [];
    
    // Thêm manager vào danh sách (chuyển string sang number)
    const managerId = parseInt(projectData.manager_id, 10);
    if (!isNaN(managerId)) {
      participantIds.push(managerId);
    }

    // Thêm các thành viên khác vào danh sách (nếu có)
    if (projectData.members && Array.isArray(projectData.members)) {
      projectData.members.forEach(member => {
        const memberId = parseInt(member.user_id, 10);
        if (!isNaN(memberId) && !participantIds.includes(memberId)) {
          participantIds.push(memberId);
        }
      });
    }

    // 3. Tạo chatroom với cùng tên và thành viên như project
    if (participantIds.length > 0) {
      await createNewChatRoom({
        name: `Project: ${projectData.project_name}`,
        participantIds: participantIds,
        isDirectChat: false // Phòng chat nhóm, không phải chat riêng tư
      });
      
      console.log(`Chat room created for project: ${projectData.project_name}`);
    } else {
      console.warn(`No participants found for project: ${projectData.project_name}`);
    }

    // 4. Trả về thông tin project đã tạo
    return newProject;
  } catch (error) {
    console.error('Error creating project with chat room:', error);
    throw error;
  }
};
