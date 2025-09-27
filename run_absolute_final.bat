@echo off
echo ================================
echo RUNNING ABSOLUTE FINAL DATA SCRIPT
echo ================================

echo.
echo Dang chay script create_absolute_final_data.sql...
echo.

REM Chay script SQL
psql -h localhost -p 5432 -U postgres -d japanese_learning -f create_absolute_final_data.sql

echo.
echo ================================
echo HOAN THANH!
echo ================================
echo.
echo Test login:
echo Email: abs_student@test.com
echo Password: password123
echo.
echo Hay khoi dong Spring Boot (port 8082) va test frontend!
echo.
pause 