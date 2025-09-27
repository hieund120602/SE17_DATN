# Hướng dẫn sửa lỗi Enrollment - Phiên bản đơn giản

## Vấn đề hiện tại
- Admin approve payment QR thành công
- Nhưng user vẫn không được vào học
- Lỗi 500 khi gọi API `/api/admin/payments/process`

## Nguyên nhân
1. **Lỗi compilation**: Method `processEnrollmentAfterApproval` không tồn tại
2. **Thiếu logic enrollment**: Không có logic tự động tạo enrollment sau khi approve

## Giải pháp ngay lập tức

### Bước 1: Sửa lỗi compilation
Chạy script SQL để sửa enrollment thủ công:

```sql
-- Chạy file fix_enrollment_manual.sql trong pgAdmin
-- Uncomment phần INSERT và UPDATE để tạo enrollment
```

### Bước 2: Test ngay
1. **Tạo payment QR mới** từ frontend
2. **Admin approve** payment
3. **Kiểm tra enrollment** trong database

### Bước 3: Kiểm tra database
```sql
-- Kiểm tra payment đã approve
SELECT * FROM payments WHERE method = 'QR_TRANSFER' AND status = 'COMPLETED';

-- Kiểm tra enrollment
SELECT * FROM enrollments ORDER BY created_at DESC;

-- Tạo enrollment thủ công nếu cần
INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, payment_id, created_at, updated_at)
VALUES (1, 1, 0, 0, 100000, 1, NOW(), NOW());
```

## Giải pháp dài hạn

### 1. Sửa PaymentServiceImpl
Thêm logic enrollment đơn giản:

```java
// Trong method processPaymentByAdmin, sau khi approve
if ("approve".equalsIgnoreCase(request.getAction())) {
    // ... existing code ...
    
    // Thêm logic enrollment đơn giản
    try {
        System.out.println("Processing enrollment for payment: " + payment.getId());
        // TODO: Thêm logic enrollment thực tế
    } catch (Exception e) {
        System.err.println("Error: " + e.getMessage());
    }
}
```

### 2. Tạo enrollment service riêng
```java
@Service
public class EnrollmentProcessorService {
    
    public void processEnrollmentAfterPayment(Payment payment) {
        // Logic enrollment
    }
}
```

## Test ngay

### 1. Sửa enrollment thủ công
```sql
-- Tìm payment QR đã approve
SELECT id, student_id, order_info FROM payments 
WHERE method = 'QR_TRANSFER' AND status = 'COMPLETED';

-- Tạo enrollment thủ công
INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, payment_id, created_at, updated_at)
SELECT 
    p.student_id,
    c.id,
    0, 0, p.amount, p.id, NOW(), NOW()
FROM payments p
JOIN courses c ON c.title LIKE '%' || REPLACE(p.order_info, 'Payment for course: ', '') || '%'
WHERE p.method = 'QR_TRANSFER' 
    AND p.status = 'COMPLETED'
    AND p.order_info LIKE 'Payment for course:%';
```

### 2. Test frontend
- User đăng nhập
- Vào "My Courses"
- Kiểm tra xem course đã xuất hiện chưa

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
- Backup database trước khi test
- Kiểm tra quyền của user database
- Đảm bảo course có status APPROVED
- Kiểm tra student_id và course_id có tồn tại 