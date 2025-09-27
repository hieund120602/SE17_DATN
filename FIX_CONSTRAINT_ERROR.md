# Hướng dẫn sửa lỗi Payment Constraint

## Lỗi hiện tại

```
ERROR: new row for relation "payments" violates check constraint "payments_method_check"
Detail: Failing row contains (..., QR_TRANSFER, ...)
```

## Nguyên nhân

Database constraint chưa được cập nhật để chấp nhận giá trị `QR_TRANSFER` trong cột `method`.

## Cách sửa

### Phương pháp 1: Sử dụng pgAdmin

1. Mở pgAdmin
2. Kết nối đến database `japanese_learning_platform`
3. Mở Query Tool
4. Copy và paste từng lệnh sau:

```sql
-- Bước 1: Xóa constraint cũ
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- Bước 2: Cập nhật cột method
ALTER TABLE payments ALTER COLUMN method TYPE VARCHAR(20);

-- Bước 3: Thêm constraint mới cho method
ALTER TABLE payments ADD CONSTRAINT payments_method_check
CHECK (method IN ('VNPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'QR_TRANSFER'));

-- Bước 4: Cập nhật cột status
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(20);

-- Bước 5: Thêm constraint mới cho status
ALTER TABLE payments ADD CONSTRAINT payments_status_check
CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED', 'WAITING_CONFIRMATION', 'REJECTED'));
```

### Phương pháp 2: Sử dụng psql command line

1. Mở Command Prompt
2. Chạy lệnh:

```bash
psql -h localhost -U postgres -d japanese_learning_platform -f fix_payment_constraints_simple.sql
```

### Phương pháp 3: Chạy từng lệnh một

1. Mở psql:

```bash
psql -h localhost -U postgres -d japanese_learning_platform
```

2. Chạy từng lệnh:

```sql
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ALTER COLUMN method TYPE VARCHAR(20);
ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('VNPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'QR_TRANSFER'));
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(20);
ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED', 'WAITING_CONFIRMATION', 'REJECTED'));
```

## Kiểm tra kết quả

Sau khi chạy xong, kiểm tra bằng lệnh:

```sql
SELECT method, COUNT(*) FROM payments GROUP BY method;
SELECT status, COUNT(*) FROM payments GROUP BY status;
```

## Kết quả mong đợi

-   Cột `method` sẽ chấp nhận: VNPAY, CREDIT_CARD, BANK_TRANSFER, QR_TRANSFER
-   Cột `status` sẽ chấp nhận: PENDING, COMPLETED, FAILED, CANCELED, WAITING_CONFIRMATION, REJECTED

## Test lại

Sau khi sửa xong, thử tạo thanh toán QR lại từ frontend để kiểm tra.

## Lưu ý

-   Backup database trước khi chạy script
-   Đảm bảo không có transaction nào đang chạy
-   Nếu có lỗi, kiểm tra quyền của user database
