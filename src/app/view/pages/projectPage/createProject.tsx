"use client";

import React from "react";
import { useRouter } from 'next/navigation';
import styles from './project.module.css';  // Import CSS module

// Khai báo kiểu cho props
interface CreateProjectProps {
  onClose: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose }) => {
  const router = useRouter();

  const handleAddProject = () => {
    router.push("./projectPage");
  };

  const handleCancel = () => {
    onClose(); // Gọi hàm onClose khi nhấn "Hủy bỏ"
  };

  return (
    <div className={styles.projectContainer}>  {/* Sử dụng CSS module */}
      <div className={styles.projectHeader}>
        <input type="text" className={styles.input} placeholder="Tên dự án" />
        <span className={styles.projectCode}>Mã số dự án: DA01</span>
      </div>
      <textarea className={styles.projectDescription} placeholder="Mô tả"></textarea>
      <div className={styles.projectInfo}>
        <div className={styles.projectStatusBox}>
          <label>Trạng thái:</label>
          <select className={styles.input}>
            <option>Chưa tiến hành</option>
            <option>Đang thực hiện</option>
            <option>Hoàn thành</option>
          </select>
        </div>
        <div className={styles.projectFinanceBox}>Tài chính: 1 tỷ</div>
      </div>
      <div className={styles.projectDates}>
        <div className={styles.projectDateBox}>
          <label>Ngày bắt đầu:</label>
          <input type="text" value="11/02/2024" readOnly className={styles.input} />
        </div>
        <div className={styles.projectDateBox}>
          <label>Ngày kết thúc:</label>
          <input type="text" value="11/02/2025" readOnly className={styles.input} />
        </div>
      </div>
      <div className={styles.projectMembers}>
        <label>Thành viên</label>
        <div className={styles.memberInputs}>
          <select className={styles.input}>
            <option>Dev</option>
            <option>PM</option>
            <option>Tester</option>
          </select>
          <input type="text" className={styles.input} placeholder="Nhập tên" />
        </div>
      </div>
      <div className={styles.projectActions}>
        <button className={styles.btnAdd} onClick={handleAddProject}>Thêm</button>
        <button className={styles.btnCancel} onClick={handleCancel}>Hủy bỏ</button>
      </div>
    </div>
  );
};

export default CreateProject;
