#!/bin/bash
# Shell script to run the folder organizer on macOS/Linux
# Usage: ./organize.sh [--dry-run] [--folder "path"]

echo "Starting Multi-Folder File Organizer..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "Error: Python is not installed"
        echo "Please install Python from https://python.org"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the organizer with all arguments passed through
$PYTHON_CMD "$SCRIPT_DIR/organize_folders.py" "$@"
