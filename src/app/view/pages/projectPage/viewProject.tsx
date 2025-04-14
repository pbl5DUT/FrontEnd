"use client";

import React, { useState } from 'react';
import styles from './project.module.css';

interface ViewProjectProps {
  project_name: string;
  onClose: () => void;
}

const ViewProject: React.FC<ViewProjectProps> = ({ project_name, onClose }) => {
  const [project] = useState({
    name: "Manager",
    description: "Dự án thử nghiệm hiển thị giao diện.",
    status: "Chưa tiến hành",
    finance: "1 tỷ VND",
    startDate: "11/02/2024",
    endDate: "11/02/2025",
    members: [
      { role: "Dev", name: "Nguyễn Văn A" },
      { role: "Tester", name: "Trần Thị B" }
    ]
  });

  return (
    <div className={styles.viewProjectContainer}>
      <div className={styles.viewProjectHeaderNew}>
        <h2>Chi tiết dự án: {project_name}</h2>
      </div>

      <div className={styles.projectInfoContainer}>
        <p><strong>Tên:</strong> {project.name}</p>
        <p><strong>Mô tả:</strong> {project.description}</p>
        <p><strong>Trạng thái:</strong> {project.status}</p>
        <p><strong>Tài chính:</strong> {project.finance}</p>
        <p><strong>Ngày bắt đầu:</strong> {project.startDate}</p>
        <p><strong>Ngày kết thúc:</strong> {project.endDate}</p>
      </div>

      <div className={styles.projectTeamTable}>
        <strong>Thành viên:</strong>
        <ul>
          {project.members.map((m, index) => (
            <li key={index}>{m.role}: {m.name}</li>
          ))}
        </ul>
      </div>

      <div className={styles.projectActionBtns}>
        <button className={styles.btnEditProject}>Chỉnh sửa</button>
        <button className={styles.btnDeleteProject}>Xóa Dự Án</button>
      </div>
    </div>
  );
};

export default ViewProject;
