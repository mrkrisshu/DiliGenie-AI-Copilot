@echo off
REM Quick Setup Script for Jarvis AI Assistant (Windows)
REM This script helps set up the project quickly for demos

echo.
echo 🤖 Jarvis AI Assistant - Quick Setup Script
echo ============================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)
node -v
echo ✅ Node.js found
echo.

REM Check Python
echo Checking Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)
python --version
echo ✅ Python found
echo.

REM Install Node dependencies
echo 📦 Installing Node.js dependencies...
call npm install
echo.

REM Check for .env
if not exist .env (
    echo ⚠️  No .env file found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env and add your API keys:
    echo    - OPENROUTER_API_KEY
    echo    - PINECONE_API_KEY
    echo.
    pause
)

REM Install Python dependencies
echo 🐍 Installing Python dependencies...
cd scripts
pip install -r requirements.txt
cd ..
echo.

REM Ingest sample documents
set /p INGEST="📚 Ingest sample documents now? (y/n): "
if /i "%INGEST%"=="y" (
    echo Ingesting sample documents...
    python scripts\ingest.py --jsonl docs\sample_docs.jsonl
    echo ✅ Sample documents ingested!
)
echo.

echo ✅ Setup complete!
echo.
echo 🚀 To start the development server, run:
echo    npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo 📖 For more info, see README.md
echo.
pause
