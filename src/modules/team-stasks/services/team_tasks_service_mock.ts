// modules/stacks/services/teamTasksServiceMock.ts
import {
  Task,
  TaskStatus,
  TaskPriority,
  Project,
  TaskAssignee,
  TaskComment,
  TaskAttachment,
  UserRole,
} from '../types/teamStasks';

// Danh sách người dùng mẫu
const mockUsers: TaskAssignee[] = [
  { id: 'user1', name: 'Nguyễn Văn A', avatar: 'A', role: UserRole.USER },
  { id: 'user2', name: 'Trần Thị B', avatar: 'B', role: UserRole.USER },
  { id: 'user3', name: 'Lê Văn C', avatar: 'C', role: UserRole.USER },
  { id: 'user4', name: 'Phạm Thị D', avatar: 'D', role: UserRole.USER },
  { id: 'manager1', name: 'Quản lý 1', avatar: 'Q', role: UserRole.MANAGE },
];

// Dữ liệu mẫu cho dự án
const mockProjects: Project[] = [
  {
    id: 'project1',
    name: 'Website Ecommerce',
    members: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[4]],
  },
  {
    id: 'project2',
    name: 'Mobile App',
    members: [mockUsers[0], mockUsers[3], mockUsers[4]],
  },
  {
    id: 'project3',
    name: 'CRM System',
    members: [mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
  },
];

// Dữ liệu mẫu cho comment
const mockComments: TaskComment[] = [
  {
    id: 'comment1',
    userId: 'user2',
    userName: 'Trần Thị B',
    userAvatar: 'B',
    content: 'Tôi đã cập nhật wireframe, bạn xem lại giúp mình nhé.',
    createdAt: '2025-05-05T10:30:00Z',
  },
  {
    id: 'comment2',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userAvatar: 'A',
    content: 'Đã xem wireframe, tôi sẽ tiến hành thiết kế UI.',
    createdAt: '2025-05-05T14:15:00Z',
  },
  {
    id: 'comment3',
    userId: 'manager1',
    userName: 'Quản lý 1',
    userAvatar: 'Q',
    content: 'Mọi người cố gắng hoàn thành theo deadline nhé.',
    createdAt: '2025-05-06T09:00:00Z',
  },
];

// Dữ liệu mẫu cho tệp đính kèm
const mockAttachments: TaskAttachment[] = [
  {
    id: 'attachment1',
    name: 'wireframe.pdf',
    url: '/files/wireframe.pdf',
    type: 'application/pdf',
    size: 2048000,
    uploadedBy: 'user2',
    uploadedAt: '2025-05-05T10:28:00Z',
  },
  {
    id: 'attachment2',
    name: 'requirements.docx',
    url: '/files/requirements.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1536000,
    uploadedBy: 'manager1',
    uploadedAt: '2025-05-04T11:15:00Z',
  },
];

// Dữ liệu mẫu cho công việc nhóm
const mockTeamTasks: Task[] = [
  {
    id: 'task1',
    title: 'Thiết kế giao diện trang chủ',
    description: 'Tạo wireframe và thiết kế UI cho trang chủ ứng dụng',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    assignees: [mockUsers[0], mockUsers[1]],
    createdBy: 'manager1',
    dueDate: '2025-05-10',
    projectId: 'project1',
    projectName: 'Website Ecommerce',
    comments: [mockComments[0], mockComments[1], mockComments[2]],
    attachments: [mockAttachments[0]],
    createdAt: '2025-05-01T08:00:00Z',
    updatedAt: '2025-05-05T14:15:00Z',
  },
  {
    id: 'task2',
    title: 'Xây dựng API authentication',
    description: 'Phát triển API đăng nhập và đăng ký người dùng',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assignees: [mockUsers[0], mockUsers[2]],
    createdBy: 'manager1',
    dueDate: '2025-05-08',
    projectId: 'project1',
    projectName: 'Website Ecommerce',
    comments: [],
    attachments: [mockAttachments[1]],
    createdAt: '2025-05-02T09:30:00Z',
    updatedAt: '2025-05-02T09:30:00Z',
  },
  {
    id: 'task3',
    title: 'Tạo tài liệu hướng dẫn sử dụng',
    description: 'Viết tài liệu hướng dẫn sử dụng cho người dùng mới',
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    assignees: [mockUsers[0], mockUsers[3]],
    createdBy: 'manager1',
    dueDate: '2025-05-01',
    projectId: 'project2',
    projectName: 'Mobile App',
    comments: [],
    attachments: [],
    createdAt: '2025-04-20T10:00:00Z',
    updatedAt: '2025-05-01T16:45:00Z',
  },
  {
    id: 'task4',
    title: 'Triển khai tính năng thông báo',
    description: 'Triển khai hệ thống thông báo realtime cho người dùng',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assignees: [mockUsers[0]],
    createdBy: 'manager1',
    dueDate: '2025-05-15',
    projectId: 'project2',
    projectName: 'Mobile App',
    comments: [],
    attachments: [],
    createdAt: '2025-05-03T08:15:00Z',
    updatedAt: '2025-05-03T08:15:00Z',
  },
  {
    id: 'task5',
    title: 'Tối ưu hóa hiệu suất',
    description: 'Tối ưu thời gian tải trang và trải nghiệm người dùng',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.LOW,
    assignees: [mockUsers[1], mockUsers[2], mockUsers[3]],
    createdBy: 'manager1',
    dueDate: '2025-05-20',
    projectId: 'project3',
    projectName: 'CRM System',
    comments: [],
    attachments: [],
    createdAt: '2025-05-04T13:20:00Z',
    updatedAt: '2025-05-04T13:20:00Z',
  },
];

