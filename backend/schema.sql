-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    age INT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Seed sample data (1000 records - enough to demo)
-- In production, you'd have 1M+ records
INSERT INTO users (first_name, last_name, email, country, age, status)
SELECT
    'User' || i::text,
    'Test' || i::text,
    'user' || i::text || '@example.com',
    (ARRAY['USA', 'UK', 'Canada', 'India', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'Mexico'])[((i-1) % 10) + 1],
    20 + ((i-1) % 60),
    (ARRAY['Active', 'Inactive', 'Pending', 'Suspended'])[((i-1) % 4) + 1]
FROM generate_series(1, 1000) AS t(i)
ON CONFLICT DO NOTHING;
