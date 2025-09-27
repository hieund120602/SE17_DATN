-- ================================================
-- SCRIPT TẠO DỮ LIỆU TEST CHO HỆ THỐNG E-LEARNING
-- ================================================

-- Xóa dữ liệu cũ (nếu cần)
-- TRUNCATE TABLE question_options CASCADE;
-- TRUNCATE TABLE questions CASCADE;
-- TRUNCATE TABLE exercises CASCADE;
-- TRUNCATE TABLE lesson_resources CASCADE;
-- TRUNCATE TABLE lessons CASCADE;
-- TRUNCATE TABLE modules CASCADE;
-- TRUNCATE TABLE course_combo_courses CASCADE;
-- TRUNCATE TABLE course_combos CASCADE;
-- TRUNCATE TABLE courses CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- ================================================
-- 1. TẠO TUTORS
-- ================================================

INSERT INTO users (username, email, password, first_name, last_name, role, is_active, phone_number, created_at, updated_at)
VALUES 
('tutor_akiko', 'akiko@example.com', '$2a$10$example_hash', 'Akiko', 'Tanaka', 'TUTOR', true, '+84123456789', NOW(), NOW()),
('tutor_hiroshi', 'hiroshi@example.com', '$2a$10$example_hash', 'Hiroshi', 'Yamamoto', 'TUTOR', true, '+84123456790', NOW(), NOW()),
('tutor_yuki', 'yuki@example.com', '$2a$10$example_hash', 'Yuki', 'Sato', 'TUTOR', true, '+84123456791', NOW(), NOW()),
('tutor_kenji', 'kenji@example.com', '$2a$10$example_hash', 'Kenji', 'Watanabe', 'TUTOR', true, '+84123456792', NOW(), NOW());

-- ================================================
-- 2. TẠO COURSES
-- ================================================

-- Course 1: Hiragana Cơ Bản
INSERT INTO courses (title, description, duration_in_minutes, level, course_overview, course_content, thumbnail_url, tutor_id, price, is_free, status, created_at, updated_at)
VALUES (
    'Hiragana hoàn chỉnh - Nền tảng tiếng Nhật',
    'Khóa học toàn diện về hệ chữ Hiragana với nhiều dạng bài tập đa dạng',
    1200,
    'BEGINNER',
    '<h3>Tổng quan khóa học</h3><p>• Học 25 ký tự Hiragana<br/>• Phát âm chuẩn<br/>• Viết đúng nét<br/>• 50+ bài tập tương tác</p>',
    'Nội dung chi tiết về Hiragana từ cơ bản đến nâng cao',
    'https://res.cloudinary.com/dugsysqjv/image/upload/v1/hiragana-course.jpg',
    (SELECT id FROM users WHERE username = 'tutor_akiko'),
    299000,
    false,
    'PUBLISHED',
    NOW(),
    NOW()
);

-- Course 2: Katakana Cơ Bản  
INSERT INTO courses (title, description, duration_in_minutes, level, course_overview, course_content, thumbnail_url, tutor_id, price, is_free, status, created_at, updated_at)
VALUES (
    'Katakana hoàn chỉnh - Mở rộng từ vựng',
    'Học hệ chữ Katakana để đọc từ ngoại lai và mở rộng vốn từ vựng',
    1000,
    'BEGINNER',
    '<h3>Tổng quan khóa học</h3><p>• Học 25 ký tự Katakana<br/>• Từ ngoại lai phổ biến<br/>• Bài tập viết và đọc<br/>• Audio chuẩn từ người bản xứ</p>',
    'Katakana từ cơ bản đến thành thạo với nhiều ví dụ thực tế',
    'https://res.cloudinary.com/dugsysqjv/image/upload/v1/katakana-course.jpg',
    (SELECT id FROM users WHERE username = 'tutor_hiroshi'),
    249000,
    false,
    'PUBLISHED',
    NOW(),
    NOW()
);

-- Course 3: Kanji Cơ Bản
INSERT INTO courses (title, description, duration_in_minutes, level, course_overview, course_content, thumbnail_url, tutor_id, price, is_free, status, created_at, updated_at)
VALUES (
    'Kanji cơ bản - 100 chữ đầu tiên',
    'Học 100 chữ Kanji cơ bản nhất với nhiều cách ghi nhớ hiệu quả',
    1500,
    'ELEMENTARY',
    '<h3>Tổng quan khóa học</h3><p>• 100 Kanji cơ bản<br/>• Âm On và Kun<br/>• Thứ tự nét<br/>• Ví dụ từ vựng thực tế</p>',
    'Kanji từ cơ bản với phương pháp học tập khoa học',
    'https://res.cloudinary.com/dugsysqjv/image/upload/v1/kanji-course.jpg',
    (SELECT id FROM users WHERE username = 'tutor_yuki'),
    399000,
    false,
    'PUBLISHED',
    NOW(),
    NOW()
);

