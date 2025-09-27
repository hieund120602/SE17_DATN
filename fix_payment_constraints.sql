-- Script để sửa lỗi constraint cho enum PaymentMethod
-- Chạy script này sau khi đã chạy update_payment_schema.sql

-- 1. Xóa constraint cũ nếu tồn tại
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- 2. Cập nhật cột method để chấp nhận QR_TRANSFER
-- Đối với PostgreSQL
ALTER TABLE payments ALTER COLUMN method TYPE VARCHAR(20);

-- 3. Thêm constraint mới cho method
ALTER TABLE payments ADD CONSTRAINT payments_method_check 
CHECK (method IN ('VNPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'QR_TRANSFER'));

-- 4. Cập nhật cột status để chấp nhận các trạng thái mới
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(20);

-- 5. Thêm constraint mới cho status
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED', 'WAITING_CONFIRMATION', 'REJECTED'));

-- 6. Kiểm tra xem có dữ liệu nào vi phạm constraint không
SELECT method, COUNT(*) FROM payments GROUP BY method;
SELECT status, COUNT(*) FROM payments GROUP BY status;

-- 7. Nếu cần, cập nhật dữ liệu cũ để phù hợp với constraint mới
-- UPDATE payments SET method = 'VNPAY' WHERE method NOT IN ('VNPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'QR_TRANSFER');
-- UPDATE payments SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED', 'WAITING_CONFIRMATION', 'REJECTED'); 