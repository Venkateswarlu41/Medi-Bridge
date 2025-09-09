@echo off
echo ========================================
echo    HYGEIA-NEXUS SETUP AND RUN SCRIPT
echo ========================================
echo.

echo [1/5] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Installing Backend dependencies...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/5] Installing Frontend dependencies...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [4/5] Seeding database with sample data...
cd ..\Backend
call npm run seed
if %errorlevel% neq 0 (
    echo Warning: Database seeding failed. You can run it manually later with: cd Backend && npm run seed
)

echo.
echo [5/5] Setup completed successfully!
echo.
echo ========================================
echo    STARTING DEVELOPMENT SERVERS
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.
echo LOGIN CREDENTIALS:
echo Admin: admin@example.com / password123
echo Doctor: doctor@example.com / password123
echo Patient: patient@example.com / password123
echo Lab Tech: lab@example.com / password123
echo.
echo Press Ctrl+C to stop the servers
echo.

cd ..
call npm run dev

pause