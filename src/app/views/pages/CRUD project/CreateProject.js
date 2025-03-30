import React from "react";
import { useNavigate } from "react-router-dom";
import "./CreateProject.css";

const CreateProject = () => {
  const navigate = useNavigate();

  const handleAddProject = () => {
    navigate("/project-management");
  };

  return (
    <div className="project-container">
      <div className="project-header">
        <div className="project-avatar"></div>
        <input type="text" className="project-title" placeholder="Tên dự án" />
        <span className="project-code">Mã số dự án: DA01</span>
      </div>
      <textarea className="project-description" placeholder="Mô tả"></textarea>
      <div className="project-info">
        <div className="project-status-box">
          <label>Trạng thái:</label>
          <select>
            <option>Chưa tiến hành</option>
            <option>Đang thực hiện</option>
            <option>Hoàn thành</option>
          </select>
        </div>
        <div className="project-finance-box">Tài chính: 1 tỷ</div>
      </div>
      <div className="project-dates">
        <div className="project-date-box">
          <label>Ngày bắt đầu:</label>
          <input type="text" value="11/02/2024" readOnly />
        </div>
        <div className="project-date-box">
          <label>Ngày kết thúc:</label>
          <input type="text" value="11/02/2025" readOnly />
        </div>
      </div>
      <div className="project-members">
        <label>Thành viên</label>
        <div className="member-inputs">
          <select>
            <option>Dev</option>
            <option>PM</option>
            <option>Tester</option>
          </select>
          <input type="text" placeholder="Nhập tên" />
        </div>
      </div>
      <div className="project-actions">
        <button className="btn btn-add" onClick={handleAddProject}>Thêm</button>
        <button className="btn btn-cancel" onClick={handleAddProject}>Hủy bỏ</button>
      </div>
    </div>
  );
};

export default CreateProject;