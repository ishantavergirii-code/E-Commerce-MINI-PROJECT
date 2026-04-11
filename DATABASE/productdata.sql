-- Create the database
CREATE DATABASE IF NOT EXISTS watch_store;
USE watch_store;

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    stock INT DEFAULT 0,
    image_url TEXT,
    rating FLOAT DEFAULT 0,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 5 sample products
INSERT INTO products (name, brand, price, category, description, stock, image_url, rating, reviews_count) VALUES
('Classic Analog', 'Seiko', 199.99, 'Analog', 'A versatile and timeless analog watch.', 45, 'https://example.com/watch1.jpg', 4.6, 112),
('G-Shock Master', 'Casio', 129.50, 'Digital', 'Shock-resistant and waterproof digital watch.', 80, 'https://example.com/watch2.jpg', 4.8, 430),
('Series 9', 'Apple', 399.00, 'Smartwatch', 'Advanced health and activity tracker smartwatch.', 150, 'https://example.com/watch3.jpg', 4.9, 1250),
('Prospex Diver', 'Seiko', 550.00, 'Analog', 'High-quality automatic diver watch.', 12, 'https://example.com/watch4.jpg', 4.7, 85),
('Galaxy Watch 6', 'Samsung', 299.99, 'Smartwatch', 'Premium smartwatch with sleep and fitness tracking.', 90, 'https://example.com/watch5.jpg', 4.5, 310);