-- Course 4: Ngữ pháp N5
INSERT INTO courses (title, description, duration_in_minutes, level, course_overview, course_content, thumbnail_url, tutor_id, price, is_free, status, created_at, updated_at)
VALUES (
    'Ngữ pháp N5 - Nền tảng giao tiếp',
    'Tất cả ngữ pháp N5 với ví dụ thực tế và bài tập đa dạng',
    1800,
    'ELEMENTARY',
    '<h3>Tổng quan khóa học</h3><p>• 50+ mẫu câu N5<br/>• Ví dụ thực tế<br/>• Bài tập đa dạng<br/>• Chuẩn bị thi JLPT N5</p>',
    'Ngữ pháp N5 từ cơ bản đến thành thạo',
    'https://res.cloudinary.com/dugsysqjv/image/upload/v1/grammar-n5.jpg',
    (SELECT id FROM users WHERE username = 'tutor_kenji'),
    499000,
    false,
    'PUBLISHED',
    NOW(),
    NOW()
);

-- Course 5: Từ vựng N5 (FREE)
INSERT INTO courses (title, description, duration_in_minutes, level, course_overview, course_content, thumbnail_url, tutor_id, price, is_free, status, created_at, updated_at)
VALUES (
    'Từ vựng N5 - 800 từ thiết yếu',
    'Học 800 từ vựng N5 qua ví dụ và bài tập tương tác',
    900,
    'BEGINNER',
    '<h3>Tổng quan khóa học</h3><p>• 800 từ vựng N5<br/>• Phân loại theo chủ đề<br/>• Audio chuẩn<br/>• Bài tập ghi nhớ</p>',
    'Từ vựng N5 được sắp xếp khoa học theo chủ đề',
    'https://res.cloudinary.com/dugsysqjv/image/upload/v1/vocabulary-n5.jpg',
    (SELECT id FROM users WHERE username = 'tutor_akiko'),
    0,
    true,
    'PUBLISHED',
    NOW(),
    NOW()
);

-- ================================================
-- 3. TẠO MODULES CHO TỪNG COURSE
-- ================================================

-- Modules cho Course 1 (Hiragana)
INSERT INTO modules (title, description, duration_in_minutes, course_id, order_index, created_at, updated_at)
VALUES 
('あ段 Hiragana', 'Học nhóm ký tự あ, い, う, え, お', 240, 1, 1, NOW(), NOW()),
('か段 Hiragana', 'Học nhóm ký tự か, き, く, け, こ', 240, 1, 2, NOW(), NOW()),
('さ段 Hiragana', 'Học nhóm ký tự さ, し, す, せ, そ', 240, 1, 3, NOW(), NOW()),
('た段 Hiragana', 'Học nhóm ký tự た, ち, つ, て, と', 240, 1, 4, NOW(), NOW()),
('な段 Hiragana', 'Học nhóm ký tự な, に, ぬ, ね, の', 240, 1, 5, NOW(), NOW());

-- Modules cho Course 2 (Katakana)  
INSERT INTO modules (title, description, duration_in_minutes, course_id, order_index, created_at, updated_at)
VALUES 
('ア段 Katakana', 'Học nhóm ký tự ア, イ, ウ, エ, オ', 200, 2, 1, NOW(), NOW()),
('カ段 Katakana', 'Học nhóm ký tự カ, キ, ク, ケ, コ', 200, 2, 2, NOW(), NOW()),
('サ段 Katakana', 'Học nhóm ký tự サ, シ, ス, セ, ソ', 200, 2, 3, NOW(), NOW()),
('タ段 Katakana', 'Học nhóm ký tự タ, チ, ツ, テ, ト', 200, 2, 4, NOW(), NOW()),
('Từ ngoại lai', 'Học từ ngoại lai phổ biến bằng Katakana', 200, 2, 5, NOW(), NOW());

