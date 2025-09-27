-- ===========================================
-- SCRIPT TẠO DỮ LIỆU TEST CỰC ĐƠN GIẢN - SỬA LỖI LEVEL
-- ===========================================

-- 1. Tạo Users với password: password123
INSERT INTO users (full_name, email, phone_number, password, avatar_url, enabled, blocked, created_at, updated_at)
VALUES 
('Akiko Test Tutor', 'akiko_simple@example.com', '+84111111111', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Student Simple Test', 'student_simple@example.com', '+84222222222', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Tạo Tutor cho user đầu
INSERT INTO tutors (user_id, teaching_requirements)
SELECT u.id, 'Simple test tutor'
FROM users u 
WHERE u.email = 'akiko_simple@example.com'
AND NOT EXISTS (SELECT 1 FROM tutors t WHERE t.user_id = u.id);

-- 3. Tạo 1 Course test đơn giản (dùng level_id đầu tiên có sẵn)
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'SIMPLE TEST Course',
    'Khóa học test đơn giản nhất',
    300,
    (SELECT id FROM levels ORDER BY id LIMIT 1),  -- Dùng level đầu tiên có sẵn
    3,
    'Simple test overview',
    'Simple test content',
    99000,
    'https://example.com/test.jpg',
    'Simple test includes',
    0,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'akiko_simple@example.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'SIMPLE TEST Course');

-- 4. Tạo 1 Module đơn giản
INSERT INTO modules (title, duration_in_minutes, course_id, created_at, updated_at)
SELECT 
    'SIMPLE Module',
    60,
    c.id,
    NOW(),
    NOW()
FROM courses c 
WHERE c.title = 'SIMPLE TEST Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'SIMPLE Module' AND m.course_id = c.id);

-- 5. Tạo 1 Lesson đơn giản
INSERT INTO lessons (title, description, duration_in_minutes, module_id, video_url, created_at, updated_at)
SELECT 
    'SIMPLE Lesson',
    'Bài học đơn giản',
    20,
    m.id,
    'https://www.youtube.com/watch?v=simple',
    NOW(),
    NOW()
FROM modules m 
WHERE m.title = 'SIMPLE Module'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'SIMPLE Lesson' AND l.module_id = m.id);

-- 6. Tạo 1 Exercise FILL_IN_BLANK
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'SIMPLE Fill Blank',
    'Điền chỗ trống đơn giản',
    'FILL_IN_BLANK',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l 
WHERE l.title = 'SIMPLE Lesson'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'SIMPLE Fill Blank' AND e.lesson_id = l.id);

-- 7. Tạo 1 Exercise MULTIPLE_CHOICE
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'SIMPLE Multiple Choice',
    'Trắc nghiệm đơn giản',
    'MULTIPLE_CHOICE',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l 
WHERE l.title = 'SIMPLE Lesson'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'SIMPLE Multiple Choice' AND e.lesson_id = l.id);

-- 8. Tạo Question cho FILL_IN_BLANK
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'SIMPLE: ____',
    'Điền あ',
    'あ',
    'Đáp án đơn giản',
    5,
    e.id,
    NOW(),
    NOW()
FROM exercises e 
WHERE e.title = 'SIMPLE Fill Blank'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'SIMPLE: ____' AND q.exercise_id = e.id);

-- 9. Tạo Question cho MULTIPLE_CHOICE
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'SIMPLE: Chọn あ?',
    'Chọn đáp án đầu',
    'あ',
    'Đáp án là あ',
    5,
    e.id,
    NOW(),
    NOW()
FROM exercises e 
WHERE e.title = 'SIMPLE Multiple Choice'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'SIMPLE: Chọn あ?' AND q.exercise_id = e.id);

-- 10. Tạo Options cho Multiple Choice
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'あ', true, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content = 'SIMPLE: Chọn あ?'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'あ' AND o.question_id = q.id);

INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'い', false, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content = 'SIMPLE: Chọn あ?'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'い' AND o.question_id = q.id);

-- 11. Kiểm tra kết quả
SELECT '✅ SIMPLE Users: ' || COUNT(*) as result FROM users WHERE email LIKE '%_simple@example.com';
SELECT '✅ SIMPLE Course: ' || COUNT(*) as result FROM courses WHERE title = 'SIMPLE TEST Course';
SELECT '✅ SIMPLE Exercises: ' || COUNT(*) as result FROM exercises WHERE title LIKE 'SIMPLE %';
SELECT '✅ SIMPLE Questions: ' || COUNT(*) as result FROM questions WHERE content LIKE 'SIMPLE:%';

SELECT '🎯 SUCCESS! Login: student_simple@example.com / password123' as message; 