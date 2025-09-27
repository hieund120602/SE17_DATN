-- ===========================================
-- SCRIPT CUỐI CÙNG - ĐƠN GIẢN NHẤT CÓ THỂ
-- ===========================================

-- 1. Tạo Users
INSERT INTO users (full_name, email, phone_number, password, avatar_url, enabled, blocked, created_at, updated_at)
VALUES 
('Final Test Tutor', 'final_tutor@test.com', '+84999999999', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Final Test Student', 'final_student@test.com', '+84888888888', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Tạo Tutor
INSERT INTO tutors (user_id, teaching_requirements)
SELECT u.id, 'Final test'
FROM users u 
WHERE u.email = 'final_tutor@test.com'
AND NOT EXISTS (SELECT 1 FROM tutors t WHERE t.user_id = u.id);

-- 3. Tạo Course (dùng level có sẵn)
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'FINAL TEST Course',
    'Course test cuối cùng',
    180,
    (SELECT id FROM levels ORDER BY id LIMIT 1),
    1,
    'Final test overview',
    'Final test content',
    50000,
    'https://example.com/final.jpg',
    'Final test includes',
    0,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'final_tutor@test.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'FINAL TEST Course');

-- 4. Tạo Module (có position)
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 
    'FINAL Module',
    30,
    c.id,
    1,  -- Thêm position = 1
    NOW(),
    NOW()
FROM courses c 
WHERE c.title = 'FINAL TEST Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'FINAL Module' AND m.course_id = c.id);

-- 5. Tạo Lesson
INSERT INTO lessons (title, description, duration_in_minutes, module_id, video_url, created_at, updated_at)
SELECT 
    'FINAL Lesson',
    'Lesson cuối cùng',
    15,
    m.id,
    'https://youtube.com/final',
    NOW(),
    NOW()
FROM modules m 
WHERE m.title = 'FINAL Module'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'FINAL Lesson' AND l.module_id = m.id);

-- 6. Tạo Exercise FILL_IN_BLANK
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'FINAL Fill',
    'Điền chỗ trống final',
    'FILL_IN_BLANK',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l 
WHERE l.title = 'FINAL Lesson'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'FINAL Fill' AND e.lesson_id = l.id);

-- 7. Tạo Exercise MULTIPLE_CHOICE
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'FINAL Choice',
    'Trắc nghiệm final',
    'MULTIPLE_CHOICE',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l 
WHERE l.title = 'FINAL Lesson'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'FINAL Choice' AND e.lesson_id = l.id);

-- 8. Tạo Question Fill Blank
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'FINAL: ____',
    'Nhập あ',
    'あ',
    'Đáp án: あ',
    3,
    e.id,
    NOW(),
    NOW()
FROM exercises e 
WHERE e.title = 'FINAL Fill'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'FINAL: ____' AND q.exercise_id = e.id);

-- 9. Tạo Question Multiple Choice
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'FINAL: Chọn?',
    'Chọn あ',
    'あ',
    'Đáp án: あ',
    3,
    e.id,
    NOW(),
    NOW()
FROM exercises e 
WHERE e.title = 'FINAL Choice'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'FINAL: Chọn?' AND q.exercise_id = e.id);

-- 10. Tạo Options
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'あ', true, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content = 'FINAL: Chọn?'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'あ' AND o.question_id = q.id);

INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
SELECT 'い', false, q.id, NOW(), NOW()
FROM questions q 
WHERE q.content = 'FINAL: Chọn?'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.content = 'い' AND o.question_id = q.id);

-- Kiểm tra
SELECT 'FINAL Users: ' || COUNT(*) FROM users WHERE email LIKE '%@test.com';
SELECT 'FINAL Course: ' || COUNT(*) FROM courses WHERE title = 'FINAL TEST Course';
SELECT 'FINAL Exercises: ' || COUNT(*) FROM exercises WHERE title LIKE 'FINAL%';

SELECT 'SUCCESS! Login: final_student@test.com / password123' as message; 