-- Modules cho Course 3 (Kanji)
INSERT INTO modules (title, description, duration_in_minutes, course_id, order_index, created_at, updated_at)
VALUES 
('Kanji cơ bản 1-20', 'Học 20 chữ Kanji đầu tiên', 300, 3, 1, NOW(), NOW()),
('Kanji cơ bản 21-40', 'Học 20 chữ Kanji tiếp theo', 300, 3, 2, NOW(), NOW()),
('Kanji cơ bản 41-60', 'Học 20 chữ Kanji tiếp theo', 300, 3, 3, NOW(), NOW()),
('Kanji cơ bản 61-80', 'Học 20 chữ Kanji tiếp theo', 300, 3, 4, NOW(), NOW()),
('Kanji cơ bản 81-100', 'Học 20 chữ Kanji cuối cùng', 300, 3, 5, NOW(), NOW());

-- Modules cho Course 4 (Ngữ pháp N5)
INSERT INTO modules (title, description, duration_in_minutes, course_id, order_index, created_at, updated_at)
VALUES 
('Cấu trúc câu cơ bản', 'です/である, は, が, を', 360, 4, 1, NOW(), NOW()),
('Động từ và thì', 'Động từ nhóm 1, 2, 3 và các thì', 360, 4, 2, NOW(), NOW()),
('Tính từ i và na', 'Cách sử dụng tính từ trong câu', 360, 4, 3, NOW(), NOW()),
('Số đếm và thời gian', 'Đếm số, thời gian, ngày tháng', 360, 4, 4, NOW(), NOW()),
('Mẫu câu N5 nâng cao', 'Các mẫu câu phức tạp hơn', 360, 4, 5, NOW(), NOW());

-- Modules cho Course 5 (Từ vựng N5)
INSERT INTO modules (title, description, duration_in_minutes, course_id, order_index, created_at, updated_at)
VALUES 
('Từ vựng gia đình', 'Các từ về thành viên gia đình', 180, 5, 1, NOW(), NOW()),
('Từ vựng thời gian', 'Từ vựng về thời gian, ngày tháng', 180, 5, 2, NOW(), NOW()),
('Từ vựng màu sắc', 'Các màu sắc trong tiếng Nhật', 180, 5, 3, NOW(), NOW()),
('Từ vựng số đếm', 'Cách đếm các đối tượng khác nhau', 180, 5, 4, NOW(), NOW()),
('Từ vựng hành động', 'Các động từ thường dùng hàng ngày', 180, 5, 5, NOW(), NOW());

-- ================================================
-- 4. TẠO LESSONS CHO TỪNG MODULE
-- ================================================

-- Lessons cho Module 1 (あ段 Hiragana)
INSERT INTO lessons (title, description, duration_in_minutes, module_id, order_index, video_url, created_at, updated_at)
VALUES 
('Học あ段', 'Viết ký tự Hiragana あ段', 30, 1, 1, 'https://www.youtube.com/watch?v=example1', NOW(), NOW()),
('Điền ký tự あ段', 'Bài tập điền ký tự Hiragana あ段', 30, 1, 2, 'https://www.youtube.com/watch?v=example2', NOW(), NOW()),
('Học か段', 'Viết ký tự Hiragana か段', 30, 2, 1, 'https://www.youtube.com/watch?v=example3', NOW(), NOW()),
('Học さ段', 'Viết ký tự Hiragana さ段', 30, 3, 1, 'https://www.youtube.com/watch?v=example4', NOW(), NOW()),
('Học た段', 'Viết ký tự Hiragana た段', 30, 4, 1, 'https://www.youtube.com/watch?v=example5', NOW(), NOW()),
('Học な段', 'Viết ký tự Hiragana な段', 30, 5, 1, 'https://www.youtube.com/watch?v=example6', NOW(), NOW());

-- Lessons cho Katakana
INSERT INTO lessons (title, description, duration_in_minutes, module_id, order_index, video_url, created_at, updated_at)
VALUES 
('Học ア段', 'Viết ký tự Katakana ア段', 30, 6, 1, 'https://www.youtube.com/watch?v=example7', NOW(), NOW()),
('Học カ段', 'Viết ký tự Katakana カ段', 30, 7, 1, 'https://www.youtube.com/watch?v=example8', NOW(), NOW()),
('Học サ段', 'Viết ký tự Katakana サ段', 30, 8, 1, 'https://www.youtube.com/watch?v=example9', NOW(), NOW());

