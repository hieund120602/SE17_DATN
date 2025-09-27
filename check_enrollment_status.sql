-- Script kiểm tra trạng thái enrollment
-- Chạy để xem enrollment có được tạo chưa

-- 1. Kiểm tra payment QR đã approve
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

-- 2. Kiểm tra enrollment hiện tại
SELECT '=== CURRENT ENROLLMENTS ===' as info;
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

-- 3. Kiểm tra enrollment cho user cụ thể
SELECT '=== USER ENROLLMENTS ===' as info;
SELECT 
    e.id as enrollment_id,
    e.student_id,
    s.full_name as student_name,
    e.course_id,
    c.title as course_title,
    e.progress_percentage,
    e.payment_id,
    e.created_at
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
WHERE e.student_id = 1  -- Thay thế bằng student_id thực tế
ORDER BY e.created_at DESC;

-- 4. Kiểm tra enrollment cho course cụ thể
SELECT '=== COURSE ENROLLMENTS ===' as info;
SELECT 
    e.id as enrollment_id,
    e.student_id,
    s.full_name as student_name,
    e.course_id,
    c.title as course_title,
    e.progress_percentage,
    e.payment_id,
    e.created_at
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
WHERE e.course_id = 22  -- Thay thế bằng course_id thực tế
ORDER BY e.created_at DESC;

-- 5. Kiểm tra API enrollment check
SELECT '=== ENROLLMENT CHECK FOR STUDENT 1 AND COURSE 22 ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM enrollments e 
            WHERE e.student_id = 1 AND e.course_id = 22
        ) THEN 'ENROLLED'
        ELSE 'NOT ENROLLED'
    END as enrollment_status; 