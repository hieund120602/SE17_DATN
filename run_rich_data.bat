@echo off
echo ==========================================
echo CREATING RICH TEST DATA WITH DIVERSE EXERCISES
echo ==========================================
echo.
echo Tao du lieu phong phu bao gom:
echo.
echo 📚 COURSES:
echo   - Hiragana Master Course (199k VND)
echo   - Katakana Expert Course (179k VND)
echo.
echo 🎯 EXERCISE TYPES (6 loai):
echo   1. FILL_IN_BLANK     - Dien cho trong
echo   2. MULTIPLE_CHOICE   - Trac nghiem
echo   3. SPEAKING          - Luyen noi  
echo   4. PRONUNCIATION     - Luyen phat am
echo   5. LISTENING         - Nghe hieu
echo   6. WRITING           - Luyen viet
echo.
echo 👥 USERS:
echo   - Tutor: tanaka@test.com
echo   - Student: student@test.com  
echo   - Password: password123 (cho tat ca)
echo.
echo Dang chay script...
echo.

REM Run the rich SQL script using pgAdmin or command line
echo OPTION 1: Copy file path va chay trong pgAdmin
echo File path: %CD%\quick_rich_data.sql
echo.
echo OPTION 2: Neu co psql command line:
psql -h localhost -p 5432 -U postgres -d japanese_learning -f quick_rich_data.sql

echo.
echo ==========================================
echo 🎉 RICH TEST DATA CREATED SUCCESSFULLY! 🎉
echo ==========================================
echo.
echo 🔑 LOGIN CREDENTIALS:
echo Email: student@test.com
echo Password: password123
echo.
echo 📖 TEST EXERCISES:
echo Sau khi login, ban co the test cac loai bai tap:
echo   ✅ Fill-in-blank exercises (dien chu cai)
echo   ✅ Multiple choice questions (chon dap an)
echo   ✅ Speaking exercises (luyen noi)
echo   ✅ Pronunciation exercises (luyen phat am)
echo   ✅ Listening exercises (nghe va tra loi)
echo   ✅ Writing exercises (luyen viet)
echo.
echo 🚀 NEXT STEPS:
echo 1. Khoi dong Spring Boot: mvn spring-boot:run
echo 2. Khoi dong Frontend: npm run dev  
echo 3. Login va test cac loai bai tap!
echo.
pause 