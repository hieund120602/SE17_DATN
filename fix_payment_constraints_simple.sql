-- Script đơn giản để sửa lỗi constraint cho enum PaymentMethod (PostgreSQL)
-- Chạy từng lệnh một trong pgAdmin hoặc psql

-- 1. Xóa constraint cũ nếu tồn tại
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- 2. Cập nhật cột method để chấp nhận QR_TRANSFER
ALTER TABLE payments ALTER COLUMN method TYPE VARCHAR(20);

-- 3. Thêm constraint mới cho method
ALTER TABLE payments ADD CONSTRAINT payments_method_check 
CHECK (method IN ('VNPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'QR_TRANSFER'));

-- 4. Cập nhật cột status để chấp nhận các trạng thái mới
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(20);

-- 5. Thêm constraint mới cho status
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED', 'WAITING_CONFIRMATION', 'REJECTED'));

-- 6. Kiểm tra kết quả
SELECT 'Method values:' as info;
SELECT method, COUNT(*) FROM payments GROUP BY method;

SELECT 'Status values:' as info;
SELECT status, COUNT(*) FROM payments GROUP BY status;

-- 7. Thông báo hoàn thành
SELECT 'Payment constraints updated successfully!' as result; 