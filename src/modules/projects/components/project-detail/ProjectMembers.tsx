// components/project-detail/ProjectMembers.tsx
import React from 'react';
import { Project } from '@/modules/projects/types/project';
import styles from './ProjectMembers.module.css';

interface ProjectMembersProps {
  project: Project;
  onRemoveMember: (userId: string) => void;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ project, onRemoveMember }) => {
  return (
    <div className={styles.membersTab}>
      <div className={styles.membersHeader}>
        <h3>Thành viên dự án</h3>
        <button className={styles.addButton}>Thêm thành viên</button>
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
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc muốn xóa ${member.user.full_name} khỏi dự án?`)) {
                        onRemoveMember(String(member.user.id));
                      }
                    }}
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
    </div>
  );
};

export default ProjectMembers;