-- Lessons cho các course khác
INSERT INTO lessons (title, description, duration_in_minutes, module_id, order_index, video_url, created_at, updated_at)
VALUES 
('Kanji số 1-10', 'Học 10 chữ Kanji đầu tiên', 45, 11, 1, 'https://www.youtube.com/watch?v=kanji1', NOW(), NOW()),
('Kanji số 11-20', 'Học 10 chữ Kanji tiếp theo', 45, 11, 2, 'https://www.youtube.com/watch?v=kanji2', NOW(), NOW()),
('Cấu trúc です', 'Học cách sử dụng です trong câu', 40, 16, 1, 'https://www.youtube.com/watch?v=grammar1', NOW(), NOW()),
('Từ vựng gia đình cơ bản', 'Học các từ về thành viên gia đình', 35, 21, 1, 'https://www.youtube.com/watch?v=vocab1', NOW(), NOW());

-- ================================================
-- 5. TẠO EXERCISES ĐA DẠNG
-- ================================================

-- Exercise 1: FILL_IN_BLANK cho Hiragana
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
VALUES 
('Điền ký tự あ段', 'Điền ký tự Hiragana phù hợp vào chỗ trống', 'FILL_IN_BLANK', 1, null, null, 'BEGINNER', 'ja-JP', 70, NOW(), NOW()),
('Điền ký tự か段', 'Điền ký tự Hiragana か段 vào chỗ trống', 'FILL_IN_BLANK', 3, null, null, 'BEGINNER', 'ja-JP', 70, NOW(), NOW());

-- Exercise 2: MULTIPLE_CHOICE
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
VALUES 
('Chọn ký tự đúng', 'Chọn ký tự Hiragana phù hợp', 'MULTIPLE_CHOICE', 1, null, null, 'BEGINNER', 'ja-JP', 70, NOW(), NOW()),
('Chọn từ vựng đúng', 'Chọn từ vựng tiếng Nhật phù hợp', 'MULTIPLE_CHOICE', 12, null, null, 'ELEMENTARY', 'ja-JP', 70, NOW(), NOW());

-- Exercise 3: SPEECH_RECOGNITION
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
VALUES 
('Phát âm あ段', 'Luyện phát âm ký tự あ段', 'SPEECH_RECOGNITION', 1, 'あいうえお', 'https://res.cloudinary.com/dugsysqjv/video/upload/v1/aiueo.mp3', 'BEGINNER', 'ja-JP', 80, NOW(), NOW()),
('Phát âm か段', 'Luyện phát âm ký tự か段', 'SPEECH_RECOGNITION', 3, 'かきくけこ', 'https://res.cloudinary.com/dugsysqjv/video/upload/v1/kakikukeko.mp3', 'BEGINNER', 'ja-JP', 80, NOW(), NOW());

-- Exercise 4: LISTENING
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
VALUES 
('Nghe âm あ段', 'Nghe và nhận biết âm あ段', 'LISTENING', 1, 'あいうえお', 'https://res.cloudinary.com/dugsysqjv/video/upload/v1/listening_aiueo.mp3', 'BEGINNER', 'ja-JP', 70, NOW(), NOW());

-- Exercise 5: WRITING
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
VALUES 
('Viết ký tự Hiragana', 'Luyện viết ký tự Hiragana đúng thứ tự nét', 'WRITING', 1, null, null, 'BEGINNER', 'ja-JP', 70, NOW(), NOW());

-- Exercise 6: MATCHING
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
VALUES 
('Nối âm và chữ', 'Nối âm thanh với ký tự tương ứng', 'MATCHING', 1, null, null, 'BEGINNER', 'ja-JP', 70, NOW(), NOW());

-- ================================================
-- 6. TẠO QUESTIONS CHO CÁC EXERCISES
-- ================================================

-- Questions cho Exercise 1 (FILL_IN_BLANK)
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
VALUES 
('Âm "a" được viết bằng ký tự Hiragana: ____', 'Đây là ký tự đầu tiên trong bảng Hiragana', 'あ', 'あ là ký tự đầu tiên trong hệ chữ Hiragana, phát âm là "a"', 10, 1, NOW(), NOW()),
('Âm "i" được viết bằng ký tự Hiragana: ____', 'Ký tự thứ hai trong nhóm あ段', 'い', 'い là ký tự thứ hai, phát âm là "i"', 10, 1, NOW(), NOW()),
('Âm "u" được viết bằng ký tự Hiragana: ____', 'Ký tự thứ ba trong nhóm あ段', 'う', 'う là ký tự thứ ba, phát âm là "u"', 10, 1, NOW(), NOW()),
('Âm "e" được viết bằng ký tự Hiragana: ____', 'Ký tự thứ tư trong nhóm あ段', 'え', 'え là ký tự thứ tư, phát âm là "e"', 10, 1, NOW(), NOW()),
('Âm "o" được viết bằng ký tự Hiragana: ____', 'Ký tự cuối cùng trong nhóm あ段', 'お', 'お là ký tự cuối cùng, phát âm là "o"', 10, 1, NOW(), NOW());

