@echo off
echo ==========================================
echo CREATING COMPREHENSIVE TEST DATA
echo ==========================================
echo.
echo Tao du lieu test phong phu:
echo - 5 Courses da dang (Hiragana, Katakana, Kanji, Conversation, JLPT N5)
echo - 6 loai bai tap: Fill-in-blank, Multiple Choice, Speech, True/False, Listening, Reading  
echo - 3 Tutors va 3 Students
echo - Questions va Options da day du
echo.
echo Dang chay script...

REM Run the comprehensive SQL script
psql -h localhost -p 5432 -U postgres -d japanese_learning -f create_comprehensive_test_data.sql

echo.
echo ==========================================
echo HOAN THANH DATA PHONG PHU!
echo ==========================================
echo.
echo LOGIN CREDENTIALS:
echo.
echo TUTORS:
echo - tanaka@jplearn.com / password123
echo - yamada@jplearn.com / password123  
echo - sato@jplearn.com / password123
echo.
echo STUDENTS:
echo - student1@test.com / password123
echo - student2@test.com / password123
echo - student3@test.com / password123
echo.
echo COURSES DA TAO:
echo 1. Hiragana Co Ban (199k VND)
echo 2. Katakana Master (179k VND)
echo 3. Kanji Co Ban (299k VND)
echo 4. Hoi Thoai Co Ban (249k VND)
echo 5. Luyen Thi JLPT N5 (399k VND)
echo.
echo EXERCISE TYPES:
echo - FILL_IN_BLANK (Dien cho trong)
echo - MULTIPLE_CHOICE (Trac nghiem)
echo - SPEECH (Phat am)
echo - TRUE_FALSE (Dung/Sai)
echo - LISTENING (Nghe hieu)
echo - READING (Doc hieu)
echo.
echo Hay khoi dong Spring Boot (port 8082) va test!
echo.
pause 