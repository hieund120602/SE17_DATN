-- ===========================================
-- RICH TEST DATA - MULTIPLE COURSES & DIVERSE EXERCISES
-- ===========================================

-- 1. Create Users (Tutors & Students)
INSERT INTO users (full_name, email, phone_number, password, avatar_url, enabled, blocked, created_at, updated_at)
VALUES 
-- Tutors
('Tanaka Sensei', 'tanaka@jplearn.com', '+84901111111', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Yamada Sensei', 'yamada@jplearn.com', '+84902222222', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
-- Students
('Student Test 1', 'test1@student.com', '+84905555555', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Student Test 2', 'test2@student.com', '+84906666666', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Create Tutors & Students
INSERT INTO tutors (user_id, teaching_requirements)
SELECT u.id, 'Expert Japanese teacher'
FROM users u 
WHERE u.email IN ('tanaka@jplearn.com', 'yamada@jplearn.com')
AND NOT EXISTS (SELECT 1 FROM tutors t WHERE t.user_id = u.id);

INSERT INTO students (user_id)
SELECT u.id
FROM users u 
WHERE u.email IN ('test1@student.com', 'test2@student.com')
AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id);

-- 3. Create Multiple Courses
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Hiragana Complete Course',
    'Master all 46 Hiragana characters',
    240,
    (SELECT id FROM levels ORDER BY id LIMIT 1),
    5,
    'Complete Hiragana learning with diverse exercises',
    'All Hiragana characters with practice',
    199000,
    'https://example.com/hiragana.jpg',
    'Fill-in-blank, Multiple choice, Speech exercises',
    12,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'tanaka@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Hiragana Complete Course');

INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Katakana Mastery',
    'Learn Katakana with foreign words',
    180,
    (SELECT id FROM levels ORDER BY id LIMIT 1),
    4,
    'Katakana with practical vocabulary',
    'All Katakana + foreign word practice',
    179000,
    'https://example.com/katakana.jpg',
    'Listening, Reading, True/False exercises',
    8,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'yamada@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Katakana Mastery');

INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Basic Kanji 100',
    'Learn first 100 essential Kanji',
    360,
    (SELECT id FROM levels ORDER BY id OFFSET 1 LIMIT 1),
    8,
    '100 most important Kanji characters',
    'Numbers, family, nature, body parts',
    299000,
    'https://example.com/kanji.jpg',
    'All exercise types included',
    5,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'tanaka@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Basic Kanji 100');

-- 4. Create Modules
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Hiragana A-Group', 60, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Hiragana Complete Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Hiragana A-Group' AND m.course_id = c.id);

INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Hiragana K-Group', 60, c.id, 2, NOW(), NOW()
FROM courses c WHERE c.title = 'Hiragana Complete Course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Hiragana K-Group' AND m.course_id = c.id);

INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Katakana Basics', 90, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Katakana Mastery'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Katakana Basics' AND m.course_id = c.id);

INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Numbers Kanji', 120, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Basic Kanji 100'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Numbers Kanji' AND m.course_id = c.id);

-- 5. Create Lessons
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'A-I-U-E-O Vowels',
    'Learn the 5 Japanese vowels',
    20,
    m.id,
    1,
    'https://youtube.com/aiueo',
    'Basic vowel sounds in Japanese',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'Hiragana A-Group'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'A-I-U-E-O Vowels' AND l.module_id = m.id);

INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'KA-KI-KU-KE-KO',
    'Learn K-group consonants',
    25,
    m.id,
    1,
    'https://youtube.com/kakikukeko',
    'K-group consonant sounds',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'Hiragana K-Group'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'KA-KI-KU-KE-KO' AND l.module_id = m.id);

INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'Katakana A-KA Groups',
    'Katakana vowels and K-group',
    30,
    m.id,
    1,
    'https://youtube.com/katakana-basics',
    'Basic Katakana characters',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'Katakana Basics'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'Katakana A-KA Groups' AND l.module_id = m.id);

INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'Numbers 1-2-3 Kanji',
    'Learn first 3 number Kanji',
    40,
    m.id,
    1,
    'https://youtube.com/kanji-123',
    'Basic number Kanji characters',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'Numbers Kanji'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'Numbers 1-2-3 Kanji' AND l.module_id = m.id);

-- 6. Create Diverse Exercises
-- FILL_IN_BLANK
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Fill Hiragana Vowels', 'Fill in missing vowels', 'FILL_IN_BLANK', l.id, 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'A-I-U-E-O Vowels'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Fill Hiragana Vowels' AND e.lesson_id = l.id);

-- MULTIPLE_CHOICE
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Choose K-Group', 'Select correct K-group character', 'MULTIPLE_CHOICE', l.id, 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'KA-KI-KU-KE-KO'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Choose K-Group' AND e.lesson_id = l.id);

