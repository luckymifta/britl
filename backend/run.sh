#!/bin/bash

# Development server run script

echo "🚀 Starting FastAPI CMS Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Start the development server
echo "🌐 Server starting at http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo "📘 ReDoc: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
