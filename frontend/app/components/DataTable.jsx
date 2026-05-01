'use client';

import { useState } from 'react';
import ExportDialog from './ExportDialog';
import styles from './datatable.module.css';

export default function DataTable({ users, pagination, loading, onPageChange, filters }) {
  const [showExportDialog, setShowExportDialog] = useState(false);

  if (loading && !users.length) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Users Data</h2>
        <button
          className={styles.exportBtn}
          onClick={() => setShowExportDialog(true)}
        >
          📥 Export to CSV
        </button>
      </div>

      {users.length === 0 ? (
        <p className={styles.noData}>No users found</p>
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
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.country}</td>
                    <td>{user.age}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[user.status.toLowerCase()]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className={styles.pagination}>
              <button
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                ← Previous
              </button>
              <span>
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.page_size)}
                ({pagination.total} total records)
              </span>
              <button
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
