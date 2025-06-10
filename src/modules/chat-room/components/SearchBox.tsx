import React from 'react';
import styles from './SearchBox.module.css';
import { FiSearch } from 'react-icons/fi';

interface SearchBoxProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBox: React.FC<SearchBoxProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng, nhóm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <button
            className={styles.clearSearch}
            onClick={() => setSearchTerm('')}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
