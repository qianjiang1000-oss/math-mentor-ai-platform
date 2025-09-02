@echo off
REM Math Mentor AI Setup Script for Windows

echo 🚀 Setting up Math Mentor AI...
echo ==================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed. Please install Python 3.8 or higher.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed. Please install Node.js 16 or higher.
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
    if %%a lss 3 (
        echo ❌ Python 3.8 or higher is required. Found Python %PYTHON_VERSION%
        exit /b 1
    )
    if %%a equ 3 if %%b lss 8 (
        echo ❌ Python 3.8 or higher is required. Found Python %PYTHON_VERSION%
        exit /b 1
    )
)

REM Check Node.js version
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:~1%
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do (
    if %%i lss 16 (
        echo ❌ Node.js 16 or higher is required. Found Node.js %NODE_VERSION%
        exit /b 1
    )
)

echo ✅ Found Python %PYTHON_VERSION%
echo ✅ Found Node.js v%NODE_VERSION%

REM Create necessary directories
mkdir ..\logs 2>nul
mkdir ..\backups 2>nul
mkdir ..\database 2>nul
echo ✅ Created necessary directories

REM Create virtual environment
echo 📦 Creating Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ⚠️ Virtual environment already exists
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install --upgrade pip
pip install -r ..\backend\requirements.txt
echo ✅ Python dependencies installed

REM Initialize database
echo 🗄️ Initializing database...
cd ..\database
python init_database.py
if errorlevel 1 (
    echo ❌ Database initialization failed
    exit /b 1
)
echo ✅ Database initialized successfully
cd ..\scripts

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
cd ..\frontend
npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    exit /b 1
)
echo ✅ Node.js dependencies installed
cd ..\scripts

REM Create environment files
echo ⚙️ Creating environment files...
cd ..

REM Create backend .env if it doesn't exist
if not exist backend\.env (
    (
        echo # Flask Configuration
        echo FLASK_ENV=development
        echo PORT=5000
        echo SECRET_KEY=math-mentor-ai-secret-key-change-in-production
        echo JWT_SECRET_KEY=jwt-secret-key-change-in-production
        echo.
        echo # Database
        echo DATABASE_URL=sqlite:///../database/math_tutor.db
        echo.
        echo # CORS
        echo CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
        echo.
        echo # Model Configuration
        echo MODEL_PATH=./models
        echo VOCAB_SIZE=10000
        echo MAX_SEQUENCE_LENGTH=128
        echo EMBEDDING_DIM=128
        echo.
        echo # Training
        echo TRAINING_EPOCHS=100
        echo BATCH_SIZE=32
        echo VALIDATION_SPLIT=0.2
    ) > backend\.env
    echo ✅ Backend environment file created
) else (
    echo ⚠️ Backend environment file already exists
)

REM Create frontend .env if it doesn't exist
if not exist frontend\.env (
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
        echo REACT_APP_WS_URL=http://localhost:5000
        echo REACT_APP_VERSION=2.0.0
        echo GENERATE_SOURCEMAP=false
    ) > frontend\.env
    echo ✅ Frontend environment file created
) else (
    echo ⚠️ Frontend environment file already exists
)

cd scripts

echo ✅ Setup completed successfully!
echo.
echo 🎉 Everything is ready! Next steps:
echo.
echo 1. Activate virtual environment:
echo    venv\Scripts\activate.bat
echo.
echo 2. Start the backend server:
echo    cd ..\backend && python app.py
echo.
echo 3. Start the frontend development server:
echo    cd ..\frontend && npm start
echo.
echo 4. Open your browser and navigate to:
echo    http://localhost:3000
echo.
echo 5. Login with default credentials:
echo    Email: admin@mathmentor.ai
echo    Password: admin123
echo.
echo For production deployment, see docs\DEPLOYMENT.md