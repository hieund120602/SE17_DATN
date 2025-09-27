-- ===========================================
-- COMPREHENSIVE TEST DATA - MULTIPLE COURSES & DIVERSE EXERCISES
-- ===========================================

-- 1. Tạo Users (Tutors và Students)
INSERT INTO users (full_name, email, phone_number, password, avatar_url, enabled, blocked, created_at, updated_at)
VALUES 
-- Tutors
('Tanaka Sensei', 'tanaka@jplearn.com', '+84901111111', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Yamada Sensei', 'yamada@jplearn.com', '+84902222222', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Sato Sensei', 'sato@jplearn.com', '+84903333333', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
-- Students
('Nguyen Van A', 'student1@test.com', '+84905555555', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Tran Thi B', 'student2@test.com', '+84906666666', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW()),
('Le Van C', 'student3@test.com', '+84907777777', '$2a$12$LQiLHXhJhMT1jDOeFYdv5eqjtE5QbgJz5T2JhbkwmJqMk8TjE9CGu', null, true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Tạo Tutors
INSERT INTO tutors (user_id, teaching_requirements)
SELECT u.id, 'Chuyên gia giảng dạy tiếng Nhật với 5+ năm kinh nghiệm'
FROM users u 
WHERE u.email IN ('tanaka@jplearn.com', 'yamada@jplearn.com', 'sato@jplearn.com')
AND NOT EXISTS (SELECT 1 FROM tutors t WHERE t.user_id = u.id);

-- 3. Tạo Students
INSERT INTO students (user_id)
SELECT u.id
FROM users u 
WHERE u.email IN ('student1@test.com', 'student2@test.com', 'student3@test.com')
AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id);

-- 4. Tạo Courses đa dạng
-- Course 1: Hiragana Basics (BEGINNER)
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Hiragana Cơ Bản - Khởi Đầu Tiếng Nhật',
    'Học viết và đọc 46 ký tự Hiragana cơ bản với bài tập đa dạng',
    300,
    (SELECT id FROM levels WHERE name = 'BEGINNER' LIMIT 1),
    8,
    'Khóa học hoàn chỉnh về Hiragana với bài tập phong phú: điền chỗ trống, trắc nghiệm, phát âm',
    'Module 1: あ行 (A-gyou), Module 2: か行 (Ka-gyou), Module 3: さ行 (Sa-gyou)',
    199000,
    'https://example.com/hiragana.jpg',
    '✅ 46 ký tự Hiragana\n✅ Bài tập điền chỗ trống\n✅ Trắc nghiệm\n✅ Luyện phát âm\n✅ Certificate',
    15,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'tanaka@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Hiragana Cơ Bản - Khởi Đầu Tiếng Nhật');

-- Course 2: Katakana Master (BEGINNER)
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Katakana Master - Thành Thạo Ký Tự Ngoại Lai',
    'Hoàn thiện Katakana với các từ ngoại lai thông dụng',
    250,
    (SELECT id FROM levels WHERE name = 'BEGINNER' LIMIT 1),
    6,
    'Học Katakana qua từ vựng thực tế: tên nước, đồ ăn, công nghệ',
    'Module 1: ア行-カ行, Module 2: サ行-ナ行, Module 3: ハ行-ワ行',
    179000,
    'https://example.com/katakana.jpg',
    '✅ 46 ký tự Katakana\n✅ 100+ từ ngoại lai\n✅ Bài tập nghe\n✅ Phát âm chuẩn',
    22,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'yamada@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Katakana Master - Thành Thạo Ký Tự Ngoại Lai');

-- Course 3: Kanji Fundamentals (INTERMEDIATE)
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Kanji Cơ Bản - 100 Chữ Hán Đầu Tiên',
    'Chinh phục 100 chữ Kanji cơ bản nhất với nghĩa và cách đọc',
    480,
    (SELECT id FROM levels WHERE name = 'INTERMEDIATE' LIMIT 1),
    12,
    'Học Kanji theo chủ đề: con số, gia đình, thiên nhiên, cơ thể, thời gian',
    'Module 1: Số đếm và thời gian, Module 2: Gia đình và con người, Module 3: Thiên nhiên',
    299000,
    'https://example.com/kanji.jpg',
    '✅ 100 chữ Kanji\n✅ On-kun reading\n✅ Stroke order\n✅ Từ ghép thông dụng',
    8,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'sato@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Kanji Cơ Bản - 100 Chữ Hán Đầu Tiên');

