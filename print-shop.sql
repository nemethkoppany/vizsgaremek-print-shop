CREATE TABLE Users
(
    user_id INT
    AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR
    (70),
    email VARCHAR
    (255),
    password VARCHAR
    (255),
    registration_date DATETIME,
    role VARCHAR
    (30)
)

    CREATE TABLE Files
    (
        file_id int
        AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    file_name VARCHAR
        (200),
    file_type VARCHAR
        (254),
    file_size INT,
    status VARCHAR
        (50),
    FOREIGN KEY
        (user_id) REFERENCES Users
        (user_id)
)

        CREATE TABLE Orders
        (
            order_id int
            AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_date DATETIME,
    status VARCHAR
            (200),
    total_price INT,
    payment_status VARCHAR
            (200),
    FOREIGN KEY
            (user_id) REFERENCES Users
            (user_id)
)

            CREATE TABLE Tetel_fajlok
            (
                id INT
                AUTO_INCREMENT PRIMARY KEY,
    order_item_id INT,
    file_id INT,
    FOREIGN KEY
                (order_item_id) REFERENCES Order_items
                (order_item_id),
    FOREIGN KEY
                (file_id) REFERENCES Files
                (file_id)
);


                CREATE TABLE Order_items
                (
                    order_item_id INT
                    AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    subtotal INT,
    FOREIGN KEY
                    (order_id) REFERENCES Orders
                    (order_id),
    FOREIGN KEY
                    (product_id) REFERENCES Products
                    (product_id)
);


                    CREATE TABLE Products
                    (
                        product_id INT
                        AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR
                        (200),
    description VARCHAR
                        (200),
    base_price INT,
    category VARCHAR
                        (20),
    in_stock BOOLEAN,
    image_urls VARCHAR
                        (500)  -- megnöveltem, mert JSON lehet hosszabb
);

                        INSERT INTO Products
                            (name, description, base_price, category, in_stock, image_urls)
                        VALUES
                            ('A3 poszter', 'Színes A3 méretű nyomtatott poszter', 1990, "papír", true, '["https://example.com/poster-a3.jpg"]'),
                            ('Névjegykártya', 'Prémium papírra nyomtatott névjegykártya', 4990, "papír", false, '["https://example.com/business-card.jpg"]'),
                            ('Szórólap', 'A5 méretű reklám szórólap', 2990, "papír", false, '["https://example.com/flyer.jpg"]');



                        --{
                        -- "email": "admin@admin.hu",
                        --"full_name": "Admin",
                        --"password": "Admin"
                        --}

                        --"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJlbWFpbCI6ImFkbWluQGFkbWluLmh1Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjcxMzg4OTUsImV4cCI6MTc2NzE0MjQ5NX0.8TDmGbqONd6qAPTSZ6YmjkcpCT2162Sx0QYU3kuUI2M"


                        --{
                        -- "email": "teszt@user.hu",
                        -- "full_name": "Teszt Felhasználó",
                        --"password": "Teszt1234",
                        --"role": "user"
                        --}
                        UPDATE Users
SET role = 'admin'
WHERE email = 'admin@admin.hu';


                        ALTER TABLE Users
ADD last_login DATETIME NULL;


SHOW TABLES