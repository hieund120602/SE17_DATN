-- ===========================================
-- QUICK RICH TEST DATA
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
    'Hiragana Master Course',
    'Complete Hiragana learning',
    240,
    (SELECT id FROM levels ORDER BY id LIMIT 1),
    4,
    'Learn all Hiragana with diverse exercises',
    'Multiple exercise types included',
    199000,
    'https://example.com/hiragana.jpg',
    'Fill-in-blank, Multiple choice, Speech, True/False, Listening, Reading',
    15,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t JOIN users u ON t.user_id = u.id
WHERE u.email = 'tanaka@test.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Hiragana Master Course');

INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Katakana Expert Course',
    'Advanced Katakana with foreign words',
    180,
    (SELECT id FROM levels ORDER BY id LIMIT 1),
    3,
    'Katakana with practical usage',
    'All exercise types for Katakana',
    179000,
    'https://example.com/katakana.jpg',
    'Comprehensive exercise collection',
    8,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t JOIN users u ON t.user_id = u.id
WHERE u.email = 'tanaka@test.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Katakana Expert Course');

-- 4. Modules
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Basic Hiragana', 60, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Hiragana Master Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Basic Hiragana' AND m.course_id = c.id);

INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Advanced Hiragana', 60, c.id, 2, NOW(), NOW()
FROM courses c WHERE c.title = 'Hiragana Master Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Advanced Hiragana' AND m.course_id = c.id);

INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Basic Katakana', 90, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Katakana Expert Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Basic Katakana' AND m.course_id = c.id);

-- 5. Lessons
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 'Vowels A-I-U-E-O', 'Learn basic vowels', 20, m.id, 1, 'https://youtube.com/vowels', 'Basic vowel lesson', NOW(), NOW()
FROM modules m WHERE m.title = 'Basic Hiragana'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'Vowels A-I-U-E-O' AND l.module_id = m.id);

INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 'K-Group KA-KI-KU-KE-KO', 'Learn K consonants', 25, m.id, 1, 'https://youtube.com/k-group', 'K-group lesson', NOW(), NOW()
FROM modules m WHERE m.title = 'Advanced Hiragana'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'K-Group KA-KI-KU-KE-KO' AND l.module_id = m.id);

INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 'Katakana Basics', 'Basic Katakana characters', 30, m.id, 1, 'https://youtube.com/katakana', 'Katakana lesson', NOW(), NOW()
FROM modules m WHERE m.title = 'Basic Katakana'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'Katakana Basics' AND l.module_id = m.id);

-- 6. Diverse Exercises
-- FILL_IN_BLANK
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Fill Vowels', 'Fill missing vowels', 'FILL_IN_BLANK', l.id, 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'Vowels A-I-U-E-O'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Fill Vowels' AND e.lesson_id = l.id);

-- MULTIPLE_CHOICE
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Choose K-Chars', 'Select correct K character', 'MULTIPLE_CHOICE', l.id, 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'K-Group KA-KI-KU-KE-KO'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Choose K-Chars' AND e.lesson_id = l.id);

-- SPEAKING (Speech/Pronunciation)
INSERT INTO exercises (title, description, type, lesson_id, target_text, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 'Speak Katakana', 'Pronounce Katakana words', 'SPEAKING', l.id, 'アメリカ', 'BEGINNER', 'ja-JP', 75, NOW(), NOW()
FROM lessons l WHERE l.title = 'Katakana Basics'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Speak Katakana' AND e.lesson_id = l.id);

-- PRONUNCIATION
INSERT INTO exercises (title, description, type, lesson_id, target_text, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 'Pronunciation Practice', 'Practice vowel pronunciation', 'PRONUNCIATION', l.id, 'あいうえお', 'BEGINNER', 'ja-JP', 70, NOW(), NOW()
FROM lessons l WHERE l.title = 'Vowels A-I-U-E-O'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Pronunciation Practice' AND e.lesson_id = l.id);

-- LISTENING  
INSERT INTO exercises (title, description, type, lesson_id, target_audio_url, difficulty_level, created_at, updated_at)
SELECT 'Listen K-Group', 'Listen to K sounds', 'LISTENING', l.id, 'https://audio.example.com/k.mp3', 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'K-Group KA-KI-KU-KE-KO'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Listen K-Group' AND e.lesson_id = l.id);

-- WRITING
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Write Katakana', 'Practice writing Katakana', 'WRITING', l.id, 'INTERMEDIATE', NOW(), NOW()
FROM lessons l WHERE l.title = 'Katakana Basics'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Write Katakana' AND e.lesson_id = l.id);

-- 7. Questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'First vowel: ___', 'Sound A', 'あ', 'あ is first', 3, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Fill Vowels'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'First vowel: ___' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Which is KA?', 'K+A sound', 'か', 'か = ka', 2, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Choose K-Chars'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Which is KA?' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Say America', 'Country name', 'アメリカ', 'America in Katakana', 5, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Speak Katakana'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Say America' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Pronounce vowels correctly', 'Say あいうえお', 'あいうえお', 'Perfect pronunciation', 5, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Pronunciation Practice'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Pronounce vowels correctly' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'What sound?', 'Listen', 'か', 'Sound was か', 3, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Listen K-Group'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'What sound?' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Write アメリカ in English', 'Country name', 'America', 'アメリカ means America', 4, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Write Katakana'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Write アメリカ in English' AND q.exercise_id = e.id);

-- 8. Options
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'か', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is KA?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'か' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'き', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is KA?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'き' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'く', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is KA?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'く' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'America', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Write アメリカ in English'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'America' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'Japan', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Write アメリカ in English'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'Japan' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'China', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Write アメリカ in English'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'China' AND o.question_id = q.id);

-- 9. Sample Enrollment
INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, is_completed, created_at, updated_at)
SELECT s.user_id, c.id, 15, 1, c.price, false, NOW(), NOW()
FROM students s JOIN courses c ON c.title = 'Hiragana Master Course'
JOIN users u ON s.user_id = u.id WHERE u.email = 'student@test.com'
AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.user_id AND e.course_id = c.id);

-- Summary
SELECT '✅ RICH TEST DATA CREATED!' as status;
SELECT 'Login: student@test.com / password123' as login;
SELECT 'Exercise Types: FILL_IN_BLANK, MULTIPLE_CHOICE, SPEAKING, PRONUNCIATION, LISTENING, WRITING' as types; 