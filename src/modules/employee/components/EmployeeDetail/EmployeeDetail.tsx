import React from 'react';
import './EmployeeDetail.css';  // Đảm bảo file CSS đã được import

interface EmployeeDetailProps {
  user: {
    user_id: string;
    full_name: string;
    email: string;
    role: string;
    department: string;
    gender: string;
    birth_date: string;
    phone: string;
    province: string;
    district: string;
    address: string;
    position: string;
    avatar: string | null;
    created_at: string;
  };
  onClose: () => void; // Hàm onClose để đóng chi tiết nhân viên
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ user, onClose }) => {
  const {
    full_name,
    email,
    role,
    department,
    gender,
    birth_date,
    phone,
    province,
    district,
    address,
    position,
    avatar,
    created_at,
  } = user;

  const formattedDate = new Date(created_at).toLocaleDateString();

  return (
    <div className="employee-detail-container">
      <div className="employee-detail-header">
        <h1>Employee Details</h1>
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>
      <div className="employee-detail">
        <div className="avatar">
          {avatar ? (
            <img src={avatar} alt="Avatar" />
          ) : (
            <div className="avatar-placeholder">No Avatar</div>
          )}
        </div>
        <div className="info">
          <p><strong>Full Name:</strong> {full_name}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Role:</strong> {role}</p>
          <p><strong>Department:</strong> {department}</p>
          <p><strong>Gender:</strong> {gender}</p>
          <p><strong>Birth Date:</strong> {birth_date}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Province:</strong> {province}</p>
          <p><strong>District:</strong> {district}</p>
          <p><strong>Position:</strong> {position}</p>
          <p><strong>Account Created At:</strong> {formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
