#!/bin/bash

# First-Time User Startup Script
# This script helps first-time users start all services easily

echo "🎯 Starting AI/ML Compliance Management System..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the 'final' directory"
    echo "   cd /path/to/final"
    echo "   ./start-dev.sh"
    exit 1
fi

# Function to check if a service is running
check_service() {
    local port=$1
    local service_name=$2
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "✅ $service_name is running on port $port"
        return 0
    else
        echo "❌ $service_name is not responding on port $port"
        return 1
    fi
}

# Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Python
if command -v python3 >/dev/null 2>&1; then
    echo "✅ Python found: $(python3 --version)"
elif command -v python >/dev/null 2>&1; then
    echo "✅ Python found: $(python --version)"
else
    echo "❌ Python not found. Please install Python from https://python.org/"
    exit 1
fi

# Check MongoDB
if command -v mongod >/dev/null 2>&1; then
    echo "✅ MongoDB found"
else
    echo "⚠️  MongoDB not found locally. Make sure you have:"
    echo "   - MongoDB installed and running, OR"
    echo "   - MongoDB Atlas connection string in backend/.env"
fi

echo ""
echo "🚀 Starting services..."
echo "This will open 3 terminal windows for each service"
echo ""

# Function to start service in new terminal
start_service() {
    local service_dir=$1
    local service_name=$2
    local start_command=$3
    local port=$4
    
    echo "📦 Starting $service_name..."
    
    # Check if gnome-terminal is available (Linux)
    if command -v gnome-terminal >/dev/null 2>&1; then
        gnome-terminal --title="$service_name" -- bash -c "cd $service_dir && $start_command; exec bash"
    # Check if osascript is available (macOS)
    elif command -v osascript >/dev/null 2>&1; then
        osascript -e "tell application \"Terminal\" to do script \"cd $(pwd)/$service_dir && $start_command\""
    # Fallback for other systems
    else
        echo "🔧 Please open a new terminal and run:"
        echo "   cd $service_dir"
        echo "   $start_command"
        echo ""
        read -p "Press Enter when you've started $service_name..."
    fi
    
    # Wait a moment for service to start
    sleep 3
    
    # Check if service is running
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if check_service $port "$service_name"; then
            break
        fi
        
        echo "⏳ Waiting for $service_name to start (attempt $attempt/$max_attempts)..."
        sleep 2
        attempt=$((attempt + 1))
    done
}

# Check if environment files exist
echo "📋 Checking configuration files..."

# Check AI/ML service config
if [ ! -f "ai-ml-service/.env" ]; then
    echo "⚠️  AI/ML service .env file not found"
    echo "   Copying from .env.example..."
    cp ai-ml-service/.env.example ai-ml-service/.env
    echo "   ⚠️  Please edit ai-ml-service/.env and add your Google API key!"
fi

# Check backend config
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found"
    echo "   Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "   ⚠️  Please edit backend/.env and configure MongoDB URI!"
fi

# Check frontend config
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found"
    echo "   Copying from .env.example..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "🚀 Starting all services..."

# Start AI/ML Service
start_service "ai-ml-service" "AI/ML Service" "source venv/bin/activate && python app.py" 5001

# Start Backend
start_service "backend" "Backend API" "npm run dev" 5000

# Start Frontend
start_service "frontend" "React Frontend" "npm start" 3000

echo ""
echo "🎉 All services should now be starting!"
echo ""
echo "📱 Access the application:"
echo "   🌐 Frontend:     http://localhost:3000"
echo "   🔧 Backend API:  http://localhost:5000"
echo "   🤖 AI Service:   http://localhost:5001"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Register a new account"
echo "   3. Upload a compliance document to test"
echo "   4. Generate some scripts!"
echo ""
echo "❓ If something isn't working:"
echo "   • Check that all three terminal windows opened"
echo "   • Verify environment variables in .env files"
echo "   • Make sure MongoDB is running"
echo "   • Check the individual terminal windows for error messages"
echo ""
echo "🆘 Need help? Check the README.md file for detailed instructions"
