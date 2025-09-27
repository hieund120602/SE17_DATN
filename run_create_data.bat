@echo off
REM ================================================
REM SCRIPT TẠO DỮ LIỆU TEST CHO WINDOWS
REM ================================================

echo 🚀 Tạo dữ liệu test cho hệ thống E-Learning
echo ==========================================

REM Check if Spring Boot is running
echo 🔍 Kiểm tra server Spring Boot...
curl -s --max-time 3 "http://localhost:8080/api/courses" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server đang chạy!
) else (
    echo ❌ Server không chạy!
    echo 💡 Vui lòng start Spring Boot trước:
    echo    mvn spring-boot:run
    pause
    exit /b 1
)

REM Check if SQL file exists
if not exist "create_simple_test_data.sql" (
    echo ❌ Không tìm thấy file create_simple_test_data.sql
    pause
    exit /b 1
)

echo.
echo 🛠️ Tạo dữ liệu test...
echo Sẽ tạo:
echo   • 6 users (4 tutors, 1 admin, 1 student)
echo   • 5 courses: Hiragana, Katakana, Kanji, Ngữ pháp N5, Từ vựng N5
echo   • Modules, lessons, exercises với FILL_IN_BLANK và MULTIPLE_CHOICE
echo   • Questions và options cho bài tập
echo.

echo 💡 CÁCH TẠO DỮ LIỆU TRÊN WINDOWS:
echo.
echo 1. Dùng pgAdmin (Recommended):
echo    - Mở pgAdmin
echo    - Connect đến database 'japanese_learning_db'
echo    - Tools -^> Query Tool
echo    - Copy toàn bộ nội dung file create_simple_test_data.sql
echo    - Paste vào Query Tool và Execute
echo.
echo 2. Dùng DBeaver:
echo    - Connect đến PostgreSQL database
echo    - New SQL Script
echo    - Copy nội dung file create_simple_test_data.sql
echo    - Execute script
echo.
echo 3. Dùng IntelliJ IDEA/VSCode:
echo    - Install database plugin
echo    - Connect đến database
echo    - Open file create_simple_test_data.sql
echo    - Execute script
echo.
echo 4. Command line (nếu có psql):
echo    psql -h localhost -U your_username -d japanese_learning_db -f create_simple_test_data.sql
echo.

set /p "continue=Đã hiểu? Press Enter để xem file SQL..."
echo.

echo 📄 File SQL location: %cd%\create_simple_test_data.sql
echo.
echo 🎯 AFTER RUNNING SQL, bạn sẽ có:
echo   • 4 tutors với password: password123
echo     - akiko@example.com
echo     - hiroshi@example.com  
echo     - yuki@example.com
echo     - kenji@example.com
echo   • 1 admin: admin@example.com (password: password123)
echo   • 1 student: student@example.com (password: password123)
echo   • 5 courses với modules và lessons
echo   • Exercises: FILL_IN_BLANK và MULTIPLE_CHOICE
echo.
echo 🎉 Sau đó test tại:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8080
echo.

REM Open the SQL file with default text editor
set /p "open=Mở file SQL ngay? (y/N): "
if /i "%open%"=="y" (
    start notepad create_simple_test_data.sql
)

pause 