-- Course 4: Conversation Basics (INTERMEDIATE)
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Hội Thoại Cơ Bản - Giao Tiếp Hàng Ngày',
    'Luyện tập hội thoại với các tình huống thực tế',
    360,
    (SELECT id FROM levels WHERE name = 'INTERMEDIATE' LIMIT 1),
    10,
    'Thực hành hội thoại: chào hỏi, mua sắm, nhà hàng, hỏi đường',
    'Module 1: Chào hỏi và giới thiệu, Module 2: Mua sắm và giá cả, Module 3: Ăn uống',
    249000,
    'https://example.com/conversation.jpg',
    '✅ 50+ mẫu hội thoại\n✅ Phát âm chuẩn\n✅ Từ vựng thực tế\n✅ Role-play exercises',
    12,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'tanaka@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Hội Thoại Cơ Bản - Giao Tiếp Hàng Ngày');

-- Course 5: JLPT N5 Preparation (ADVANCED)
INSERT INTO courses (title, description, duration_in_minutes, level_id, lesson_count, course_overview, course_content, price, thumbnail_url, includes_description, count_buy, tutor_id, status, created_at, updated_at)
SELECT 
    'Luyện Thi JLPT N5 - Chinh Phục Kỳ Thi',
    'Chuẩn bị toàn diện cho kỳ thi JLPT N5 với đề thi thử',
    600,
    (SELECT id FROM levels WHERE name = 'ADVANCED' LIMIT 1),
    15,
    'Ôn tập tổng hợp: từ vựng, ngữ pháp, đọc hiểu, nghe hiểu theo format JLPT',
    'Module 1: Vocabulary & Kanji, Module 2: Grammar, Module 3: Reading, Module 4: Listening',
    399000,
    'https://example.com/jlpt-n5.jpg',
    '✅ 800+ từ vựng N5\n✅ 100+ ngữ pháp\n✅ Đề thi thử\n✅ Chiến lược làm bài',
    25,
    t.user_id,
    'APPROVED',
    NOW(),
    NOW()
FROM tutors t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'yamada@jplearn.com'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = 'Luyện Thi JLPT N5 - Chinh Phục Kỳ Thi');

-- ===========================================
-- MODULES & LESSONS
-- ===========================================

-- Modules cho Course 1: Hiragana
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'あ行 - Nhóm A', 60, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Hiragana Cơ Bản - Khởi Đầu Tiếng Nhật'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'あ行 - Nhóm A' AND m.course_id = c.id);

INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'か行 - Nhóm KA', 80, c.id, 2, NOW(), NOW()
FROM courses c WHERE c.title = 'Hiragana Cơ Bản - Khởi Đầu Tiếng Nhật'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'か行 - Nhóm KA' AND m.course_id = c.id);

-- Modules cho Course 2: Katakana
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'ア行-カ行 - Cơ Bản', 90, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Katakana Master - Thành Thạo Ký Tự Ngoại Lai'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'ア行-カ行 - Cơ Bản' AND m.course_id = c.id);

-- Modules cho Course 3: Kanji
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Số Đếm và Thời Gian', 120, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Kanji Cơ Bản - 100 Chữ Hán Đầu Tiên'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Số Đếm và Thời Gian' AND m.course_id = c.id);

-- Modules cho Course 4: Conversation
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Chào Hỏi Cơ Bản', 90, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Hội Thoại Cơ Bản - Giao Tiếp Hàng Ngày'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Chào Hỏi Cơ Bản' AND m.course_id = c.id);

-- Modules cho Course 5: JLPT N5
INSERT INTO modules (title, duration_in_minutes, course_id, position, created_at, updated_at)
SELECT 'Vocabulary & Kanji N5', 150, c.id, 1, NOW(), NOW()
FROM courses c WHERE c.title = 'Luyện Thi JLPT N5 - Chinh Phục Kỳ Thi'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.title = 'Vocabulary & Kanji N5' AND m.course_id = c.id);

-- ===========================================
-- LESSONS
-- ===========================================

-- Lessons cho Hiragana Course
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'あ、い、う、え、お - 5 nguyên âm cơ bản',
    'Học viết và phát âm 5 nguyên âm đầu tiên',
    20,
    m.id,
    1,
    'https://youtube.com/hiragana-aiueo',
    'Trong bài này chúng ta sẽ học cách viết và phát âm 5 nguyên âm cơ bản của tiếng Nhật',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'あ行 - Nhóm A'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'あ、い、う、え、お - 5 nguyên âm cơ bản' AND l.module_id = m.id);

INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'か、き、く、け、こ - Âm K',
    'Học nhóm consonant K kết hợp với nguyên âm',
    25,
    m.id,
    1,
    'https://youtube.com/hiragana-kakikukeko',
    'Nhóm か行 là nhóm consonant đầu tiên chúng ta học sau nguyên âm',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'か行 - Nhóm KA'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'か、き、く、け、こ - Âm K' AND l.module_id = m.id);

-- Lessons cho Katakana Course
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'ア、イ、ウ、エ、オ - Katakana nguyên âm',
    'Katakana cho 5 nguyên âm cơ bản',
    30,
    m.id,
    1,
    'https://youtube.com/katakana-aiueo',
    'Học cách viết Katakana cho các nguyên âm và từ vựng ngoại lai',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'ア行-カ行 - Cơ Bản'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'ア、イ、ウ、エ、オ - Katakana nguyên âm' AND l.module_id = m.id);

-- Lessons cho Kanji Course
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    '一、二、三 - Chữ số cơ bản',
    'Học 3 chữ Kanji đầu tiên: 1, 2, 3',
    40,
    m.id,
    1,
    'https://youtube.com/kanji-123',
    'Ba chữ Kanji đầu tiên và cách sử dụng trong đếm số',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'Số Đếm và Thời Gian'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = '一、二、三 - Chữ số cơ bản' AND l.module_id = m.id);

-- Lessons cho Conversation Course
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'はじめまして - Lần đầu gặp gỡ',
    'Cách chào hỏi và giới thiệu bản thân',
    35,
    m.id,
    1,
    'https://youtube.com/hajimemashite',
    'Học cách chào hỏi lịch sự khi gặp người lần đầu',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'Chào Hỏi Cơ Bản'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'はじめまして - Lần đầu gặp gỡ' AND l.module_id = m.id);

-- Lessons cho JLPT Course
INSERT INTO lessons (title, description, duration_in_minutes, module_id, position, video_url, content, created_at, updated_at)
SELECT 
    'N5 Vocabulary - Từ vựng cơ bản',
    'Ôn tập 100 từ vựng quan trọng nhất N5',
    50,
    m.id,
    1,
    'https://youtube.com/n5-vocab',
    'Từ vựng thiết yếu cho kỳ thi JLPT N5',
    NOW(),
    NOW()
FROM modules m WHERE m.title = 'Vocabulary & Kanji N5'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.title = 'N5 Vocabulary - Từ vựng cơ bản' AND l.module_id = m.id);

-- ===========================================
-- EXERCISES ĐA DẠNG
-- ===========================================

-- 1. FILL_IN_BLANK Exercises
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'Điền Hiragana あ行',
    'Điền chỗ trống với các ký tự Hiragana đã học',
    'FILL_IN_BLANK',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l WHERE l.title = 'あ、い、う、え、お - 5 nguyên âm cơ bản'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Điền Hiragana あ行' AND e.lesson_id = l.id);

-- 2. MULTIPLE_CHOICE Exercises
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'Trắc Nghiệm か行',
    'Chọn đáp án đúng cho các ký tự か行',
    'MULTIPLE_CHOICE',
    l.id,
    'BEGINNER',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l WHERE l.title = 'か、き、く、け、こ - Âm K'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Trắc Nghiệm か行' AND e.lesson_id = l.id);

-- 3. SPEECH Exercises
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'Phát Âm Katakana',
    'Luyện phát âm các ký tự Katakana',
    'SPEECH',
    l.id,
    'アメリカ',
    'https://audio.example.com/america.mp3',
    'BEGINNER',
    'ja-JP',
    75,
    NOW(),
    NOW()
FROM lessons l WHERE l.title = 'ア、イ、ウ、エ、オ - Katakana nguyên âm'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Phát Âm Katakana' AND e.lesson_id = l.id);

-- 4. TRUE_FALSE Exercises
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'Đúng/Sai Kanji',
    'Xác định nghĩa chữ Kanji đúng hay sai',
    'TRUE_FALSE',
    l.id,
    'INTERMEDIATE',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l WHERE l.title = '一、二、三 - Chữ số cơ bản'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Đúng/Sai Kanji' AND e.lesson_id = l.id);

