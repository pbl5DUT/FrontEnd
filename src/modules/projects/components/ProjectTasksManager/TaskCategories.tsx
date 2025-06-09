import React, { useState } from 'react';
import styles from './TaskCategories.module.css';
import { TaskCategory } from '../../types/Task';


interface TaskCategoriesProps {
  projectId: string;
  categories: TaskCategory[];
  onAddCategory: () => void;
  onViewCategory: (category: TaskCategory) => void;
  onEditCategory?: (category: TaskCategory) => void;
  onDeleteCategory?: (category: TaskCategory) => void;
}

const TaskCategories: React.FC<TaskCategoriesProps> = ({
  projectId,
  categories,
  onAddCategory,
  onViewCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const handleViewCategory = (category: TaskCategory) => {
    onViewCategory(category);
  };

  const handleEditCategory = (e: React.MouseEvent, category: TaskCategory) => {
    e.stopPropagation();
    onEditCategory?.(category);
  };

  const handleDeleteCategory = (e: React.MouseEvent, category: TaskCategory) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      onDeleteCategory?.(category);
    }
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
              onClick={() => handleViewCategory(category)}
            >
              <div className={styles.categoryHeader}>
                <h4 className={styles.categoryName}>{category.name}</h4>
                <div className={styles.categoryActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => handleEditCategory(e, category)}
                  >
                    <img
                      src="/assets/icons/edit.png"
                      alt="Sửa"
                      className={styles.actionIcon}
                    />
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => handleDeleteCategory(e, category)}
                  >
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

              <button 
                className={styles.viewButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCategory(category);
                }}
              >
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