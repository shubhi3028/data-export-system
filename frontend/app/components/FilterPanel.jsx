'use client';

import { useState } from 'react';
import styles from './filters.module.css';

export default function FilterPanel({ onFilterChange }) {
  const [filters, setFilters] = useState({
    country: '',
    status: '',
    age_min: '',
    age_max: '',
    search: '',
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = () => {
    const activeFilters = {};
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        activeFilters[key] = value;
        count++;
      }
    });
    setActiveFiltersCount(count);
    onFilterChange(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      country: '',
      status: '',
      age_min: '',
      age_max: '',
      search: '',
    });
    setActiveFiltersCount(0);
    onFilterChange({});
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <h3>🔍 Advanced Filters</h3>
        {activeFiltersCount > 0 && (
          <span className={styles.badge}>{activeFiltersCount} active</span>
        )}
      </div>
      
      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label>Search (Name/Email)</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="search"
              placeholder="Enter name or email..."
              value={filters.search}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>Country</label>
          <select name="country" value={filters.country} onChange={handleChange}>
            <option value="">All Countries</option>
            <option value="USA">🇺🇸 USA</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="India">🇮🇳 India</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="France">🇫🇷 France</option>
            <option value="Japan">🇯🇵 Japan</option>
            <option value="Brazil">🇧🇷 Brazil</option>
            <option value="Mexico">🇲🇽 Mexico</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">All Status</option>
            <option value="Active">✓ Active</option>
            <option value="Inactive">✗ Inactive</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Suspended">⛔ Suspended</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Age Range</label>
          <div className={styles.ageRange}>
            <input
              type="number"
              name="age_min"
              placeholder="Min"
              value={filters.age_min}
              onChange={handleChange}
            />
            <span className={styles.separator}>—</span>
            <input
              type="number"
              name="age_max"
              placeholder="Max"
              value={filters.age_max}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.applyBtn} onClick={handleApply}>
          ✓ Apply Filters
        </button>
        <button className={styles.resetBtn} onClick={handleReset}>
          ↻ Reset All
        </button>
      </div>
    </div>
  );
}