-- SPEECH
INSERT INTO exercises (title, description, type, lesson_id, target_text, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 'Pronounce Katakana', 'Practice Katakana pronunciation', 'SPEECH', l.id, 'アメリカ', 'BEGINNER', 'ja-JP', 75, NOW(), NOW()
FROM lessons l WHERE l.title = 'Katakana A-KA Groups'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Pronounce Katakana' AND e.lesson_id = l.id);

-- TRUE_FALSE
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Kanji Meaning T/F', 'True or False about Kanji meanings', 'TRUE_FALSE', l.id, 'INTERMEDIATE', NOW(), NOW()
FROM lessons l WHERE l.title = 'Numbers 1-2-3 Kanji'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Kanji Meaning T/F' AND e.lesson_id = l.id);

-- LISTENING
INSERT INTO exercises (title, description, type, lesson_id, target_audio_url, difficulty_level, created_at, updated_at)
SELECT 'Listen Vowels', 'Listen and identify vowels', 'LISTENING', l.id, 'https://audio.example.com/vowels.mp3', 'BEGINNER', NOW(), NOW()
FROM lessons l WHERE l.title = 'A-I-U-E-O Vowels'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Listen Vowels' AND e.lesson_id = l.id);

-- READING
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, created_at, updated_at)
SELECT 'Read Katakana Words', 'Read foreign words in Katakana', 'READING', l.id, 'INTERMEDIATE', NOW(), NOW()
FROM lessons l WHERE l.title = 'Katakana A-KA Groups'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Read Katakana Words' AND e.lesson_id = l.id);

-- 7. Create Questions
-- Fill-in-blank questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'First vowel: ___', 'First sound', 'あ', 'あ is the first vowel', 3, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Fill Hiragana Vowels'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'First vowel: ___' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Third vowel: ___', 'U sound', 'う', 'う is the third vowel', 3, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Fill Hiragana Vowels'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Third vowel: ___' AND q.exercise_id = e.id);

-- Multiple choice questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Which is "ka"?', 'K + A sound', 'か', 'か is pronounced "ka"', 2, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Choose K-Group'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Which is "ka"?' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Which is "ki"?', 'K + I sound', 'き', 'き is pronounced "ki"', 2, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Choose K-Group'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Which is "ki"?' AND q.exercise_id = e.id);

-- Speech questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'Say "America" in Katakana', 'Foreign country name', 'アメリカ', 'America = アメリカ', 5, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Pronounce Katakana'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Say "America" in Katakana' AND q.exercise_id = e.id);

-- True/False questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT '一 means number 1', 'Basic number', 'true', 'Correct, 一 = 1', 2, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Kanji Meaning T/F'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = '一 means number 1' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT '三 means number 4', 'Count carefully', 'false', 'Wrong, 三 = 3', 2, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Kanji Meaning T/F'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = '三 means number 4' AND q.exercise_id = e.id);

-- Listening questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'What vowel did you hear?', 'Listen carefully', 'あ', 'The sound was あ (a)', 3, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Listen Vowels'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'What vowel did you hear?' AND q.exercise_id = e.id);

-- Reading questions
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 'What does アメリカ mean?', 'Country name', 'America', 'アメリカ means America', 4, e.id, NOW(), NOW()
FROM exercises e WHERE e.title = 'Read Katakana Words'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'What does アメリカ mean?' AND q.exercise_id = e.id);

-- 8. Create Options for Multiple Choice
-- Options for "Which is ka?"
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'か', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ka"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'か' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'き', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ka"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'き' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'く', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ka"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'く' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'け', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ka"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'け' AND o.question_id = q.id);

-- Options for "Which is ki?"
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'か', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'か' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'き', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'き' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'く', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'く' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'こ', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Which is "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'こ' AND o.question_id = q.id);

-- Options for Listening question
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'あ', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What vowel did you hear?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'あ' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'い', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What vowel did you hear?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'い' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'う', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What vowel did you hear?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'う' AND o.question_id = q.id);

-- Options for Reading question
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'America', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What does アメリカ mean?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'America' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'Canada', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What does アメリカ mean?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'Canada' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'Japan', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'What does アメリカ mean?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'Japan' AND o.question_id = q.id);

-- 9. Create Sample Enrollments
INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, is_completed, created_at, updated_at)
SELECT 
    s.user_id,
    c.id,
    20,
    1,
    c.price,
    false,
    NOW(),
    NOW()
FROM students s
JOIN courses c ON c.title = 'Hiragana Complete Course'
JOIN users u ON s.user_id = u.id
WHERE u.email = 'test1@student.com'
AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.user_id AND e.course_id = c.id);

-- 10. Final Summary
SELECT '🎉 RICH TEST DATA CREATED SUCCESSFULLY! 🎉' as status;
SELECT 'Courses: ' || COUNT(*) FROM courses WHERE title LIKE '%Complete%' OR title LIKE '%Mastery%' OR title LIKE '%Basic%';
SELECT 'Exercises Types: FILL_IN_BLANK, MULTIPLE_CHOICE, SPEECH, TRUE_FALSE, LISTENING, READING' as exercise_types;
SELECT 'Login as: test1@student.com / password123' as login_info; 