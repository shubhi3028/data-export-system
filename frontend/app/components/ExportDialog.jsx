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
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (status === 'loading') {
      const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  const startExport = async () => {
    setStatus('loading');
    setError(null);
    setTimeElapsed(0);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h3>📤 Export Data to CSV</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {status === 'idle' && (
            <>
              <div className={styles.description}>
                <p>Export all records matching your filters to a CSV file.</p>
                <div className={styles.infoBox}>
                  <span className={styles.infoIcon}>ℹ️</span>
                  <p>This may take a few moments for large datasets. Please keep this dialog open.</p>
                </div>
              </div>
              <button
                className={styles.startBtn}
                onClick={startExport}
              >
                ▶ Start Export
              </button>
            </>
          )}

          {status === 'loading' && (
            <>
              <div className={styles.progressContainer}>
                <div className={styles.progressHeader}>
                  <span className={styles.label}>Exporting records...</span>
                  <span className={styles.time}>{formatTime(timeElapsed)}</span>
                </div>
                
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  >
                    <span className={styles.progressPercent}>{progress}%</span>
                  </div>
                </div>

                {exportData && (
                  <div className={styles.statsGrid}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Processed</span>
                      <span className={styles.statValue}>{exportData.processed_records.toLocaleString()}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Total</span>
                      <span className={styles.statValue}>{exportData.total_records.toLocaleString()}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Speed</span>
                      <span className={styles.statValue}>{Math.round(exportData.processed_records / (timeElapsed + 1))}/s</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.warning}>
                <span>⏳</span>
                <p>Please keep this dialog open while export is in progress.</p>
              </div>
            </>
          )}

          {status === 'completed' && (
            <>
              <div className={styles.success}>
                <span className={styles.successIcon}>✅</span>
                <h4>Export Completed!</h4>
              </div>
              <div className={styles.completedStats}>
                <div className={styles.statItem}>
                  <span className={styles.label}>Records Exported</span>
                  <span className={styles.value}>{exportData?.total_records.toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.label}>Time Taken</span>
                  <span className={styles.value}>{formatTime(timeElapsed)}</span>
                </div>
              </div>
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
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>❌</span>
                <h4>Export Failed</h4>
              </div>
              <p className={styles.errorMessage}>{error}</p>
              <button
                className={styles.retryBtn}
                onClick={() => {
                  setStatus('idle');
                  setSessionId(null);
                  setProgress(0);
                  setError(null);
                  setTimeElapsed(0);
                }}
              >
                ↻ Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
