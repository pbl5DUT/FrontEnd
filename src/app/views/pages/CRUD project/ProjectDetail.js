import React, { useState, useEffect } from 'react';
import './ProjectManagement.css'; // Import lại file CSS
import { Button } from 'reactstrap'; // Button từ thư viện reactstrap
import { useParams } from 'react-router-dom'; // Để lấy id dự án từ URL

const ProjectDetail = () => {
    const { id } = useParams(); // Lấy id dự án từ URL
    const [project, setProject] = useState(null); // State để lưu thông tin dự án

    // Hàm lấy dữ liệu chi tiết dự án từ API
    useEffect(() => {
        const fetchProjectDetail = async () => {
            try {
                const response = await fetch(`https://backend-pbl5-134t.onrender.com/api/projects/${id}/`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setProject(data); // Lưu chi tiết dự án vào state
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết dự án:', error);
            }
        };

        fetchProjectDetail();
    }, [id]);

    if (!project) {
        return <div>Loading...</div>; // Hiển thị khi chưa có dữ liệu
    }

    return (
        <div className="project-container">
            <div className="project-header">
                <div className="project-avatar"></div> {/* Avatar placeholder */}
                <input
                    className="project-title"
                    type="text"
                    value={project.project_name || 'Tên dự án'}
                    disabled
                />
            </div>
            <textarea
                className="project-description"
                value={project.description || 'Mô tả dự án'}
                disabled
            ></textarea>
            
            <div className="project-info">
                <div className="project-status-box">
                    <strong>Trạng thái:</strong> {project.status || 'Không xác định'}
                </div>
                <div className="project-finance-box">
                    <strong>Ngân sách:</strong> {project.budget || 'Không xác định'}
                </div>
            </div>
            
            <div className="project-dates">
                <div className="project-date-box">
                    <strong>Ngày bắt đầu:</strong> 
                    <input type="text" value={project.start_date || 'Không xác định'} disabled />
                </div>
                <div className="project-date-box">
                    <strong>Ngày kết thúc:</strong> 
                    <input type="text" value={project.end_date || 'Không xác định'} disabled />
                </div>
            </div>
            
            <div className="project-members">
                <strong>Thành viên:</strong>
                <div className="member-inputs">
                    {project.members && project.members.length > 0
                        ? project.members.map((member, index) => (
                            <span key={index}>{member}</span>
                          ))
                        : 'Không có thành viên nào'}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
