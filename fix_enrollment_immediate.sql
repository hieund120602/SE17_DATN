-- Script sửa enrollment ngay lập tức cho các payment QR đã approve
-- Chạy script này để tạo enrollment cho user có thể vào học ngay

-- 1. Kiểm tra các payment QR đã được approve
SELECT '=== PAYMENTS QR APPROVED ===' as info;
SELECT 
    p.id as payment_id,
    p.transaction_id,
    p.order_info,
    p.amount,
    p.student_id,
    p.status,
    p.created_at
FROM payments p
WHERE p.method = 'QR_TRANSFER' 
    AND p.status = 'COMPLETED'
ORDER BY p.created_at DESC;

-- 2. Tìm các payment chưa có enrollment
SELECT '=== PAYMENTS WITHOUT ENROLLMENT ===' as info;
SELECT 
    p.id as payment_id,
    p.student_id,
    p.order_info,
    p.amount,
    p.created_at
FROM payments p
LEFT JOIN enrollments e ON p.id = e.payment_id
WHERE p.method = 'QR_TRANSFER' 
    AND p.status = 'COMPLETED'
    AND e.id IS NULL
ORDER BY p.created_at DESC;

-- 3. Tạo enrollment cho course (UNCOMMENT để chạy)
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

-- 4. Cập nhật countBuy của courses
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

-- 5. Kiểm tra kết quả sau khi sửa
SELECT '=== ENROLLMENTS AFTER FIX ===' as info;
SELECT 
    e.id as enrollment_id,
    e.student_id,
    e.course_id,
    e.progress_percentage,
    e.payment_id,
    e.created_at
FROM enrollments e
ORDER BY e.created_at DESC;

-- 6. Kiểm tra countBuy của courses
SELECT '=== COURSES COUNTBUY ===' as info;
SELECT 
    c.id,
    c.title,
    c.count_buy
FROM courses c
WHERE c.count_buy > 0
ORDER BY c.count_buy DESC; 