-- Questions cho Exercise 2 (FILL_IN_BLANK か段)
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
VALUES 
('Âm "ka" được viết bằng ký tự Hiragana: ____', 'Ký tự đầu tiên trong nhóm か段', 'か', 'か phát âm là "ka"', 10, 2, NOW(), NOW()),
('Âm "ki" được viết bằng ký tự Hiragana: ____', 'Ký tự thứ hai trong nhóm か段', 'き', 'き phát âm là "ki"', 10, 2, NOW(), NOW()),
('Âm "ku" được viết bằng ký tự Hiragana: ____', 'Ký tự thứ ba trong nhóm か段', 'く', 'く phát âm là "ku"', 10, 2, NOW(), NOW());

-- Questions cho Exercise 3 (MULTIPLE_CHOICE)
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
VALUES 
('Ký tự nào phát âm là "a"?', 'Ký tự đầu tiên trong bảng Hiragana', 'あ', 'あ là ký tự phát âm "a"', 10, 3, NOW(), NOW()),
('Ký tự nào phát âm là "ka"?', 'Ký tự đầu tiên trong nhóm か段', 'か', 'か là ký tự phát âm "ka"', 10, 3, NOW(), NOW());

-- Questions cho Exercise 4 (MULTIPLE_CHOICE từ vựng)
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
VALUES 
('Từ nào có nghĩa là "gia đình"?', 'Từ chỉ nhóm người sống cùng nhau', 'かぞく', 'かぞく (kazoku) có nghĩa là gia đình', 15, 4, NOW(), NOW()),
('Từ nào có nghĩa là "mẹ"?', 'Từ chỉ người phụ nữ sinh ra mình', 'おかあさん', 'おかあさん (okaasan) có nghĩa là mẹ', 15, 4, NOW(), NOW());

-- ================================================
-- 7. TẠO OPTIONS CHO MULTIPLE_CHOICE QUESTIONS
-- ================================================

