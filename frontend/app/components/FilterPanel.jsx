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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = () => {
    const activeFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        activeFilters[key] = value;
      }
    });
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
    onFilterChange({});
  };

  return (
    <div className={styles.filterPanel}>
      <h3>Filters</h3>
      
      <div className={styles.filterGroup}>
        <label>Search (Name/Email)</label>
        <input
          type="text"
          name="search"
          placeholder="Search..."
          value={filters.search}
          onChange={handleChange}
        />
      </div>

      <div className={styles.filterGroup}>
        <label>Country</label>
        <select name="country" value={filters.country} onChange={handleChange}>
          <option value="">All Countries</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="Canada">Canada</option>
          <option value="India">India</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Japan">Japan</option>
          <option value="Brazil">Brazil</option>
          <option value="Mexico">Mexico</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Status</label>
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <div className={styles.ageRange}>
        <div className={styles.filterGroup}>
          <label>Age From</label>
          <input
            type="number"
            name="age_min"
            placeholder="Min age"
            value={filters.age_min}
            onChange={handleChange}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Age To</label>
          <input
            type="number"
            name="age_max"
            placeholder="Max age"
            value={filters.age_max}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.applyBtn} onClick={handleApply}>
          Apply Filters
        </button>
        <button className={styles.resetBtn} onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
