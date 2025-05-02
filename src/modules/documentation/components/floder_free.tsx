'use client';

import React, { useState, useEffect } from 'react';
import { Tree, Input, Button, Spin, Modal, Form, message } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  PlusOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Folder } from '../types/documentation';
import {
  fetchFolders,
  createFolder,
} from '../services/documentation_service_mock';
import styles from '../styles/Documentation.module.css';

const { DirectoryTree } = Tree;
const { Search } = Input;

interface FolderTreeProps {
  onSelect: (folderId: string) => void;
}

interface TreeNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: TreeNode[];
  parentId?: string;
}

const FolderTree: React.FC<FolderTreeProps> = ({ onSelect }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [parentFolderId, setParentFolderId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    const data = buildTreeData(folders);
    setTreeData(data);
  }, [folders]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const data = await fetchFolders();
      setFolders(data);
    } catch (error) {
      console.error('Error loading folders:', error);
      message.error('Không thể tải danh sách thư mục');
    } finally {
      setLoading(false);
    }
  };

  const buildTreeData = (folderList: Folder[]): TreeNode[] => {
    // Tạo map của tất cả các folder
    const folderMap: { [key: string]: Folder } = {};
    folderList.forEach((folder) => {
      folderMap[folder.id] = { ...folder };
    });

    // Xây dựng cây thư mục
    const tree: TreeNode[] = [];
    folderList.forEach((folder) => {
      const treeNode: TreeNode = {
        title: folder.name,
        key: folder.id,
      };

      if (!folder.parentId) {
        // Thư mục gốc
        tree.push(treeNode);
      } else if (folderMap[folder.parentId]) {
        // Thư mục con
        if (!folderMap[folder.parentId].children) {
          folderMap[folder.parentId].children = [];
        }
        folderMap[folder.parentId].children!.push(folder);
      }
    });

    // Chuyển đổi từ Folder sang TreeNode với đệ quy
    const convertToTreeNode = (folder: Folder): TreeNode => {
      const node: TreeNode = {
        title: folder.name,
        key: folder.id,
        parentId: folder.parentId,
      };

      if (folder.children && folder.children.length > 0) {
        node.children = folder.children.map(convertToTreeNode);
      }

      return node;
    };

    return folderList
      .filter((folder) => !folder.parentId)
      .map(convertToTreeNode);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      onSelect(selectedKeys[0].toString());
    }
  };

  const showAddFolderModal = (parentId?: string) => {
    setParentFolderId(parentId);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleAddFolder = async () => {
    try {
      const values = await form.validateFields();
      const newFolder = await createFolder({
        name: values.folderName,
        parentId: parentFolderId,
        createdBy: 'user-1', // Giả định người dùng hiện tại
      });

      setFolders([...folders, newFolder]);
      setIsModalVisible(false);
      message.success('Tạo thư mục mới thành công');
    } catch (error) {
      console.error('Error creating folder:', error);
      message.error('Không thể tạo thư mục mới');
    }
  };

  const filterTreeNode = (node: any) => {
    if (searchValue.trim() === '') return true;
    return node.title.toLowerCase().includes(searchValue.toLowerCase());
  };

  const renderTreeNodes = (data: TreeNode[]) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode
            title={item.title}
            key={item.key}
            // icon={({ expanded }: { expanded: boolean }) =>
            //   expanded ? <FolderOpenOutlined /> : <FolderOutlined />
            // }
          >
            {renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          title={item.title}
          key={item.key}
          icon={<FolderOutlined />}
          isLeaf={item.isLeaf}
        />
      );
    });
  };

  return (
    <div className={styles.folderTreeContainer}>
      <div className={styles.folderTreeHeader}>
        <h3 className={styles.folderTreeTitle}>Thư mục</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => showAddFolderModal()}
        >
          Thêm
        </Button>
      </div>

      <Search
        placeholder="Tìm thư mục..."
        onChange={(e) => handleSearch(e.target.value)}
        className={styles.folderSearch}
        prefix={<SearchOutlined />}
      />

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : (
        <DirectoryTree
          showIcon
          defaultExpandAll
          onSelect={handleSelect}
          treeData={searchValue.trim() === '' ? treeData : []}
          filterTreeNode={filterTreeNode}
          className={styles.folderTree}
        >
          {searchValue.trim() !== '' && renderTreeNodes(treeData)}
        </DirectoryTree>
      )}

      <Modal
        title="Thêm thư mục mới"
        open={isModalVisible}
        onOk={handleAddFolder}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="folderName"
            label="Tên thư mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên thư mục' }]}
          >
            <Input placeholder="Nhập tên thư mục" />
          </Form.Item>

          <Form.Item label="Thư mục cha">
            <Input
              value={
                parentFolderId
                  ? folders.find((f) => f.id === parentFolderId)?.name
                  : 'Thư mục gốc'
              }
              disabled
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FolderTree;
