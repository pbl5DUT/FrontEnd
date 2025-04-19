import styles from './page.module.css';

export default function DeleteProject({ project, onDeleteSuccess, onCancel }: 
    { project: any; onDeleteSuccess: () => void; onCancel: () => void }) 
{
    const handleDelete = async () => {
        try {
            const response = await fetch(`https://backend-pbl5-134t.onrender.com/api/projects/${project.code}/`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Xóa dự án thất bại');
            }

            console.log('Dự án đã được xóa thành công');
            onDeleteSuccess(); // Gọi callback khi xóa thành công
        } catch (error) {
            console.error('Lỗi khi xóa dự án:', error);
        }
    };

    return (
        <div className={styles.deleteProjectContainer}>
            <p className={styles.deleteText}>
                Bạn có muốn xóa dự án <strong>{project.name}</strong> không?
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
