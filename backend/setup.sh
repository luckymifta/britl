#!/bin/bash

# Setup script for FastAPI CMS Backend

echo "🚀 Setting up FastAPI CMS Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

echo "✅ Setup completed successfully!"
echo ""
echo "To start the development server:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run the server: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "API Documentation will be available at:"
echo "- Swagger UI: http://localhost:8000/docs"
echo "- ReDoc: http://localhost:8000/redoc"
