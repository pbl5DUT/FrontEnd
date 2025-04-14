import styles from './page.module.css';

export default function ViewEmployee({ employee, onClose }: { employee: any; onClose: () => void }) {
    return (
        <div className={styles.viewEmployeeContainer}>
            {/* Header */}
            <div className={styles.viewEmployeeHeaderContainer}>
                <img
                    src={employee.avatar || '/assets/user.png'} // Hiển thị ảnh đại diện hoặc ảnh mặc định
                    alt="Avatar"
                    className={styles.avatar}
                />
                <div className={styles.employeeInfo}>
                    <p><strong>Mã nhân viên:</strong> {employee.user_id}</p>
                    <p><strong>Họ và tên:</strong> {employee.full_name}</p>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Phòng ban:</strong> {employee.department}</p>
                    <p><strong>Vai trò:</strong> {employee.role}</p>
                </div>
            </div>

            {/* Project Table */}
            <table className={styles.projectTable}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên dự án</th>
                        <th>Tình trạng</th>
                        <th>Mức độ hoàn thành</th>
                    </tr>
                </thead>
                <tbody>
                    {employee?.projects?.length > 0 ? (
                        employee.projects.map((project: any, index: number) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{project.name}</td>
                                <td>{project.status}</td>
                                <td>{project.completion}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center' }}>
                                Không có dự án nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}