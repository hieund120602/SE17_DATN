# Sửa Enrollment Ngay Lập Tức

## Vấn đề hiện tại
- Thanh toán QR thành công ✅
- Nhưng frontend vẫn hiển thị "Đăng ký ngay" ❌
- User không thấy khóa học trong "Khóa học của tôi" ❌

## Nguyên nhân
Thiếu enrollment sau khi admin approve payment.

## Giải pháp ngay lập tức

### Bước 1: Chạy script SQL để sửa enrollment
Mở pgAdmin và chạy script `fix_enrollment_immediate.sql`:

```sql
-- Tạo enrollment cho course
INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, payment_id, created_at, updated_at)
SELECT 
    p.student_id,
    c.id as course_id,
    0 as progress_percentage,
    0 as completed_lessons,
    p.amount as price_paid,
    p.id as payment_id,
    NOW() as created_at,
    NOW() as updated_at
FROM payments p
JOIN students s ON p.student_id = s.id
JOIN courses c ON c.title LIKE '%' || REPLACE(p.order_info, 'Payment for course: ', '') || '%'
LEFT JOIN enrollments e ON p.id = e.payment_id
WHERE p.method = 'QR_TRANSFER' 
    AND p.status = 'COMPLETED'
    AND e.id IS NULL
    AND p.order_info LIKE 'Payment for course:%'
    AND c.status = 'APPROVED';

-- Cập nhật countBuy của courses
UPDATE courses 
SET count_buy = count_buy + 1
WHERE id IN (
    SELECT DISTINCT c.id
    FROM payments p
    JOIN students s ON p.student_id = s.id
    JOIN courses c ON c.title LIKE '%' || REPLACE(p.order_info, 'Payment for course: ', '') || '%'
    LEFT JOIN enrollments e ON p.id = e.payment_id
    WHERE p.method = 'QR_TRANSFER' 
        AND p.status = 'COMPLETED'
        AND e.id IS NULL
        AND p.order_info LIKE 'Payment for course:%'
        AND c.status = 'APPROVED'
);
```

### Bước 2: Test ngay
1. **Refresh trang frontend**
2. **Kiểm tra "Khóa học của tôi"**
3. **Kiểm tra nút "Đăng ký ngay" đã đổi thành "Đã mua"**

### Bước 3: Kiểm tra database
```sql
-- Kiểm tra enrollment đã tạo
SELECT 
    e.id as enrollment_id,
    e.student_id,
    e.course_id,
    e.progress_percentage,
    e.payment_id,
    e.created_at
FROM enrollments e
ORDER BY e.created_at DESC;

-- Kiểm tra countBuy của courses
SELECT 
    c.id,
    c.title,
    c.count_buy
FROM courses c
WHERE c.count_buy > 0
ORDER BY c.count_buy DESC;
```

## Test ngay

### 1. Tạo payment QR mới
- Vào frontend
- Chọn course
- Chọn thanh toán QR
- Tạo thanh toán

### 2. Admin approve payment
- Vào admin panel
- Tìm payment QR
- Click "Approve"

### 3. Chạy script SQL
- Mở pgAdmin
- Chạy script `fix_enrollment_immediate.sql`

### 4. Kiểm tra frontend
- User đăng nhập
- Vào "Khóa học của tôi"
- Kiểm tra xem course đã xuất hiện chưa
- Kiểm tra nút "Đăng ký ngay" đã đổi thành "Đã mua"

## Debug

### Kiểm tra logs
```bash
# Xem logs của application
tail -f server.log
```

### Kiểm tra database
```sql
-- Kiểm tra payment status
SELECT * FROM payments WHERE method = 'QR_TRANSFER' ORDER BY created_at DESC LIMIT 5;

-- Kiểm tra enrollment
SELECT * FROM enrollments ORDER BY created_at DESC LIMIT 5;
```

## Lưu ý
- Backup database trước khi chạy script
- Kiểm tra quyền của user database
- Đảm bảo course có status APPROVED
- Kiểm tra student_id và course_id có tồn tại 