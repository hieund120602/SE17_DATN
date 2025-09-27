# 🎌 HƯỚNG DẪN TẠO DỮ LIỆU TEST

## 📋 Tổng quan

Script này tạo dữ liệu test toàn diện cho hệ thống E-Learning Japanese với nhiều loại bài tập đa dạng để test tất cả tính năng.

## 🚀 Cách sử dụng

### Phương pháp 1: Sử dụng Shell Script (Khuyến nghị)

```bash
# 1. Đảm bảo Spring Boot app đang chạy
cd japanese-learning-platform
mvn spring-boot:run

# 2. Mở terminal mới và chạy script
chmod +x populate_test_data.sh
./populate_test_data.sh

# Hoặc sử dụng tham số trực tiếp:
./populate_test_data.sh populate    # Tạo dữ liệu
./populate_test_data.sh clear       # Xóa dữ liệu
./populate_test_data.sh info        # Xem thông tin
./populate_test_data.sh test        # Test endpoints
```

### Phương pháp 2: Sử dụng SQL Script

```bash
# Kết nối PostgreSQL và chạy script
psql -U postgres -d japanese_learning -f populate_test_data.sql
```

### Phương pháp 3: Sử dụng API trực tiếp

```bash
# Tạo dữ liệu
curl -X POST http://localhost:8080/api/test-data/populate

# Xóa dữ liệu
curl -X DELETE http://localhost:8080/api/test-data/clear

# Xem thông tin
curl -X GET http://localhost:8080/api/test-data/info
```

## 📊 Dữ liệu được tạo

### 👨‍🏫 4 Tutors

-   **tutor_akiko** - Chuyên Hiragana & Từ vựng
-   **tutor_hiroshi** - Chuyên Katakana
-   **tutor_yuki** - Chuyên Kanji
-   **tutor_kenji** - Chuyên Ngữ pháp

_Password cho tất cả tutors: `password123`_

### 📚 5 Courses

| Course                 | Level      | Price       | Loại |
| ---------------------- | ---------- | ----------- | ---- |
| Hiragana hoàn chỉnh    | BEGINNER   | 299,000 VND | Paid |
| Katakana hoàn chỉnh    | BEGINNER   | 249,000 VND | Paid |
| Kanji cơ bản (100 chữ) | ELEMENTARY | 399,000 VND | Paid |
| Ngữ pháp N5            | ELEMENTARY | 499,000 VND | Paid |
| Từ vựng N5 (800 từ)    | BEGINNER   | FREE        | Free |

### 🎯 7 Loại Exercises

#### 1. **FILL_IN_BLANK** - Điền từ vào chỗ trống ✅

-   Content: `"Âm 'a' được viết bằng ký tự Hiragana: ____"`
-   Answer: `"あ"`
-   Multiple blanks support
-   **Status: HOẠT ĐỘNG HOÀN HẢO**

#### 2. **MULTIPLE_CHOICE** - Trắc nghiệm ✅

-   Questions với 4 options
-   Có explanation cho đáp án
-   **Status: HOẠT ĐỘNG HOÀN HẢO**

#### 3. **SPEECH_RECOGNITION** - Nhận dạng giọng nói 🎤

-   Target text: `"あいうえお"`, `"かきくけこ"`
-   Audio files từ Cloudinary
-   Minimum accuracy: 80%
-   **Status: CÓ AUDIO & TARGET TEXT**

#### 4. **LISTENING** - Bài tập nghe 🔊

-   Audio files với questions
-   Multiple choice format
-   **Status: CÓ AUDIO FILES**

#### 5. **WRITING** - Bài tập viết ✍️

-   Luyện viết ký tự đúng thứ tự nét
-   **Status: CẤU TRÚC SẴN SÀNG**

#### 6. **MATCHING** - Nối từ 🔗

-   Nối âm thanh với ký tự
-   **Status: CẤU TRÚC SẴN SÀNG**

