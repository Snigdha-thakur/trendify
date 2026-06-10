@echo off
echo Starting Trendify Backend...

REM Check if .env.local exists
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo Please update .env.local with your configuration
)

REM Start the server
echo Starting FastAPI server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause