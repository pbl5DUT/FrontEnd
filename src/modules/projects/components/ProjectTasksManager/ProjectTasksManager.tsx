import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './ProjectTasksManager.module.css';
import TaskCategories from './TaskCategories';
import CategoryTasks from './CategoryTasks';
import TaskDetail from './TaskDetail';

// Định nghĩa các kiểu dữ liệu
interface TaskAssignee {
  user_id: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  role: string;
  assigned_date: string;
}

interface TaskComment {
  id: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  content: string;
  created_at: string;
}

interface TaskAttachment {
  id: string;
  name: string;
  file_type: string;
  file_size: string;
  uploaded_by: string;
  upload_date: string;
  url: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  assignees: TaskAssignee[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
}

// Mock data cho TaskCategory
const mockCategories: TaskCategory[] = [
  {
    id: 'cat-1',
    name: 'Thiết kế UX/UI',
    description: 'Thiết kế giao diện người dùng và trải nghiệm người dùng',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 8,
    completed_tasks_count: 5,
  },
  {
    id: 'cat-2',
    name: 'Backend',
    description: 'Phát triển các API và xử lý dữ liệu phía server',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 12,
    completed_tasks_count: 6,
  },
  {
    id: 'cat-3',
    name: 'Frontend',
    description: 'Xây dựng giao diện người dùng và tích hợp API',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 10,
    completed_tasks_count: 3,
  },
  {
    id: 'cat-4',
    name: 'Testing',
    description: 'Kiểm thử phần mềm và đảm bảo chất lượng',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 6,
    completed_tasks_count: 2,
  },
];

// Mock data cho Task
const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Thiết kế màn hình đăng nhập',
    description:
      'Thiết kế giao diện màn hình đăng nhập với đầy đủ các trường thông tin, bao gồm: tên đăng nhập, mật khẩu, nút đăng nhập, chức năng quên mật khẩu.',
    category_id: 'cat-1',
    category_name: 'Thiết kế UX/UI',
    status: 'Done',
    priority: 'High',
    start_date: '10/08/2024',
    due_date: '15/08/2024',
    created_at: '09/08/2024',
    updated_at: '16/08/2024',
    assignees: [
      {
        user_id: 'user-1',
        user: {
          id: 'user-1',
          full_name: 'Đặng Minh Nhi',
          avatar: null,
        },
        role: 'Designer chính',
        assigned_date: '10/08/2024',
      },
    ],
    comments: [
      {
        id: 'comment-1',
        user: {
          id: 'user-2',
          full_name: 'Hoàng Ngọc Thiên Hương',
          avatar: null,
        },
        content:
          'Thiết kế đẹp, nhưng cần điều chỉnh màu nút đăng nhập cho phù hợp với màu chủ đạo của ứng dụng.',
        created_at: '12/08/2024 14:30:22',
      },
      {
        id: 'comment-2',
        user: {
          id: 'user-1',
          full_name: 'Đặng Minh Nhi',
          avatar: null,
        },
        content:
          'Đã điều chỉnh màu nút theo yêu cầu. Phiên bản mới đã được upload.',
        created_at: '13/08/2024 09:15:45',
      },
    ],
    attachments: [
      {
        id: 'attach-1',
        name: 'login-screen-v1.fig',
        file_type: 'fig',
        file_size: '2.4 MB',
        uploaded_by: 'Đặng Minh Nhi',
        upload_date: '11/08/2024',
        url: '#',
      },
      {
        id: 'attach-2',
        name: 'login-screen-v2.fig',
        file_type: 'fig',
        file_size: '2.5 MB',
        uploaded_by: 'Đặng Minh Nhi',
        upload_date: '13/08/2024',
        url: '#',
      },
    ],
  },
  {
    id: 'task-2',
    name: 'Thiết kế màn hình chính',
    description:
      'Thiết kế giao diện màn hình chính của ứng dụng, hiển thị danh sách bệnh nhân, lịch hẹn, và các chức năng chính.',
    category_id: 'cat-1',
    category_name: 'Thiết kế UX/UI',
    status: 'In Progress',
    priority: 'Medium',
    start_date: '16/08/2024',
    due_date: '22/08/2024',
    created_at: '15/08/2024',
    updated_at: '18/08/2024',
    assignees: [
      {
        user_id: 'user-1',
        user: {
          id: 'user-1',
          full_name: 'Đặng Minh Nhi',
          avatar: null,
        },
        role: 'Designer chính',
        assigned_date: '15/08/2024',
      },
      {
        user_id: 'user-3',
        user: {
          id: 'user-3',
          full_name: 'Trần Lian',
          avatar: null,
        },
        role: 'Hỗ trợ',
        assigned_date: '16/08/2024',
      },
    ],
    comments: [],
    attachments: [
      {
        id: 'attach-3',
        name: 'main-screen-draft.fig',
        file_type: 'fig',
        file_size: '3.1 MB',
        uploaded_by: 'Đặng Minh Nhi',
        upload_date: '17/08/2024',
        url: '#',
      },
    ],
  },
  {
    id: 'task-3',
    name: 'Viết API đăng nhập',
    description:
      'Phát triển API xác thực người dùng, xử lý đăng nhập và tạo JWT token.',
    category_id: 'cat-2',
    category_name: 'Backend',
    status: 'Done',
    priority: 'Urgent',
    start_date: '10/08/2024',
    due_date: '18/08/2024',
    created_at: '09/08/2024',
    updated_at: '17/08/2024',
    assignees: [
      {
        user_id: 'user-4',
        user: {
          id: 'user-4',
          full_name: 'Hoàng Nguyễn Vũ',
          avatar: null,
        },
        role: 'Developer chính',
        assigned_date: '10/08/2024',
      },
    ],
    comments: [
      {
        id: 'comment-3',
        user: {
          id: 'user-4',
          full_name: 'Hoàng Nguyễn Vũ',
          avatar: null,
        },
        content:
          'Đã hoàn thành API. Các bạn có thể test theo document được đính kèm.',
        created_at: '17/08/2024 18:22:10',
      },
    ],
    attachments: [
      {
        id: 'attach-4',
        name: 'auth-api-doc.pdf',
        file_type: 'pdf',
        file_size: '425 KB',
        uploaded_by: 'Hoàng Nguyễn Vũ',
        upload_date: '17/08/2024',
        url: '#',
      },
      {
        id: 'attach-5',
        name: 'auth-api-tests.js',
        file_type: 'js',
        file_size: '32 KB',
        uploaded_by: 'Hoàng Nguyễn Vũ',
        upload_date: '17/08/2024',
        url: '#',
      },
    ],
  },
];

