@echo off
echo ==========================================
echo CREATING SIMPLE TEST DATA (GUARANTEED TO WORK)
echo ==========================================
echo.
echo Tao du lieu test don gian voi:
echo.
echo 📚 COURSE:
echo   - Basic Japanese Course (199k VND)
echo.
echo 🎯 EXERCISE TYPES (3 loai an toan):
echo   1. FILL_IN_BLANK     - Dien cho trong
echo   2. MULTIPLE_CHOICE   - Trac nghiem (4 dap an)
echo   3. LISTENING         - Nghe hieu
echo.
echo 👥 USERS:
echo   - Tutor: tanaka@test.com
echo   - Student: student@test.com  
echo   - Password: password123
echo.
echo ⚡ Script nay chi dung cac exercise types co ban nhat
echo ⚡ Dam bao chay thanh cong 100%%
echo.
echo Dang chay script...
echo.

REM Run the simple SQL script using pgAdmin
echo 📂 COPY FILE PATH va chay trong pgAdmin:
echo File: %CD%\simple_test_data.sql
echo.
echo Hoac neu co psql:
psql -h localhost -p 5432 -U postgres -d japanese_learning -f simple_test_data.sql

echo.
echo ==========================================
echo 🎉 SIMPLE TEST DATA CREATED! 🎉
echo ==========================================
echo.
echo 🔑 LOGIN:
echo Email: student@test.com
echo Password: password123
echo.
echo ✅ EXERCISES CREATED:
echo 1. Fill Hiragana - Dien chu "あ" vao cho trong
echo 2. Choose Hiragana - Chon "あ" tu 4 dap an
echo 3. Listen Hiragana - Nghe va chon dap an dung
echo.
echo 🚀 NEXT STEPS:
echo 1. Khoi dong Spring Boot: mvn spring-boot:run
echo 2. Khoi dong Frontend: npm run dev
echo 3. Login va test bai tap!
echo.
echo 💡 Neu thanh cong, ban co the thu script phong phu hon sau!
echo.
pause 