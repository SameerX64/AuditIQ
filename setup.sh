#!/bin/bash

# AI/ML Compliance Management System Setup Script

echo "🚀 Setting up AI/ML Compliance Management System..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo ❌ "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo ❌ "Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v mongod >/dev/null 2>&1 || { echo ❌ "MongoDB is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Function to setup service
setup_service() {
    local service_name=$1
    local service_dir=$2
    local setup_command=$3
    
    echo "📦 Setting up $service_name..."
    cd "$service_dir" || exit 1
    
    if [ -f ".env.example" ]; then
        if [ ! -f ".env" ]; then
            cp .env.example .env
            echo "📝 Created .env file for $service_name (please configure it)"
        fi
    fi
    
    eval "$setup_command"
    
    if [ $? -eq 0 ]; then
        echo "✅ $service_name setup completed"
    else
        echo "❌ $service_name setup failed"
        exit 1
    fi
    
    cd ..
}

# Setup AI/ML Service
setup_service "AI/ML Service" "ai-ml-service" "python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"

# Setup Backend
setup_service "Backend" "backend" "npm install"

# Setup Frontend  
setup_service "Frontend" "frontend" "npm install"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in each service's .env file"
echo "2. Start MongoDB: mongod"
echo "3. Start AI/ML service: cd ai-ml-service && source venv/bin/activate && python app.py"
echo "4. Start Backend: cd backend && npm run dev"
echo "5. Start Frontend: cd frontend && npm start"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📚 API Documentation: http://localhost:5000"
echo "🤖 AI Service: http://localhost:5001"
echo ""
echo "⚠️  Don't forget to:"
echo "   - Add your Google Gemini API key to ai-ml-service/.env"
echo "   - Configure MongoDB URI in backend/.env"
echo "   - Update other environment variables as needed"
