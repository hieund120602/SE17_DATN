# Sửa Enrollment - Hướng dẫn cuối cùng

## Vấn đề hiện tại
- ✅ Thanh toán QR thành công
- ✅ Admin đã approve payment
- ❌ Frontend vẫn hiển thị "Đăng ký ngay" thay vì "Tiếp tục học"
- ❌ User không thấy khóa học trong "Khóa học của tôi"

## Nguyên nhân
Thiếu enrollment record trong database.

## Giải pháp cuối cùng

### Bước 1: Kiểm tra database
Mở pgAdmin và chạy script `check_enrollment_status.sql`:

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
    c.title as course_title,
    e.progress_percentage,
    e.payment_id,
    e.created_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
ORDER BY e.created_at DESC;
```

### Bước 2: Tạo enrollment ngay lập tức
Chạy script `create_enrollment_now.sql` và thay thế các giá trị:

```sql
-- Tạo enrollment cho course 22
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
    22, -- course_id từ URL /vi/courses/22
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
WHERE id = 22;
```

### Bước 3: Test ngay
1. **Refresh trang frontend**
2. **Kiểm tra nút "Đăng ký ngay" đã đổi thành "Tiếp tục học"**
3. **Vào "Khóa học của tôi" kiểm tra course đã xuất hiện**

### Bước 4: Kiểm tra API
```bash
# Test API enrollment check
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8082/api/enrollments/check-course/22

# Test API my enrollments
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8082/api/enrollments/my-enrollments
```

## Cách tìm giá trị cần thiết

### 1. Tìm student_id
```sql
SELECT s.id as student_id, s.full_name, u.email
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.email = 'email_của_user@example.com';
```

### 2. Tìm payment_id
```sql
SELECT p.id as payment_id, p.student_id, p.amount, p.order_info
FROM payments p
WHERE p.method = 'QR_TRANSFER' 
    AND p.status = 'COMPLETED'
    AND p.student_id = 1; -- Thay thế bằng student_id thực tế
```

### 3. Tìm course_id
Từ URL: `localhost:3000/vi/courses/22` → course_id = 22

## Test ngay

### 1. Chạy script SQL
- Mở pgAdmin
- Chạy script `create_enrollment_now.sql`
- Thay thế các giá trị theo hướng dẫn

### 2. Test frontend
- Refresh trang frontend
- Kiểm tra nút "Đăng ký ngay" đã đổi thành "Tiếp tục học"
- Vào "Khóa học của tôi" kiểm tra course đã xuất hiện

### 3. Test API
```bash
# Test API enrollment check
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8082/api/enrollments/check-course/22

# Test API my enrollments
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8082/api/enrollments/my-enrollments
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
- Backup database trước khi chạy script
- Kiểm tra quyền của user database
- Đảm bảo course có status APPROVED
- Kiểm tra student_id và course_id có tồn tại 