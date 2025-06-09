import React, { useState, useEffect } from 'react';
import { Project } from '@/modules/projects/types/project';

import styles from '../../ViewProjectPage.module.css';
import { removeProjectMember } from '@/modules/projects/services/project_service';
import AddMemberModal from '../../../modal/AddMemberModal/AddMemberModal';
import { employeeService } from '@/modules/employee/services/employeeService';

interface MembersTabProps {
  project: Project;
  refreshData: () => void;
}

export const MembersTab: React.FC<MembersTabProps> = ({ project, refreshData }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState<{ user_id: string; full_name: string; email?: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users for the modal (you might need to adjust this based on your API)
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
    

      const data = await employeeService.getEmployees();

      setUsers(
        data.map(employee => ({
          user_id: String(employee.user_id),
          full_name: employee.full_name,
          email: employee.email,
        }))
      );
      
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRemoveMember = async (memberId: String, memberName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${memberName} khỏi dự án? ${memberId}`)) {
      try {
        await removeProjectMember(String(project.project_id), memberId);
        refreshData(); // Refresh the project data
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Có lỗi xảy ra khi xóa thành viên. Vui lòng thử lại.');
      }
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddMemberSuccess = () => {
    refreshData(); // Refresh the project data after adding members
  };

  // Get current members to prevent duplicates
  const currentMembers = project.members?.map(member => ({
    user_id: String(member.user.id)
  })) || [];

  return (
    <div className={styles.membersTab}>
      <div className={styles.membersHeader}>
        <h3>Thành viên dự án</h3>
        <button 
          className={styles.addButton}
          onClick={handleOpenAddModal}
          disabled={isLoadingUsers}
        >
          {isLoadingUsers ? 'Đang tải...' : 'Thêm thành viên'}
        </button>
      </div>

      {project.members && project.members.length > 0 ? (
        <table className={styles.membersTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Thành viên</th>
              <th>Vai trò</th>
              <th>Email</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {project.members.map((member, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td className={styles.memberInfo}>
                  {member.user.avatar ? (
                    <img
                      src={member.user.avatar}
                      alt={member.user.full_name}
                      className={styles.memberAvatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {member.user.full_name.charAt(0)}
                    </div>
                  )}
                  <span>{member.user.full_name}</span>
                </td>
                <td>{member.role_in_project}</td>
                <td>{member.user.email}</td>
                <td className={styles.actions}>
                  <button 
                    className={styles.deleteButton} 
                    title="Xóa"
                    onClick={() => handleRemoveMember(
                    String(member.user.user_id), 
                      member.user.full_name
                    )}
                  >
                    <img
                      src="/assets/icons/delete.png"
                      alt="Xóa"
                      className={styles.icon}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.emptyState}>
          Chưa có thành viên nào. Hãy thêm thành viên mới.
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        projectId={String(project.project_id)}
        users={users}
        currentMembers={currentMembers}
        onSuccess={handleAddMemberSuccess}
      />
    </div>
  );
};