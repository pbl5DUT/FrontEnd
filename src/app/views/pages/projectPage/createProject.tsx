import React from "react";
import styles from "./project.module.css";

// Định nghĩa props cho component
interface ProjectCreateFormProps {
  onClose: () => void; // Prop onClose là một hàm
}

const ProjectCreateForm: React.FC<ProjectCreateFormProps> = ({ onClose }) => {
  return (
    <div className={styles["create-form"]}>
      <div className={styles["create-row"]}>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Tên dự án</label>
          <input className={styles["create-input"]} placeholder="Nhập tên dự án" />
        </div>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Mã số dự án</label>
          <input className={styles["create-input"]} placeholder="VD: DA01" />
        </div>
      </div>

      <div className={styles["create-column"]}>
        <label className={styles["create-label"]}>Mô tả</label>
        <textarea className={styles["create-input"]} placeholder="Mô tả dự án..."></textarea>
      </div>

      <div className={styles["create-row"]}>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Trạng thái</label>
          <select className={styles["create-input"]}>
            <option>Chưa tiến hành</option>
            <option>Đang thực hiện</option>
            <option>Hoàn thành</option>
          </select>
        </div>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Tài chính</label>
          <input className={styles["create-input"]} placeholder="VD: 1 tỷ" />
        </div>
      </div>

      <div className={styles["create-row"]}>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Ngày bắt đầu</label>
          <input className={styles["create-input"]} type="date" />
        </div>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Ngày kết thúc</label>
          <input className={styles["create-input"]} type="date" />
        </div>
      </div>

      <div className={styles["create-row"]}>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Vai trò</label>
          <select className={styles["create-input"]}>
            <option>Dev</option>
            <option>Tester</option>
            <option>Manager</option>
          </select>
        </div>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Tên thành viên</label>
          <input className={styles["create-input"]} placeholder="Nhập tên thành viên" />
        </div>
      </div>

      <div className={styles["create-actions"]}>
        <button className={styles["create-btnSubmit"]}>Thêm</button>
        <button className={styles["create-btnCancel"]} onClick={onClose}>
          Hủy bỏ
        </button>
      </div>
    </div>
  );
};

export default ProjectCreateForm;
