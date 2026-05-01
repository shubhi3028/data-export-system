'use client';

import { useState, useEffect } from 'react';
import { fetchUsers } from '../lib/api';
import DataTable from './DataTable';
import FilterPanel from './FilterPanel';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers(1);
  }, [filters]);

  const loadUsers = async (page) => {
    setLoading(true);
    try {
      const data = await fetchUsers(page, filters);
      setUsers(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>
            <span className={styles.icon}>📊</span> Data Export System
          </h1>
          <p className={styles.subtitle}>Efficiently export large datasets with resume capability</p>
        </div>
      </div>

      <div className={styles.container}>
        <FilterPanel onFilterChange={setFilters} />
        <DataTable
          users={users}
          pagination={pagination}
          loading={loading}
          onPageChange={loadUsers}
          filters={filters}
        />
      </div>
    </div>
  );
}