class TeamTasksServiceMock {
  // Lấy tất cả công việc trong nhóm
  async getAllTeamTasks(): Promise<Task[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockTeamTasks;
  }

  // Lấy công việc trong một dự án cụ thể
  async getTasksByProject(projectId: string): Promise<Task[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTeamTasks.filter((task) => task.projectId === projectId);
  }

  // Lấy thông tin chi tiết của một công việc
  async getTaskById(taskId: string): Promise<Task | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const task = mockTeamTasks.find((task) => task.id === taskId);
    return task || null;
  }

  // Tạo công việc mới
  async createTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newTask: Task = {
      ...taskData,
      id: `task${mockTeamTasks.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTeamTasks.push(newTask);
    return newTask;
  }

  // Cập nhật trạng thái công việc
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const taskIndex = mockTeamTasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...mockTeamTasks[taskIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    mockTeamTasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  // Thêm comment vào task
  async addComment(
    taskId: string,
    comment: Omit<TaskComment, 'id' | 'createdAt'>
  ): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const taskIndex = mockTeamTasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const newComment: TaskComment = {
      ...comment,
      id: `comment${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedTask = {
      ...mockTeamTasks[taskIndex],
      comments: [...(mockTeamTasks[taskIndex].comments || []), newComment],
      updatedAt: new Date().toISOString(),
    };

    mockTeamTasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  // Thêm người tham gia vào task
  async addAssignee(taskId: string, assigneeId: string): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const taskIndex = mockTeamTasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const user = mockUsers.find((user) => user.id === assigneeId);
    if (!user) {
      throw new Error('User not found');
    }

    // Kiểm tra xem người dùng đã được gán chưa
    if (mockTeamTasks[taskIndex].assignees.some((a) => a.id === assigneeId)) {
      return mockTeamTasks[taskIndex]; // Đã tồn tại, không thêm nữa
    }

    const updatedTask = {
      ...mockTeamTasks[taskIndex],
      assignees: [...mockTeamTasks[taskIndex].assignees, user],
      updatedAt: new Date().toISOString(),
    };

    mockTeamTasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  // Xóa người tham gia khỏi task
  async removeAssignee(taskId: string, assigneeId: string): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const taskIndex = mockTeamTasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...mockTeamTasks[taskIndex],
      assignees: mockTeamTasks[taskIndex].assignees.filter(
        (a) => a.id !== assigneeId
      ),
      updatedAt: new Date().toISOString(),
    };

    mockTeamTasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  // Lấy danh sách tất cả dự án
  async getAllProjects(): Promise<Project[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockProjects;
  }

  // Lấy danh sách tất cả người dùng
  async getAllUsers(): Promise<TaskAssignee[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockUsers;
  }

  // Lấy danh sách thành viên dự án
  async getProjectMembers(projectId: string): Promise<TaskAssignee[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const project = mockProjects.find((p) => p.id === projectId);
    return project?.members || [];
  }
}

export default new TeamTasksServiceMock();
