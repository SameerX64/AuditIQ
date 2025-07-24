# 🎯 Getting Started Guide for First-Time Users

Welcome! This guide will help you run the AI/ML Compliance Management System for the first time.

## ⏰ Quick Start (5 minutes)

### Step 1: Prerequisites Check
Make sure you have these installed:
- ✅ **Node.js** (v16+) - [Download here](https://nodejs.org/)
- ✅ **Python** (v3.8+) - [Download here](https://python.org/)  
- ✅ **MongoDB** - [Install locally](https://www.mongodb.com/try/download/community) OR [Use MongoDB Atlas (free)](https://www.mongodb.com/atlas)
- ✅ **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)

### Step 2: Simple Setup
```bash
# Navigate to the project folder
cd final

# Run the automated setup (this installs everything)
./setup.sh

# Start all services with one command
./start-dev.sh
```

### Step 3: Configure API Keys
Edit these files with your API keys:
```bash
# Add your Google API key here:
nano ai-ml-service/.env

# Add MongoDB connection here:
nano backend/.env
```

### Step 4: Open Your Browser
Go to: **http://localhost:3000**

## 🔧 Manual Setup (If automated setup fails)

### Terminal 1: AI/ML Service
```bash
cd ai-ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add: GOOGLE_API_KEY=your_api_key_here
python app.py
```

### Terminal 2: Backend API
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and configure MongoDB_URI
npm run dev
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
npm start
```

## 🎯 What You'll See

1. **Login Page** - Register a new account first
2. **Dashboard** - Overview of your compliance activities
3. **Upload Document** - Drop a PDF compliance document here
4. **Generate Script** - Create Windows/Linux audit scripts
5. **Script Library** - View and manage your generated scripts

## 🆘 Common Issues & Solutions

### "MongoDB connection failed"
- **Local MongoDB**: Make sure MongoDB service is running
- **MongoDB Atlas**: Use your Atlas connection string in `backend/.env`

### "Google API key invalid"
- Get a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Make sure you've enabled the Gemini API
- Check that the key is properly set in `ai-ml-service/.env`

### "npm install failed"
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Python virtual environment failed"
```bash
# Try with python3 explicitly
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

### Ports already in use
If you get port errors, make sure nothing else is running on:
- Port 3000 (Frontend)
- Port 5000 (Backend)  
- Port 5001 (AI Service)

## 📱 Test the Application

1. **Register** a new user account
2. **Upload** a PDF compliance document (like CIS benchmarks)
3. **Generate** an audit script for Windows or Linux
4. **View** your scripts in the Script Library

## 🔗 Important URLs

- **Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:5001/health

## 📞 Need More Help?

- Check the detailed [README.md](README.md) file
- Look at the troubleshooting section
- Verify all three services are running in separate terminals

## 🎉 Success!

Once you see the login page at http://localhost:3000, you're ready to go! 

Create an account and start uploading compliance documents to see the AI-powered script generation in action.
