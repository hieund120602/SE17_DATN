-- Script đơn giản để sửa enrollment ngay lập tức
-- Chạy để user có thể vào học ngay

-- 1. Tìm payment QR đã approve
SELECT '=== PAYMENTS QR APPROVED ===' as info;
SELECT 
    p.id as payment_id,
    p.student_id,
    p.order_info,
    p.amount,
    p.status,
    p.created_at
FROM payments p
WHERE p.method = 'QR_TRANSFER' 
    AND p.status = 'COMPLETED'
ORDER BY p.created_at DESC;

-- 2. Tìm course tương ứng
SELECT '=== COURSES ===' as info;
SELECT 
    c.id as course_id,
    c.title,
    c.status
FROM courses c
WHERE c.status = 'APPROVED'
ORDER BY c.id;

-- 3. Tạo enrollment cho course 22 (THAY THẾ GIÁ TRỊ THEO KẾT QUẢ TRÊN)
-- Thay thế student_id, payment_id, amount theo kết quả từ bước 1
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
    1,  -- Thay thế bằng student_id thực tế từ bước 1
    22, -- course_id từ URL /vi/courses/22
    0,  -- progress_percentage
    0,  -- completed_lessons
    299000, -- Thay thế bằng amount thực tế từ bước 1
    1,  -- Thay thế bằng payment_id thực tế từ bước 1
    NOW(),
    NOW()
);

-- 4. Cập nhật countBuy của course
UPDATE courses 
SET count_buy = count_buy + 1 
WHERE id = 22;

-- 5. Kiểm tra kết quả
SELECT '=== ENROLLMENT CREATED ===' as info;
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
WHERE e.course_id = 22
ORDER BY e.created_at DESC;

-- 6. Kiểm tra countBuy
SELECT '=== COURSE COUNTBUY ===' as info;
SELECT 
    c.id,
    c.title,
    c.count_buy
FROM courses c
WHERE c.id = 22;

-- 7. Kiểm tra API enrollment check
SELECT '=== ENROLLMENT CHECK ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM enrollments e 
            WHERE e.student_id = 1 AND e.course_id = 22
        ) THEN 'ENROLLED'
        ELSE 'NOT ENROLLED'
    END as enrollment_status; 