@echo off
echo ========================================
echo Updating Payment Schema for QR Transfer
echo ========================================

REM Set database connection parameters
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=japanese_learning_platform
set DB_USER=root
set DB_PASSWORD=

echo.
echo Connecting to database: %DB_NAME%
echo.

REM Run the SQL update script
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < update_payment_schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Database schema updated successfully!
    echo ========================================
    echo.
    echo New columns added to payments table:
    echo - qr_code_url
    echo - bank_account_info  
    echo - admin_notes
    echo - admin_processed_at
    echo - processed_by_admin_id
    echo.
    echo New payment statuses:
    echo - WAITING_CONFIRMATION
    echo - REJECTED
    echo.
    echo New payment method:
    echo - QR_TRANSFER
    echo.
) else (
    echo.
    echo ========================================
    echo Error updating database schema!
    echo ========================================
    echo.
    echo Please check:
    echo 1. Database connection parameters
    echo 2. Database permissions
    echo 3. SQL script syntax
    echo.
)

pause 