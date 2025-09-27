-- ===========================================
-- SCRIPT TẠO DỮ LIỆU TEST CỰC KỲ ĐƠN GIẢN
-- ===========================================

-- 1. Tạo Users với password: password123
INSERT INTO users (full_name, email, phone_number, password, avatar_url, enabled, blocked, created_at, updated_at)
VALUES 
('Akiko Tanaka TEST', 'akiko_test@example.com', '+84123456789', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Hiroshi Yamamoto TEST', 'hiroshi_test@example.com', '+84123456790', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Student Test User', 'student_test@example.com', '+84123456794', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Tạo Tutors cho 2 users đầu
INSERT INTO tutors (user_id, teaching_requirements)
SELECT u.id, 'Giảng viên test - ' || u.full_name
FROM users u 
WHERE u.email IN ('akiko_test@example.com', 'hiroshi_test@example.com')
AND NOT EXISTS (SELECT 1 FROM tutors t WHERE t.user_id = u.id);

-- 3. Tạo 2 Courses test đơn giản
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'TEST Course Hiragana Simple',
    'Khóa học test về Hiragana đơn giản',
    600,
    (SELECT id FROM levels WHERE name = 'BEGINNER' LIMIT 1),
    5,
    'Test course overview',
    'Test course content',
    199000,
    'https://res.cloudinary.com/dugsysqjv/image/upload/v1/test-course.jpg',
    'Test course includes',
    0,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'akiko_test@example.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'TEST Course Hiragana Simple');

INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'TEST Course Katakana Simple',
    'Khóa học test về Katakana đơn giản',
    500,
    (SELECT id FROM levels WHERE name = 'BEGINNER' LIMIT 1),
    4,
    'Test course overview 2',
    'Test course content 2',
    149000,
    'https://res.cloudinary.com/dugsysqjv/image/upload/v1/test-course2.jpg',
    'Test course includes 2',
    0,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'hiroshi_test@example.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'TEST Course Katakana Simple');

-- 4. Tạo 1 Module đơn giản (chỉ dùng columns cơ bản)
INSERT INTO modules (title, duration_in_minutes, course_id, created_at, updated_at)
SELECT 
    'TEST Module Basic',
    120,
    c.id,
    NOW(),
    NOW()
FROM courses c 
WHERE c.title = 'TEST Course Hiragana Simple'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'TEST Module Basic' AND m.course_id = c.id);

-- 5. Tạo 1 Lesson đơn giản
INSERT INTO lessons (title, description, duration_in_minutes, module_id, video_url, created_at, updated_at)
SELECT 
    'TEST Lesson Basic',
    'Bài học test cơ bản',
    30,
    m.id,
    'https://www.youtube.com/watch?v=test123',
    NOW(),
    NOW()
FROM modules m 
WHERE m.title = 'TEST Module Basic'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'TEST Lesson Basic' AND l.module_id = m.id);

-- 6. Tạo 2 Exercises đơn giản
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'TEST Exercise Fill Blank',
    'Bài tập test điền chỗ trống',
    'FILL_IN_BLANK',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l 
WHERE l.title = 'TEST Lesson Basic'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'TEST Exercise Fill Blank' AND e.lesson_id = l.id);

INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'TEST Exercise Multiple Choice',
    'Bài tập test trắc nghiệm',
    'MULTIPLE_CHOICE',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l 
WHERE l.title = 'TEST Lesson Basic'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'TEST Exercise Multiple Choice' AND e.lesson_id = l.id);

-- 7. Tạo Questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'TEST: Âm "a" viết như thế nào? ____',
    'Ký tự đầu tiên',
    'あ',
    'Đáp án là あ',
    10,
    e.id,
    NOW(),
    NOW()
FROM exercises e 
WHERE e.title = 'TEST Exercise Fill Blank'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content LIKE 'TEST: Âm "a"%' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'TEST: Chọn ký tự "a"?',
    'Chọn đáp án đúng',
    'あ',
    'Đáp án đúng là あ',
    10,
    e.id,
    NOW(),
    NOW()
FROM exercises e 
WHERE e.title = 'TEST Exercise Multiple Choice'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content LIKE 'TEST: Chọn ký tự "a"%' AND q.exercise_id = e.id);

-- 8. Tạo Options cho Multiple Choice
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'あ', true, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content LIKE 'TEST: Chọn ký tự "a"%'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'あ' AND o.question_id = q.id);

INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'い', false, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content LIKE 'TEST: Chọn ký tự "a"%'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'い' AND o.question_id = q.id);

INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'う', false, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content LIKE 'TEST: Chọn ký tự "a"%'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'う' AND o.question_id = q.id);

INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'え', false, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content LIKE 'TEST: Chọn ký tự "a"%'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'え' AND o.question_id = q.id);

-- 9. Kiểm tra kết quả
SELECT '✅ TEST Users: ' || COUNT(*) as result FROM users WHERE email LIKE '%_test@example.com';
SELECT '✅ TEST Tutors: ' || COUNT(*) as result FROM tutors t JOIN users u ON t.user_id = u.id WHERE u.email LIKE '%_test@example.com';
SELECT '✅ TEST Courses: ' || COUNT(*) as result FROM courses WHERE title LIKE 'TEST Course%';
SELECT '✅ TEST Modules: ' || COUNT(*) as result FROM modules WHERE title LIKE 'TEST Module%';
SELECT '✅ TEST Lessons: ' || COUNT(*) as result FROM lessons WHERE title LIKE 'TEST Lesson%';
SELECT '✅ TEST Exercises: ' || COUNT(*) as result FROM exercises WHERE title LIKE 'TEST Exercise%';
SELECT '✅ TEST Questions: ' || COUNT(*) as result FROM questions WHERE content LIKE 'TEST:%';
SELECT '✅ TEST Options: ' || COUNT(*) as result FROM question_options o JOIN questions q ON o.question_id = q.id WHERE q.content LIKE 'TEST:%';

SELECT '🎯 SUCCESS! Check frontend for TEST courses!' as message; 