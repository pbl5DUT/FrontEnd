import React, { useState } from "react";
import styles from "./project.module.css";

// Định nghĩa props cho component
interface ProjectUpdateFormProps {
  project: { 
    code: string; 
    name: string; 
    description: string; 
    status: string; 
    budget: string; 
    startDate: string; 
    endDate: string; 
  };
  onUpdate: (updatedProject: any) => void; // Hàm callback để cập nhật dự án
  onClose: () => void; // Hàm callback để đóng form
}

const ProjectUpdateForm: React.FC<ProjectUpdateFormProps> = ({ project, onUpdate, onClose }) => {
  const [updatedProject, setUpdatedProject] = useState(project);

  // Hàm xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(updatedProject); // Gửi dữ liệu cập nhật lên component cha
  };

  return (
    <form className={styles["create-form"]} onSubmit={handleSubmit}>
      <div className={styles["create-row"]}>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Tên dự án</label>
          <input
            className={styles["create-input"]}
            name="name"
            value={updatedProject.name}
            onChange={handleInputChange}
            placeholder="Nhập tên dự án"
          />
        </div>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Mã số dự án</label>
          <input
            className={styles["create-input"]}
            name="code"
            value={updatedProject.code}
            onChange={handleInputChange}
            placeholder="VD: DA01"
          />
        </div>
      </div>

      <div className={styles["create-column"]}>
        <label className={styles["create-label"]}>Mô tả</label>
        <textarea
          className={styles["create-input"]}
          name="description"
          value={updatedProject.description}
          onChange={handleInputChange}
          placeholder="Mô tả dự án..."
        ></textarea>
      </div>

      <div className={styles["create-row"]}>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Trạng thái</label>
          <select
            className={styles["create-input"]}
            name="status"
            value={updatedProject.status}
            onChange={handleInputChange}
          >
            <option>Chưa tiến hành</option>
            <option>Đang thực hiện</option>
            <option>Hoàn thành</option>
          </select>
        </div>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Tài chính</label>
          <input
            className={styles["create-input"]}
            name="budget"
            value={updatedProject.budget}
            onChange={handleInputChange}
            placeholder="VD: 1 tỷ"
          />
        </div>
      </div>

      <div className={styles["create-row"]}>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Ngày bắt đầu</label>
          <input
            className={styles["create-input"]}
            type="date"
            name="startDate"
            value={updatedProject.startDate}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles["create-column"]}>
          <label className={styles["create-label"]}>Ngày kết thúc</label>
          <input
            className={styles["create-input"]}
            type="date"
            name="endDate"
            value={updatedProject.endDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className={styles["create-actions"]}>
        <button type="submit" className={styles["create-btnSubmit"]}>Cập nhật</button>
        <button type="button" className={styles["create-btnCancel"]} onClick={onClose}>Hủy bỏ</button>
      </div>
    </form>
  );
};

export default ProjectUpdateForm;
