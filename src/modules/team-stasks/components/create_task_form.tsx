// modules/stacks/components/CreateTaskForm.tsx
import React, { useState, useEffect } from 'react';
import teamTasksService from '../services/team_tasks_service_mock';
import {
  Task,
  TaskStatus,
  TaskPriority,
  Project,
  TaskAssignee,
} from '../types/teamStasks';
import styles from '../styles/TeamTasks.module.css';

interface CreateTaskFormProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onClose,
  onTaskCreated,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<TaskAssignee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Load danh sách dự án
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await teamTasksService.getAllProjects();
        setProjects(data);

        // Mặc định chọn dự án đầu tiên
        if (data.length > 0 && !projectId) {
          setProjectId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  // Load danh sách thành viên dự án khi chọn dự án
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectMembers = async () => {
      try {
        const members = await teamTasksService.getProjectMembers(projectId);
        setProjectMembers(members);
      } catch (error) {
        console.error('Error fetching project members:', error);
      }
    };

    fetchProjectMembers();
  }, [projectId]);

  // Thêm ngày hết hạn mặc định (7 ngày từ hiện tại)
  useEffect(() => {
    const setDefaultDueDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      setDueDate(date.toISOString().substring(0, 10));
    };

    setDefaultDueDate();
  }, []);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề công việc';
    }

    if (!projectId) {
      errors.projectId = 'Vui lòng chọn dự án';
    }

    if (!dueDate) {
      errors.dueDate = 'Vui lòng chọn ngày hết hạn';
    } else {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < currentDate) {
        errors.dueDate = 'Ngày hết hạn không thể là ngày trong quá khứ';
      }
    }

    if (selectedAssignees.length === 0) {
      errors.assignees = 'Vui lòng chọn ít nhất một người thực hiện';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Lấy thông tin chi tiết các assignees
      const assignees = projectMembers.filter((member) =>
        selectedAssignees.includes(member.id)
      );

      // Lấy tên dự án
      const project = projects.find((p) => p.id === projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        description,
        status: TaskStatus.TODO,
        priority,
        assignees,
        createdBy: 'manager1', // Người quản lý hiện tại
        dueDate,
        projectId,
        projectName: project.name,
        comments: [],
        attachments: [],
      };

      await teamTasksService.createTask(newTask);
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssignees((prev) => {
      if (prev.includes(assigneeId)) {
        return prev.filter((id) => id !== assigneeId);
      } else {
        return [...prev, assigneeId];
      }
    });
  };

  return (
    <>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Tạo công việc mới</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.formContent}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>
              Tiêu đề công việc *
            </label>
            <input
              type="text"
              id="title"
              className={`${styles.formInput} ${
                formErrors.title ? styles.inputError : ''
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc"
            />
            {formErrors.title && (
              <div className={styles.errorText}>{formErrors.title}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>
              Mô tả
            </label>
            <textarea
              id="description"
              className={styles.formTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết về công việc"
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="project" className={styles.formLabel}>
                Dự án *
              </label>
              <select
                id="project"
                className={`${styles.formSelect} ${
                  formErrors.projectId ? styles.inputError : ''
                }`}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">-- Chọn dự án --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {formErrors.projectId && (
                <div className={styles.errorText}>{formErrors.projectId}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.formLabel}>
                Độ ưu tiên
              </label>
              <select
                id="priority"
                className={styles.formSelect}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value={TaskPriority.LOW}>Thấp</option>
                <option value={TaskPriority.MEDIUM}>Trung bình</option>
                <option value={TaskPriority.HIGH}>Cao</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dueDate" className={styles.formLabel}>
                Ngày hết hạn *
              </label>
              <input
                type="date"
                id="dueDate"
                className={`${styles.formInput} ${
                  formErrors.dueDate ? styles.inputError : ''
                }`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {formErrors.dueDate && (
                <div className={styles.errorText}>{formErrors.dueDate}</div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Người thực hiện *</label>
            <div className={styles.assigneesSelection}>
              {projectMembers.length === 0 ? (
                <div className={styles.noMembers}>
                  {projectId
                    ? 'Không có thành viên trong dự án này'
                    : 'Vui lòng chọn dự án trước'}
                </div>
              ) : (
                <>
                  <div className={styles.assigneeList}>
                    {projectMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`${styles.assigneeOption} ${
                          selectedAssignees.includes(member.id)
                            ? styles.assigneeSelected
                            : ''
                        }`}
                        onClick={() => toggleAssignee(member.id)}
                      >
                        <div className={styles.assigneeAvatar}>
                          {member.avatar || member.name.charAt(0)}
                        </div>
                        <span className={styles.assigneeName}>
                          {member.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {formErrors.assignees && (
                    <div className={styles.errorText}>
                      {formErrors.assignees}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTaskForm;
