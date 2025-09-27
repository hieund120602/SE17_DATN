-- Cập nhật bảng payments để thêm các trường cho thanh toán chuyển khoản QR
ALTER TABLE payments 
ADD COLUMN qr_code_url VARCHAR(500),
ADD COLUMN bank_account_info TEXT,
ADD COLUMN admin_notes TEXT,
ADD COLUMN admin_processed_at TIMESTAMP,
ADD COLUMN processed_by_admin_id BIGINT;

-- Thêm foreign key cho processed_by_admin_id
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_processed_by_admin 
FOREIGN KEY (processed_by_admin_id) REFERENCES users(id);

-- Cập nhật enum PaymentStatus để thêm các trạng thái mới
-- Lưu ý: MySQL không hỗ trợ ALTER ENUM trực tiếp, cần tạo lại bảng hoặc sử dụng cách khác
-- Trong trường hợp này, chúng ta sẽ sử dụng VARCHAR thay vì ENUM để dễ dàng thêm giá trị mới

-- Nếu đang sử dụng ENUM, có thể cần tạo lại bảng hoặc sử dụng cách khác
-- Ví dụ: ALTER TABLE payments MODIFY COLUMN status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELED', 'WAITING_CONFIRMATION', 'REJECTED');

-- Cập nhật enum PaymentMethod để thêm QR_TRANSFER
-- ALTER TABLE payments MODIFY COLUMN method ENUM('VNPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'QR_TRANSFER');

-- Thêm index cho các trường thường query
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_student_id ON payments(student_id); 