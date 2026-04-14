USE watch_store;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 2 sample users with placeholder hashed passwords
INSERT INTO users (name, email, password, phone, address, role) VALUES
('Admin User', 'admin@watchstore.com', '123', '123-456-7890', '100 Admin Dashboard Way, Tech City', 'admin'),
('John Doe', 'john.doe@example.com', '123', '987-654-3210', '404 Standard User Ln, Suburbia', 'user');