-- 5. LISTENING Exercises  
INSERT INTO exercises (title, description, type, lesson_id, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'Nghe Hội Thoại',
    'Nghe và trả lời câu hỏi về đoạn hội thoại',
    'LISTENING',
    l.id,
    'https://audio.example.com/greeting.mp3',
    'INTERMEDIATE',
    'ja-JP',
    70,
    NOW(),
    NOW()
FROM lessons l WHERE l.title = 'はじめまして - Lần đầu gặp gỡ'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Nghe Hội Thoại' AND e.lesson_id = l.id);

-- 6. READING Exercises
INSERT INTO exercises (title, description, type, lesson_id, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
SELECT 
    'Đọc Hiểu N5',
    'Đọc đoạn văn và trả lời câu hỏi',
    'READING',
    l.id,
    'ADVANCED',
    'ja-JP',
    75,
    NOW(),
    NOW()
FROM lessons l WHERE l.title = 'N5 Vocabulary - Từ vựng cơ bản'
AND NOT EXISTS (SELECT 1 FROM exercises e WHERE e.title = 'Đọc Hiểu N5' AND e.lesson_id = l.id);

-- ===========================================
-- QUESTIONS ĐA DẠNG
-- ===========================================

-- Questions cho Fill-in-blank
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Chữ cái đầu tiên của bảng Hiragana: ___',
    'Âm đầu tiên trong あ行',
    'あ',
    'あ (a) là ký tự đầu tiên của bảng Hiragana',
    3,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Điền Hiragana あ行'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Chữ cái đầu tiên của bảng Hiragana: ___' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Nguyên âm thứ 3 trong tiếng Nhật: ___',
    'Âm giữa trong あ行',
    'う',
    'う (u) là nguyên âm thứ 3',
    3,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Điền Hiragana あ行'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Nguyên âm thứ 3 trong tiếng Nhật: ___' AND q.exercise_id = e.id);

-- Questions cho Multiple Choice
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Cách đọc của ký tự か là gì?',
    'Âm đầu tiên của か行',
    'ka',
    'か được đọc là "ka"',
    2,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Trắc Nghiệm か行'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Cách đọc của ký tự か là gì?' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Ký tự nào đọc là "ki"?',
    'Ký tự thứ 2 trong か行',
    'き',
    'き được đọc là "ki"',
    2,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Trắc Nghiệm か行'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Ký tự nào đọc là "ki"?' AND q.exercise_id = e.id);

-- Questions cho Speech
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Hãy phát âm từ "America" bằng Katakana',
    'アメリカ',
    'アメリカ',
    'America được viết là アメリカ trong Katakana',
    5,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Phát Âm Katakana'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Hãy phát âm từ "America" bằng Katakana' AND q.exercise_id = e.id);

-- Questions cho True/False
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Chữ Kanji 一 có nghĩa là số 1',
    'Kiểm tra nghĩa cơ bản',
    'true',
    'Đúng, 一 có nghĩa là số 1',
    2,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Đúng/Sai Kanji'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Chữ Kanji 一 có nghĩa là số 1' AND q.exercise_id = e.id);

INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Chữ Kanji 三 có nghĩa là số 4',
    'Kiểm tra nghĩa số đếm',
    'false',
    'Sai, 三 có nghĩa là số 3, không phải 4',
    2,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Đúng/Sai Kanji'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Chữ Kanji 三 có nghĩa là số 4' AND q.exercise_id = e.id);

-- Questions cho Listening
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Trong đoạn hội thoại, người đàn ông nói gì đầu tiên?',
    'Nghe kỹ phần đầu',
    'はじめまして',
    'Người đàn ông chào "はじめまして" (rất hân hạnh)',
    4,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Nghe Hội Thoại'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Trong đoạn hội thoại, người đàn ông nói gì đầu tiên?' AND q.exercise_id = e.id);

-- Questions cho Reading
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
SELECT 
    'Theo đoạn văn, từ "がくせい" có nghĩa là gì?',
    'Đọc kỹ phần giải thích từ vựng',
    'học sinh',
    'がくせい (gakusei) có nghĩa là học sinh/sinh viên',
    3,
    e.id,
    NOW(),
    NOW()
FROM exercises e WHERE e.title = 'Đọc Hiểu N5'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = 'Theo đoạn văn, từ "がくせい" có nghĩa là gì?' AND q.exercise_id = e.id);

-- ===========================================
-- OPTIONS CHO MULTIPLE CHOICE
-- ===========================================

