'use client';

import React, { useState, useEffect } from 'react';
import { Tree, Spin, Empty } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Category } from '../types/knowledge';
import {
  fetchCategories,
  buildCategoryTree,
} from '../services/knowledge_services_mock';
import styles from '../styles/knowledge_base.module.css';

const { DirectoryTree } = Tree;

interface CategoryListProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory: string | null;
}

interface TreeNode {
  title: string;
  key: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

const CategoryList: React.FC<CategoryListProps> = ({
  onCategorySelect,
  selectedCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      const categoryTree = buildCategoryTree();
      const treeNodes = convertToTreeNodes(categoryTree);
      setTreeData(treeNodes);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToTreeNodes = (categories: any[]): TreeNode[] => {
    return categories.map((category) => {
      const node: TreeNode = {
        title: `${category.name} (${category.articleCount})`,
        key: category.id,
        // icon: ({ expanded }: { expanded: boolean }) =>
        //   expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
      };

      if (category.children && category.children.length > 0) {
        node.children = convertToTreeNodes(category.children);
      }

      return node;
    });
  };

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      onCategorySelect(selectedKeys[0].toString());
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <span className={styles.loadingText}>Đang tải danh mục...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return <Empty description="Không có danh mục nào" />;
  }

  return (
    <div className={styles.categoryListContainer}>
      <DirectoryTree
        defaultExpandAll
        onSelect={handleSelect}
        treeData={treeData}
        selectedKeys={selectedCategory ? [selectedCategory] : []}
        className={styles.categoryTree}
      />
    </div>
  );
};

export default CategoryList;