interface ProjectTasksManagerProps {
  projectId: string;
}

const ProjectTasksManager: React.FC<ProjectTasksManagerProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const { categoryId, taskId } = router.query;

  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'categories' | 'tasks' | 'task-detail'>(
    'categories'
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      // Ở đây sẽ gọi API để lấy dữ liệu thực tế
      // Hiện tại dùng mock data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập delay mạng

      setCategories(mockCategories);
      setTasks(mockTasks);
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  // Xử lý khi router query thay đổi
  useEffect(() => {
    if (!loading) {
      if (taskId) {
        // Tìm task từ ID
        const task = tasks.find((t) => t.id === taskId);

        if (task) {
          setSelectedTask(task);

          // Tìm category của task
          const category = categories.find((c) => c.id === task.category_id);
          if (category) {
            setSelectedCategory(category);
          }

          setView('task-detail');
        }
      } else if (categoryId) {
        // Tìm category từ ID
        const category = categories.find((c) => c.id === categoryId);

        if (category) {
          setSelectedCategory(category);
          setView('tasks');
        }
      } else {
        setView('categories');
      }
    }
  }, [loading, categoryId, taskId, categories, tasks]);

  // Xử lý khi thêm danh mục mới
  const handleAddCategory = () => {
    // Hiển thị modal thêm danh mục (sẽ triển khai sau)
    alert('Chức năng thêm danh mục sẽ được triển khai sau');
  };

  // Xử lý khi xem danh mục
  const handleViewCategory = (categoryId: string) => {
    router.push(`/projects/${projectId}/categories/${categoryId}`);
  };

  // Xử lý khi quay lại từ danh mục về danh sách danh mục
  const handleBackToCategories = () => {
    router.push(`/projects/${projectId}`);
  };

  // Xử lý khi thêm công việc mới
  const handleAddTask = () => {
    // Hiển thị modal thêm công việc (sẽ triển khai sau)
    alert('Chức năng thêm công việc sẽ được triển khai sau');
  };

  // Xử lý khi xem chi tiết công việc
  const handleViewTask = (taskId: string) => {
    router.push(
      `/projects/${projectId}/categories/${selectedCategory?.id}/tasks/${taskId}`
    );
  };

  // Xử lý khi quay lại từ chi tiết công việc về danh sách công việc
  const handleBackToTasks = () => {
    router.push(`/projects/${projectId}/categories/${selectedCategory?.id}`);
  };

  // Xử lý khi cập nhật công việc
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    // Ở đây sẽ gọi API để cập nhật task
    // Hiện tại chỉ cập nhật trên state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updated_at: new Date().toLocaleDateString() }
          : task
      )
    );
  };

  // Xử lý khi xóa công việc
  const handleDeleteTask = (taskId: string) => {
    // Ở đây sẽ gọi API để xóa task
    // Hiện tại chỉ xóa trên state
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

    // Cập nhật lại số lượng task trong category
    if (selectedTask) {
      const categoryId = selectedTask.category_id;
      const isDone = selectedTask.status === 'Done';

      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                tasks_count: category.tasks_count - 1,
                completed_tasks_count: isDone
                  ? category.completed_tasks_count - 1
                  : category.completed_tasks_count,
              }
            : category
        )
      );
    }
  };

  // Xử lý khi thêm bình luận
  const handleAddComment = (taskId: string, content: string) => {
    // Ở đây sẽ gọi API để thêm comment
    // Hiện tại chỉ thêm trên state
    const newComment = {
      id: `comment-${Date.now()}`,
      user: {
        id: 'user-1', // Giả sử user hiện tại
        full_name: 'Đặng Minh Nhi',
        avatar: null,
      },
      content,
      created_at: new Date().toLocaleString(),
    };

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, comments: [...task.comments, newComment] }
          : task
      )
    );
  };

  // Xử lý khi thêm người thực hiện
  const handleAddAssignee = (taskId: string) => {
    // Hiển thị modal chọn người thực hiện (sẽ triển khai sau)
    alert('Chức năng thêm người thực hiện sẽ được triển khai sau');
  };

  // Xử lý khi xóa người thực hiện
  const handleRemoveAssignee = (taskId: string, userId: string) => {
    // Ở đây sẽ gọi API để xóa assignee
    // Hiện tại chỉ xóa trên state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignees: task.assignees.filter((a) => a.user_id !== userId),
            }
          : task
      )
    );
  };

  // Xử lý khi upload tệp đính kèm
  const handleUploadAttachment = (taskId: string, file: File) => {
    // Ở đây sẽ gọi API để upload file
    // Hiện tại chỉ thêm trên state
    const newAttachment = {
      id: `attach-${Date.now()}`,
      name: file.name,
      file_type: file.name.split('.').pop() || '',
      file_size: `${Math.round(file.size / 1024)} KB`,
      uploaded_by: 'Đặng Minh Nhi', // Giả sử user hiện tại
      upload_date: new Date().toLocaleDateString(),
      url: '#',
    };

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, attachments: [...task.attachments, newAttachment] }
          : task
      )
    );
  };

  // Xử lý khi xóa tệp đính kèm
  const handleDeleteAttachment = (taskId: string, attachmentId: string) => {
    // Ở đây sẽ gọi API để xóa attachment
    // Hiện tại chỉ xóa trên state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              attachments: task.attachments.filter(
                (a) => a.id !== attachmentId
              ),
            }
          : task
      )
    );
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  // Lọc các task thuộc danh mục đã chọn
  const categoryTasks = tasks.filter(
    (task) => selectedCategory && task.category_id === selectedCategory.id
  );

  return (
    <div className={styles.tasksManager}>
      {view === 'categories' && (
        <TaskCategories
          projectId={projectId}
          categories={categories}
          onAddCategory={handleAddCategory}
        />
      )}

      {view === 'tasks' && selectedCategory && (
        <CategoryTasks
          projectId={projectId}
          category={selectedCategory}
          tasks={categoryTasks}
          onAddTask={handleAddTask}
          onBack={handleBackToCategories}
        />
      )}

      {view === 'task-detail' && selectedTask && selectedCategory && (
        <TaskDetail
          projectId={projectId}
          categoryId={selectedCategory.id}
          task={selectedTask}
          onBack={handleBackToTasks}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
          onAddAssignee={handleAddAssignee}
          onRemoveAssignee={handleRemoveAssignee}
          onUploadAttachment={handleUploadAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      )}
    </div>
  );
};

export default ProjectTasksManager;
