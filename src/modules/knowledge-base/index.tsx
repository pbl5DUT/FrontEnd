'use client';

import React, { useState } from 'react';
import { Row, Col, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import CategoryList from './components/category_list';
import ArticleList from './components/article_list';
import ArticleView from './components/artucle_view';
import { Article } from './types/knowledge';
import styles from './styles/knowledge_base.module.css';

const { Search } = Input;

const KnowledgeBasePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'all' | 'popular' | 'recent' | 'favorites'
  >('all');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedArticle(null);
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleTabChange = (key: 'all' | 'popular' | 'recent' | 'favorites') => {
    setActiveTab(key);
    setSelectedCategory(null);
    setSelectedArticle(null);
  };

  return (
    <div className={styles.knowledgeBaseContainer}>
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <div className={styles.sidebarContainer}>
            <div className={styles.searchContainer}>
              <Search
                placeholder="Tìm kiếm kiến thức..."
                prefix={<SearchOutlined />}
                onSearch={handleSearch}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.categoriesContainer}>
              <div className={styles.categoriesHeader}>
                <h3>Danh mục</h3>
              </div>

              <CategoryList
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </Col>

        <Col xs={24} lg={selectedArticle ? 8 : 18}>
          <div className={styles.mainContentContainer}>
            <ArticleList
              categoryId={selectedCategory}
              searchQuery={searchQuery}
              onArticleSelect={handleArticleSelect}
              filter={activeTab}
            />
          </div>
        </Col>

        {selectedArticle && (
          <Col xs={24} lg={10}>
            <ArticleView
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default KnowledgeBasePage;
