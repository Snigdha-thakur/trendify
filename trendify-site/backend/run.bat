@echo off
REM Trendify Backend Startup Script for Windows

echo Starting Trendify Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo Please update .env.local with your configuration
)

REM Start the server
echo Starting FastAPI server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
