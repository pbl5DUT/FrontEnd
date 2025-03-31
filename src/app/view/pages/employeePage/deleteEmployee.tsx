import styles from './page.module.css';

export default function DeleteEmployee({ employee, onDeleteSuccess, onCancel }: { employee: any; onDeleteSuccess: () => void; onCancel: () => void }) {
    const handleDelete = async () => {
        try {
            const response = await fetch(`https://backend-pbl5-134t.onrender.com/api/users/${employee.user_id}/`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete employee');
            }

            console.log('Employee deleted successfully');
            onDeleteSuccess(); // Gọi callback khi xóa thành công
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    return (
        <div className={styles.deleteEmployeeContainer}>
            <p className={styles.deleteText}>
                Bạn có muốn xóa nhân viên <strong>{employee.full_name}</strong> không?
            </p>
            <div className={styles.actions}>
                <button className={styles.btnDelete} onClick={handleDelete}>
                    Xóa
                </button>
                <button className={styles.btnCancel} onClick={onCancel}>
                    Hủy
                </button>
            </div>
        </div>
    );
}