import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './TaskCategories.module.css';

interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
}

interface TaskCategoriesProps {
  projectId: string;
  categories: TaskCategory[];
  onAddCategory: () => void;
}

const TaskCategories: React.FC<TaskCategoriesProps> = ({
  projectId,
  categories,
  onAddCategory,
}) => {
  const router = useRouter();

  const handleViewCategory = (categoryId: string) => {
    router.push(`/projects/${projectId}/categories/${categoryId}`);
  };

  return (
    <div className={styles.categoriesContainer}>
      <div className={styles.header}>
        <h3>Danh mục phân việc</h3>
        <button className={styles.addButton} onClick={onAddCategory}>
          <img
            src="/assets/icons/plus.png"
            alt="Thêm"
            className={styles.icon}
          />
          Thêm danh mục
        </button>
      </div>

      {categories.length > 0 ? (
        <div className={styles.categoriesList}>
          {categories.map((category) => (
            <div
              key={category.id}
              className={styles.categoryCard}
              onClick={() => handleViewCategory(category.id)}
            >
              <div className={styles.categoryHeader}>
                <h4 className={styles.categoryName}>{category.name}</h4>
                <div className={styles.categoryActions}>
                  <button className={styles.actionButton}>
                    <img
                      src="/assets/icons/edit.png"
                      alt="Sửa"
                      className={styles.actionIcon}
                    />
                  </button>
                  <button className={styles.actionButton}>
                    <img
                      src="/assets/icons/delete.png"
                      alt="Xóa"
                      className={styles.actionIcon}
                    />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className={styles.categoryDescription}>
                  {category.description}
                </p>
              )}

              <div className={styles.categoryStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {category.tasks_count}
                  </span>
                  <span className={styles.statLabel}>Công việc</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {Math.round(
                      (category.completed_tasks_count /
                        Math.max(category.tasks_count, 1)) *
                        100
                    )}
                    %
                  </span>
                  <span className={styles.statLabel}>Hoàn thành</span>
                </div>
              </div>

              <div className={styles.progressContainer}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${
                      (category.completed_tasks_count /
                        Math.max(category.tasks_count, 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              <button className={styles.viewButton}>
                Xem chi tiết
                <img
                  src="/assets/icons/arrow-right.png"
                  alt="Xem"
                  className={styles.viewIcon}
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <img
            src="/assets/icons/folder.png"
            alt="Folder"
            className={styles.emptyIcon}
          />
          <p>
            Chưa có danh mục phân việc nào. Hãy tạo danh mục đầu tiên của bạn.
          </p>
          <button className={styles.createButton} onClick={onAddCategory}>
            Tạo danh mục
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCategories;
