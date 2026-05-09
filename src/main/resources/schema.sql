CREATE TABLE IF NOT EXISTS room (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(64) NOT NULL,
    description VARCHAR(512) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    bed VARCHAR(64) NOT NULL,
    size VARCHAR(32) NOT NULL,
    image_key VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    guest_name VARCHAR(64) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_number VARCHAR(32) NOT NULL,
    room_type_code VARCHAR(32) NOT NULL,
    room_type_name VARCHAR(64) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INT NOT NULL,
    guests INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    room_number VARCHAR(16),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_order_phone ON booking_order(phone);
CREATE INDEX IF NOT EXISTS idx_booking_order_guest_name ON booking_order(guest_name);
