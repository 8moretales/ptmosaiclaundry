CREATE TABLE IF NOT EXISTS laundry_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number BIGINT NOT NULL UNIQUE,
    villa_name VARCHAR(255) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    order_date VARCHAR(20) NOT NULL,
    delivery_date DATE NULL,
    delivered BOOLEAN NOT NULL DEFAULT FALSE,
    total_garments INT NOT NULL,
    shirts INT NOT NULL DEFAULT 0,
    tshirts INT NOT NULL DEFAULT 0,
    jeans INT NOT NULL DEFAULT 0,
    trousers INT NOT NULL DEFAULT 0,
    shorts INT NOT NULL DEFAULT 0,
    inner_wear INT NOT NULL DEFAULT 0,
    socks INT NOT NULL DEFAULT 0,
    womens_dresses INT NOT NULL DEFAULT 0,
    coat_jacket INT NOT NULL DEFAULT 0,
    cap_hat INT NOT NULL DEFAULT 0,
    other INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_delivered_date (delivered, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;