#### 7. **PRONUNCIATION** - Luyện phát âm 🗣️

-   Target audio cho pronunciation
-   Feedback system
-   **Status: CÓ AUDIO FILES**

### 📁 Resources

-   **PDF**: Bảng Hiragana, Worksheet luyện viết
-   **Audio**: Files phát âm chuẩn (MP3)
-   **Flashcards**: Thẻ học Katakana

### 🎁 Course Combos

-   **Combo Hiragana + Katakana**: 450,000 VND (giảm 20%)
-   **Combo N5 Hoàn chỉnh**: 800,000 VND (giảm 25%)

## 🧪 Test Scenarios

### Test Fill-in-the-Blank

1. Vào course "Hiragana hoàn chỉnh"
2. Chọn lesson "Điền ký tự あ段"
3. Tab "Bài tập" → Exercise "Điền ký tự あ段"
4. Điền đáp án vào ô trống: `あ`, `い`, `う`, `え`, `お`
5. Ấn "Kiểm tra đáp án"
6. Ấn "Câu tiếp theo" cho đến hết

### Test Multiple Choice

1. Exercise "Chọn ký tự đúng"
2. Chọn đáp án từ 4 options
3. Xem feedback và explanation

### Test Speech Recognition

1. Exercise "Phát âm あ段"
2. Nói vào microphone: "あいうえお"
3. Hệ thống sẽ so sánh với target text
4. Điểm accuracy hiển thị

### Test Listening

1. Exercise "Nghe âm あ段"
2. Nghe audio file
3. Chọn ký tự đúng từ options

## 🔧 Troubleshooting

### Lỗi Server không chạy

```bash
# Check server status
curl http://localhost:8080/api/test-data/status

# Nếu lỗi, start lại Spring Boot app
cd japanese-learning-platform
mvn spring-boot:run
```

### Lỗi Database connection

```bash
# Check PostgreSQL
sudo service postgresql status

# Start PostgreSQL nếu cần
sudo service postgresql start

# Check database existence
psql -U postgres -l | grep japanese_learning
```

### Lỗi Permission denied cho script

```bash
chmod +x populate_test_data.sh
```

### Clear data khi cần reset

```bash
./populate_test_data.sh clear
./populate_test_data.sh populate
```

## 📝 Development Notes

### Thêm Exercise Type mới

1. Thêm enum trong `Exercise.ExerciseType`
2. Update `TestDataService.createExercises()`
3. Update frontend component handling
4. Update script documentation

### Thêm Questions cho Exercise

1. Sử dụng `createFillInBlankQuestions()` làm template
2. Tạo questions với correct answers
3. Tạo options nếu là multiple choice

### Modify Course Content

1. Edit `TestDataService.createCourses()`
2. Update modules và lessons tương ứng
3. Rebuild và populate lại

## 🎯 Testing Checklist

-   [ ] **FILL_IN_BLANK**: Input fields hiển thị, submit hoạt động
-   [ ] **MULTIPLE_CHOICE**: Options clickable, feedback hiển thị
-   [ ] **SPEECH_RECOGNITION**: Microphone access, audio comparison
-   [ ] **LISTENING**: Audio playback, question answering
-   [ ] **WRITING**: Interface for character writing
-   [ ] **MATCHING**: Drag & drop hoặc click to match
-   [ ] **PRONUNCIATION**: Audio recording, feedback

## 🚀 Production Deployment

Khi deploy production, **XÓA** hoặc **VÔ HIỆU HÓA** test data endpoints:

```java
// Comment out trong TestDataController
// @RestController
// @RequestMapping("/test-data")
```

Hoặc thêm profile restriction:

```java
@Profile("!production")
@RestController
```

---

**📞 Support**: Nếu gặp vấn đề, check logs trong console và database state.

**💡 Tip**: Sử dụng browser DevTools (F12) để xem network requests và console logs khi test exercises.
