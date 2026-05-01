'use client';

import { useState } from 'react';
import ExportDialog from './ExportDialog';
import styles from './datatable.module.css';

export default function DataTable({ users, pagination, loading, onPageChange, filters }) {
  const [showExportDialog, setShowExportDialog] = useState(false);

  if (loading && !users.length) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>👥 User Records</h2>
          {pagination && (
            <p className={styles.recordCount}>
              {pagination.total.toLocaleString()} total records
            </p>
          )}
        </div>
        <button
          className={styles.exportBtn}
          onClick={() => setShowExportDialog(true)}
        >
          ⬇️ Export to CSV
        </button>
      </div>

      {users.length === 0 ? (
        <div className={styles.noData}>
          <p>📭 No users found</p>
          <p className={styles.hint}>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? styles.even : styles.odd}>
                    <td className={styles.idCell}>#{user.id}</td>
                    <td className={styles.nameCell}>{user.first_name}</td>
                    <td className={styles.nameCell}>{user.last_name}</td>
                    <td className={styles.emailCell}>{user.email}</td>
                    <td className={styles.countryCell}>{user.country}</td>
                    <td className={styles.ageCell}>{user.age}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[user.status.toLowerCase()]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                ← Previous
              </button>
              <div className={styles.pageInfo}>
                <span className={styles.currentPage}>Page {pagination.page}</span>
                <span className={styles.separator}>/</span>
                <span>{Math.ceil(pagination.total / pagination.page_size)}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.recordsInfo}>
                  {pagination.total.toLocaleString()} records
                </span>
              </div>
              <button
                className={styles.paginationBtn}
                disabled={pagination.page * pagination.page_size >= pagination.total}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {showExportDialog && (
        <ExportDialog
          onClose={() => setShowExportDialog(false)}
          filters={filters}
        />
      )}
    </div>
  );
}
