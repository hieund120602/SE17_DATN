# Sửa Enrollment Khẩn Cấp

## Vấn đề hiện tại

-   ✅ Thanh toán QR thành công
-   ✅ Admin đã approve payment
-   ❌ User vẫn không thấy khóa học trong "Khóa học của tôi"
-   ❌ Frontend vẫn hiển thị "Đăng ký ngay"

## Nguyên nhân

Thiếu enrollment record trong database.

## Giải pháp khẩn cấp

### Bước 1: Kiểm tra database

Mở pgAdmin và chạy các lệnh sau:

```sql
-- Kiểm tra payment QR đã approve
SELECT
    p.id as payment_id,
    p.student_id,
    p.order_info,
    p.amount,
    p.status
FROM payments p
WHERE p.method = 'QR_TRANSFER'
    AND p.status = 'COMPLETED'
ORDER BY p.created_at DESC;

-- Kiểm tra enrollment hiện tại
SELECT
    e.id as enrollment_id,
    e.student_id,
    e.course_id,
    e.payment_id
FROM enrollments e
ORDER BY e.created_at DESC;
```

### Bước 2: Tạo enrollment thủ công

Thay thế các giá trị trong script dưới đây:

```sql
-- Tạo enrollment thủ công
INSERT INTO enrollments (
    student_id,
    course_id,
    progress_percentage,
    completed_lessons,
    price_paid,
    payment_id,
    created_at,
    updated_at
) VALUES (
    1,  -- Thay thế bằng student_id thực tế
    22, -- Thay thế bằng course_id thực tế (từ URL: /vi/courses/22)
    0,  -- progress_percentage
    0,  -- completed_lessons
    299000, -- Thay thế bằng amount thực tế
    1,  -- Thay thế bằng payment_id thực tế
    NOW(),
    NOW()
);

-- Cập nhật countBuy của course
UPDATE courses
SET count_buy = count_buy + 1
WHERE id = 22; -- Thay thế bằng course_id thực tế
```

### Bước 3: Test ngay

1. **Refresh trang frontend**
2. **Kiểm tra "Khóa học của tôi"**
3. **Kiểm tra nút "Đăng ký ngay" đã đổi thành "Đã mua"**

### Bước 4: Kiểm tra kết quả

```sql
-- Kiểm tra enrollment đã tạo
SELECT
    e.id as enrollment_id,
    e.student_id,
    e.course_id,
    c.title as course_title,
    e.progress_percentage,
    e.payment_id,
    e.created_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
ORDER BY e.created_at DESC;

-- Kiểm tra countBuy
SELECT
    c.id,
    c.title,
    c.count_buy
FROM courses c
WHERE c.id = 22; -- Thay thế bằng course_id thực tế
```

## Cách tìm giá trị cần thiết

### 1. Tìm student_id

```sql
SELECT s.id as student_id, s.full_name, u.email
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.email = 'email_của_user@example.com';
```

### 2. Tìm course_id

Từ URL: `localhost:3000/vi/courses/22` → course_id = 22

### 3. Tìm payment_id

```sql
SELECT p.id as payment_id, p.student_id, p.amount, p.order_info
FROM payments p
WHERE p.method = 'QR_TRANSFER'
    AND p.status = 'COMPLETED'
    AND p.student_id = 1; -- Thay thế bằng student_id thực tế
```

## Test ngay

### 1. Chạy script SQL

-   Mở pgAdmin
-   Chạy script `fix_enrollment_manual_simple.sql`
-   Thay thế các giá trị theo hướng dẫn

### 2. Test frontend

-   Refresh trang frontend
-   Vào "Khóa học của tôi"
-   Kiểm tra xem course đã xuất hiện chưa
-   Kiểm tra nút "Đăng ký ngay" đã đổi thành "Đã mua"

### 3. Test API

```bash
# Test API enrollment
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8082/api/enrollments/my-enrollments

# Test API check enrollment
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8082/api/enrollments/check-course/22
```

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

-   Backup database trước khi chạy script
-   Kiểm tra quyền của user database
-   Đảm bảo course có status APPROVED
-   Kiểm tra student_id và course_id có tồn tại