-- Options cho Question "Ký tự nào phát âm là 'a'?"
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
VALUES 
('あ', true, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "a"%'), NOW(), NOW()),
('い', false, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "a"%'), NOW(), NOW()),
('う', false, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "a"%'), NOW(), NOW()),
('え', false, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "a"%'), NOW(), NOW());

-- Options cho Question "Ký tự nào phát âm là 'ka'?"
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
VALUES 
('あ', false, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "ka"%'), NOW(), NOW()),
('か', true, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "ka"%'), NOW(), NOW()),
('さ', false, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "ka"%'), NOW(), NOW()),
('た', false, (SELECT id FROM questions WHERE content LIKE 'Ký tự nào phát âm là "ka"%'), NOW(), NOW());

-- Options cho Question "Từ nào có nghĩa là 'gia đình'?"
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
VALUES 
('かぞく', true, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "gia đình"%'), NOW(), NOW()),
('がっこう', false, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "gia đình"%'), NOW(), NOW()),
('ともだち', false, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "gia đình"%'), NOW(), NOW()),
('せんせい', false, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "gia đình"%'), NOW(), NOW());

-- Options cho Question "Từ nào có nghĩa là 'mẹ'?"
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
VALUES 
('おとうさん', false, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "mẹ"%'), NOW(), NOW()),
('おかあさん', true, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "mẹ"%'), NOW(), NOW()),
('おじいさん', false, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "mẹ"%'), NOW(), NOW()),
('おばあさん', false, (SELECT id FROM questions WHERE content LIKE 'Từ nào có nghĩa là "mẹ"%'), NOW(), NOW());

-- ================================================
-- 8. TẠO THÊM QUESTIONS VÀ EXERCISES ĐA DẠNG
-- ================================================

-- Thêm Exercise LISTENING
INSERT INTO exercises (title, description, type, lesson_id, target_text, target_audio_url, difficulty_level, speech_recognition_language, minimum_accuracy_score, created_at, updated_at)
VALUES 
('Nghe và chọn ký tự', 'Nghe âm thanh và chọn ký tự đúng', 'LISTENING', 2, null, 'https://res.cloudinary.com/dugsysqjv/video/upload/v1/listening_test.mp3', 'BEGINNER', 'ja-JP', 70, NOW(), NOW());

-- Questions cho LISTENING exercise
INSERT INTO questions (content, hint, correct_answer, answer_explanation, points, exercise_id, created_at, updated_at)
VALUES 
('Hãy nghe và chọn ký tự bạn vừa nghe', 'Nghe kỹ âm thanh', 'い', 'Âm thanh phát ra là "i", tương ứng với ký tự い', 15, (SELECT MAX(id) FROM exercises), NOW(), NOW());

-- Options cho LISTENING question
INSERT INTO question_options (content, correct, question_id, created_at, updated_at)
VALUES 
('あ', false, (SELECT MAX(id) FROM questions), NOW(), NOW()),
('い', true, (SELECT MAX(id) FROM questions), NOW(), NOW()),
('う', false, (SELECT MAX(id) FROM questions), NOW(), NOW()),
('え', false, (SELECT MAX(id) FROM questions), NOW(), NOW());

-- ================================================
-- 9. TẠO COURSE COMBOS
-- ================================================

INSERT INTO course_combos (title, description, price, discount_percentage, thumbnail_url, status, created_at, updated_at)
VALUES 
('Combo Hiragana + Katakana', 'Học trọn bộ 2 hệ chữ cơ bản của tiếng Nhật', 450000, 20, 'https://res.cloudinary.com/dugsysqjv/image/upload/v1/combo-hiragana-katakana.jpg', 'PUBLISHED', NOW(), NOW()),
('Combo N5 Hoàn chỉnh', 'Tất cả kiến thức cần thiết để đạt N5', 800000, 25, 'https://res.cloudinary.com/dugsysqjv/image/upload/v1/combo-n5-complete.jpg', 'PUBLISHED', NOW(), NOW());

-- Liên kết courses với combos
INSERT INTO course_combo_courses (course_combo_id, course_id, created_at, updated_at)
VALUES 
(1, 1, NOW(), NOW()), -- Hiragana
(1, 2, NOW(), NOW()), -- Katakana
(2, 1, NOW(), NOW()), -- Hiragana
(2, 2, NOW(), NOW()), -- Katakana  
(2, 3, NOW(), NOW()), -- Kanji
(2, 4, NOW(), NOW()), -- Ngữ pháp N5
(2, 5, NOW(), NOW()); -- Từ vựng N5

-- ================================================
-- 10. TẠO LESSON RESOURCES
-- ================================================

INSERT INTO lesson_resources (title, description, file_url, file_type, lesson_id, created_at, updated_at)
VALUES 
('Bảng Hiragana PDF', 'Bảng Hiragana đầy đủ để in ra học', 'https://res.cloudinary.com/dugsysqjv/raw/upload/v1/hiragana-chart.pdf', 'application/pdf', 1, NOW(), NOW()),
('Audio phát âm あ段', 'File âm thanh phát âm chuẩn あ段', 'https://res.cloudinary.com/dugsysqjv/video/upload/v1/aiueo-audio.mp3', 'audio/mpeg', 1, NOW(), NOW()),
('Bài tập viết Hiragana', 'Worksheet để luyện viết ký tự', 'https://res.cloudinary.com/dugsysqjv/raw/upload/v1/hiragana-practice.pdf', 'application/pdf', 1, NOW(), NOW()),
('Flashcards Katakana', 'Thẻ học từ vựng Katakana', 'https://res.cloudinary.com/dugsysqjv/raw/upload/v1/katakana-flashcards.pdf', 'application/pdf', 7, NOW(), NOW());

-- ================================================
-- HOÀN THÀNH SCRIPT
-- ================================================

-- Kiểm tra dữ liệu đã tạo
SELECT 'Courses created: ' || COUNT(*) FROM courses;
SELECT 'Modules created: ' || COUNT(*) FROM modules;  
SELECT 'Lessons created: ' || COUNT(*) FROM lessons;
SELECT 'Exercises created: ' || COUNT(*) FROM exercises;
SELECT 'Questions created: ' || COUNT(*) FROM questions;
SELECT 'Options created: ' || COUNT(*) FROM question_options;
SELECT 'Combos created: ' || COUNT(*) FROM course_combos;
SELECT 'Resources created: ' || COUNT(*) FROM lesson_resources;

-- End of script 