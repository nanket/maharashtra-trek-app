@echo off
REM Windows batch file to run the folder organizer
REM Usage: organize.bat [--dry-run] [--folder "path"]

echo Starting Multi-Folder File Organizer...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Run the organizer with all arguments passed through
python "%~dp0organize_folders.py" %*

REM Pause only if no arguments were provided (interactive mode)
if "%~1"=="" pause
