-- ===========================================
-- SIMPLE TEST DATA - BASIC EXERCISE TYPES ONLY
-- ===========================================

-- 1. Users
INSERT INTO users (full_name, email, phone_number, password, avatar_url, enabled, blocked, created_at, updated_at)
VALUES 
('Tanaka Sensei', 'tanaka@test.com', '+84901111111', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Test Student', 'student@test.com', '+84905555555', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Tutors & Students  
INSERT INTO tutors (user_id, teaching_requirements)
SELECT u.id, 'Expert teacher'
FROM users u WHERE u.email = 'tanaka@test.com'
AND NOT EXISTS (SELECT 1 FROM tutors t WHERE t.user_id = u.id);

INSERT INTO students (user_id)
SELECT u.id FROM users u WHERE u.email = 'student@test.com'
AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id);

-- 3. Courses
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Basic Japanese Course',
    'Learn Japanese fundamentals',
    240,
    (SELECT id FROM levels ORDER BY id LIMIT 1),
    4,
    'Basic Japanese with fundamental exercises',
    'Core exercise types included',
    199000,
    'https://example.com/basic.jpg',
    'Fill-in-blank, Multiple choice, Listening exercises',
    15,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t JOIN users u ON t.user_id = u.id
WHERE u.email = 'tanaka@test.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Basic Japanese Course');

-- 4. Modules
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Hiragana Module', 120, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Basic Japanese Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Hiragana Module' AND m.course_id = c.id);

-- 5. Lessons
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 'Basic Hiragana', 'Learn Hiragana basics', 60, m.id, 1, 'https://youtube.com/hiragana', 'Hiragana fundamentals', NOW(), NOW()
FROM modules m WHERE m.title = 'Hiragana Module'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'Basic Hiragana' AND l.module_id = m.id);

-- 6. Basic Exercises (Only proven types)
-- FILL_IN_BLANK
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Fill Hiragana', 'Fill missing Hiragana', 'FILL_IN_BLANK', l.id, 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'Basic Hiragana'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Fill Hiragana' AND e.lesson_id = l.id);

-- MULTIPLE_CHOICE
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Choose Hiragana', 'Select correct Hiragana', 'MULTIPLE_CHOICE', l.id, 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'Basic Hiragana'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Choose Hiragana' AND e.lesson_id = l.id);

-- LISTENING
INSERT INTO exercises (title, description, type, lesson_id, target_audio_url, difficulty_level, created_at, updated_at)
SELECT 'Listen Hiragana', 'Listen to Hiragana sounds', 'LISTENING', l.id, 'https://audio.example.com/hiragana.mp3', 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'Basic Hiragana'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Listen Hiragana' AND e.lesson_id = l.id);

-- 7. Questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'First vowel: ___', 'Sound A', 'あ', 'あ is first vowel', 3, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Fill Hiragana'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'First vowel: ___' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Which is A?', 'First vowel', 'あ', 'あ = a', 2, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Choose Hiragana'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Which is A?' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'What sound?', 'Listen carefully', 'あ', 'Sound was あ', 3, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Listen Hiragana'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'What sound?' AND q.exercise_id = e.id);

-- 8. Options
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'あ', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is A?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'あ' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'い', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is A?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'い' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'う', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is A?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'う' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'え', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is A?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'え' AND o.question_id = q.id);

-- Options for listening question
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'あ', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What sound?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'あ' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'い', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What sound?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'い' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'う', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What sound?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'う' AND o.question_id = q.id);

-- 9. Sample Enrollment
INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, is_completed, created_at, updated_at)
SELECT s.user_id, c.id, 10, 0, c.price, false, NOW(), NOW()
FROM students s JOIN courses c ON c.title = 'Basic Japanese Course'
JOIN users u ON s.user_id = u.id WHERE u.email = 'student@test.com'
AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.user_id AND e.course_id = c.id);

-- Summary
SELECT '✅ SIMPLE TEST DATA CREATED!' as status;
SELECT 'Login: student@test.com / password123' as login;
SELECT 'Exercise Types: FILL_IN_BLANK, MULTIPLE_CHOICE, LISTENING' as types; 