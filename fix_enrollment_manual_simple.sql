-- Script đơn giản để sửa enrollment thủ công
-- Thay thế [STUDENT_ID], [COURSE_ID], [PAYMENT_ID] bằng giá trị thực tế

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

-- 3. Tạo enrollment thủ công (THAY THẾ GIÁ TRỊ)
-- Ví dụ: student_id = 1, course_id = 22, payment_id = 1
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
    22, -- Thay thế bằng course_id thực tế
    0,  -- progress_percentage
    0,  -- completed_lessons
    299000, -- Thay thế bằng amount thực tế
    1,  -- Thay thế bằng payment_id thực tế
    NOW(),
    NOW()
);

-- 4. Cập nhật countBuy của course
UPDATE courses 
SET count_buy = count_buy + 1 
WHERE id = 22; -- Thay thế bằng course_id thực tế

-- 5. Kiểm tra kết quả
SELECT '=== ENROLLMENTS AFTER FIX ===' as info;
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

-- 6. Kiểm tra countBuy
SELECT '=== COURSE COUNTBUY ===' as info;
SELECT 
    c.id,
    c.title,
    c.count_buy
FROM courses c
WHERE c.id = 22; -- Thay thế bằng course_id thực tế 