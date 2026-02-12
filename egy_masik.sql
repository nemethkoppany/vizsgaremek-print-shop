USE print_shop;

 
DROP TABLE IF EXISTS Tetel_fajlok;
DROP TABLE IF EXISTS Order_items;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Files;
DROP TABLE IF EXISTS Ratings;
DROP TABLE IF EXISTS Audit_logs;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Users;
 

CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(70) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(30) NOT NULL DEFAULT 'user',
  last_login DATETIME NULL,
  profile_image VARCHAR(255) NOT NULL DEFAULT 'default.png'
) ENGINE=InnoDB;
 

 
CREATE TABLE Products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(500) NOT NULL,
  base_price INT NOT NULL,
  in_stock TINYINT(1) NOT NULL DEFAULT 1,
  image_urls VARCHAR(500) NULL
) ENGINE=InnoDB;
 

 
CREATE TABLE Orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(200) NOT NULL DEFAULT 'pending',
  total_price INT NOT NULL DEFAULT 0,
  payment_status VARCHAR(200) NOT NULL DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_createdAt (createdAt)
) ENGINE=InnoDB;
 

 
CREATE TABLE Order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal INT NOT NULL DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES Orders(order_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Products(product_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;
 

 
CREATE TABLE Files (
  file_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_name VARCHAR(200) NOT NULL,
  file_type VARCHAR(254) NULL,
  file_size INT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'uploaded',
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_files_user (user_id)
) ENGINE=InnoDB;
 

 
CREATE TABLE Tetel_fajlok (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT NOT NULL,
  file_id INT NOT NULL,
  FOREIGN KEY (order_item_id) REFERENCES Order_items(order_item_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES Files(file_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX idx_tetel_order_item (order_item_id),
  INDEX idx_tetel_file (file_id)
) ENGINE=InnoDB;

CREATE TABLE Audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  event_type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  INDEX idx_audit_user_time (user_id, createdAt)
) ENGINE=InnoDB;

 
CREATE TABLE Ratings (
  rating_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  rating INT NOT NULL,
  comment VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_ratings_user (user_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;
 

 
INSERT INTO Products (name, description, base_price, in_stock, image_urls) VALUES
('A4 fekete-fehér nyomtatás (egyoldalas)', 'A4 fekete-fehér nyomtatás (egyoldalas).', 50, 1, '[]'),
('A4 színes nyomtatás (egyoldalas)', 'A4 színes nyomtatás (egyoldalas).', 120, 1, '[]'),
('A3 fekete-fehér nyomtatás (egyoldalas)', 'A3 fekete-fehér nyomtatás (egyoldalas).', 100, 1, '[]'),
('A3 színes nyomtatás (egyoldalas)', 'A3 színes nyomtatás (egyoldalas).', 200, 1, '[]'),
('Poszter nyomtatás – tervrajz (80g)', 'Poszter nyomtatás – tervrajz (80g).', 2000, 1, '[]'),
('Poszter nyomtatás – plakát (140g)', 'Poszter nyomtatás – plakát (140g).', 10000, 1, '[]'),
('Poszter nyomtatás – fotópapír', 'Poszter nyomtatás – fotópapír.', 15000, 1, '[]'),
('Falinaptár – 13 lapos A4', 'Falinaptár – 13 lapos A4.', 3990, 1, '[]'),
('Falinaptár – 13 lapos A3', 'Falinaptár – 13 lapos A3.', 5490, 1, '[]');
 

 
INSERT INTO Users (name, email, password, role)
VALUES (
  'Admin',
  'admin@admin.hu',
  '$2b$10$BIMZZ8mo0neMMkx7sCzK5uPLFyRPn2Tsn8UmNgbJohdBPGdRmps0y',
  'admin'
);
 
SHOW TABLES;
 
SELECT user_id, email, role, profile_image
FROM Users
ORDER BY user_id;
 
SELECT product_id, name, base_price, in_stock
FROM Products
ORDER BY product_id;