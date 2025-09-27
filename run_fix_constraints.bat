@echo off
echo ========================================
echo Fixing Payment Constraints
echo ========================================

REM Set database connection parameters
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=japanese_learning_platform
set DB_USER=postgres
set DB_PASSWORD=postgres

echo.
echo Connecting to database: %DB_NAME%
echo.

REM Run the SQL fix script
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f fix_payment_constraints.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Payment constraints fixed successfully!
    echo ========================================
    echo.
    echo Updated constraints:
    echo - method: VNPAY, CREDIT_CARD, BANK_TRANSFER, QR_TRANSFER
    echo - status: PENDING, COMPLETED, FAILED, CANCELED, WAITING_CONFIRMATION, REJECTED
    echo.
    echo Now you can create QR transfer payments without constraint errors.
    echo.
) else (
    echo.
    echo ========================================
    echo Error fixing payment constraints!
    echo ========================================
    echo.
    echo Please check:
    echo 1. Database connection parameters
    echo 2. Database permissions
    echo 3. SQL script syntax
    echo 4. Make sure PostgreSQL is running
    echo.
)

pause 