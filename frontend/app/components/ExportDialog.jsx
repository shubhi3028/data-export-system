'use client';

import { useState, useEffect } from 'react';
import { initiateExport, checkExportStatus, downloadExport } from '../lib/api';
import styles from './exportdialog.module.css';

export default function ExportDialog({ onClose, filters }) {
  const [status, setStatus] = useState('idle'); // idle, loading, completed, error
  const [sessionId, setSessionId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [exportData, setExportData] = useState(null);

  const startExport = async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await initiateExport(filters);
      setSessionId(response.session_id);

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await checkExportStatus(response.session_id);
          setProgress(Math.round(statusResponse.progress));
          setExportData(statusResponse);

          if (statusResponse.status === 'completed') {
            clearInterval(pollInterval);
            setStatus('completed');
          } else if (statusResponse.status === 'failed') {
            clearInterval(pollInterval);
            setStatus('error');
            setError(statusResponse.error_message || 'Export failed');
          }
        } catch (err) {
          console.error('Error checking status:', err);
        }
      }, 1000); // Check every second

      // Cleanup interval on unmount
      return () => clearInterval(pollInterval);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const handleDownload = async () => {
    try {
      const downloadUrl = await downloadExport(sessionId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `export_${sessionId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h3>Export Data to CSV</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {status === 'idle' && (
            <>
              <p>Export all records matching your filters to CSV format.</p>
              <p className={styles.warning}>
                ⚠️ This may take a few moments for large datasets.
              </p>
              <button
                className={styles.startBtn}
                onClick={startExport}
              >
                Start Export
              </button>
            </>
          )}

          {status === 'loading' && (
            <>
              <div className={styles.progressContainer}>
                <p>Exporting records...</p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className={styles.progressText}>
                  {progress}% Complete
                  {exportData && (
                    <>
                      <br />
                      ({exportData.processed_records.toLocaleString()} / {exportData.total_records.toLocaleString()} records)
                    </>
                  )}
                </p>
              </div>
              <p className={styles.info}>
                Do not close this dialog while export is in progress.
              </p>
            </>
          )}

          {status === 'completed' && (
            <>
              <div className={styles.success}>
                ✅ Export completed successfully!
              </div>
              <p>
                {exportData?.total_records.toLocaleString()} records exported
              </p>
              <button
                className={styles.downloadBtn}
                onClick={handleDownload}
              >
                ⬇️ Download CSV File
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className={styles.error}>
                ❌ Export failed
              </div>
              <p>{error}</p>
              <button
                className={styles.retryBtn}
                onClick={() => {
                  setStatus('idle');
                  setSessionId(null);
                  setProgress(0);
                  setError(null);
                }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