-- Options cho câu hỏi "Cách đọc của ký tự か là gì?"
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'ka', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Cách đọc của ký tự か là gì?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'ka' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'ki', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Cách đọc của ký tự か là gì?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'ki' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'ku', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Cách đọc của ký tự か là gì?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'ku' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'ke', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Cách đọc của ký tự か là gì?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'ke' AND o.question_id = q.id);

-- Options cho câu hỏi "Ký tự nào đọc là ki?"
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'か', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Ký tự nào đọc là "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'か' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'き', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Ký tự nào đọc là "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'き' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'く', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Ký tự nào đọc là "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'く' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'こ', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Ký tự nào đọc là "ki"?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'こ' AND o.question_id = q.id);

-- Options cho Listening question
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'はじめまして', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Trong đoạn hội thoại, người đàn ông nói gì đầu tiên?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'はじめまして' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'こんにちは', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Trong đoạn hội thoại, người đàn ông nói gì đầu tiên?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'こんにちは' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'おはよう', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Trong đoạn hội thoại, người đàn ông nói gì đầu tiên?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'おはよう' AND o.question_id = q.id);

-- Options cho Reading question
INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'học sinh', true, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Theo đoạn văn, từ "がくせい" có nghĩa là gì?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'học sinh' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'giáo viên', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Theo đoạn văn, từ "がくせい" có nghĩa là gì?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'giáo viên' AND o.question_id = q.id);

INSERT INTO options (content, correct, question_id, created_at, updated_at)
SELECT 'bác sĩ', false, q.id, NOW(), NOW()
FROM questions q WHERE q.content = 'Theo đoạn văn, từ "がくせい" có nghĩa là gì?'
AND NOT EXISTS (SELECT 1 FROM options o WHERE o.content = 'bác sĩ' AND o.question_id = q.id);

-- ===========================================
-- ENROLLMENT TEST DATA
-- ===========================================

-- Tạo enrollments cho test
INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, is_completed, created_at, updated_at)
SELECT 
    s.user_id,
    c.id,
    25,
    1,
    c.price,
    false,
    NOW(),
    NOW()
FROM students s
JOIN courses c ON c.title = 'Hiragana Cơ Bản - Khởi Đầu Tiếng Nhật'
JOIN users u ON s.user_id = u.id
WHERE u.email = 'student1@test.com'
AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.user_id AND e.course_id = c.id);

INSERT INTO enrollments (student_id, course_id, progress_percentage, completed_lessons, price_paid, is_completed, created_at, updated_at)
SELECT 
    s.user_id,
    c.id,
    0,
    0,
    c.price,
    false,
    NOW(),
    NOW()
FROM students s
JOIN courses c ON c.title = 'Katakana Master - Thành Thạo Ký Tự Ngoại Lai'
JOIN users u ON s.user_id = u.id
WHERE u.email = 'student2@test.com'
AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.user_id AND e.course_id = c.id);

-- ===========================================
-- FINAL VERIFICATION
-- ===========================================

-- Kiểm tra dữ liệu đã tạo
SELECT 'COMPREHENSIVE TEST DATA CREATED!' as status;
SELECT 'Total Users: ' || COUNT(*) as users_count FROM users WHERE email LIKE '%@jplearn.com' OR email LIKE '%@test.com';
SELECT 'Total Courses: ' || COUNT(*) as courses_count FROM courses;
SELECT 'Total Modules: ' || COUNT(*) as modules_count FROM modules;
SELECT 'Total Lessons: ' || COUNT(*) as lessons_count FROM lessons;
SELECT 'Total Exercises: ' || COUNT(*) as exercises_count FROM exercises;
SELECT 'Total Questions: ' || COUNT(*) as questions_count FROM questions;
SELECT 'Total Options: ' || COUNT(*) as options_count FROM options;
SELECT 'Total Enrollments: ' || COUNT(*) as enrollments_count FROM enrollments;

-- Login credentials
SELECT '==================== LOGIN CREDENTIALS ====================' as info;
SELECT 'TUTORS:' as tutors;
SELECT 'Email: tanaka@jplearn.com | Password: password123' as tutor1;
SELECT 'Email: yamada@jplearn.com | Password: password123' as tutor2;
SELECT 'Email: sato@jplearn.com | Password: password123' as tutor3;
SELECT 'STUDENTS:' as students;
SELECT 'Email: student1@test.com | Password: password123' as student1;
SELECT 'Email: student2@test.com | Password: password123' as student2;
SELECT 'Email: student3@test.com | Password: password123' as student3;
SELECT '=========================================================' as end_info; 