# Troubleshooting Guide

## Common Issues and Solutions

### 1. Services Not Starting

#### Backend Port 5000 Already in Use
```bash
# Find and kill process using port 5000
sudo lsof -t -i tcp:5000 | xargs kill -9

# Or use a different port in backend/.env
PORT=5001
```

#### Frontend Port 3000 Already in Use
```bash
# Kill process on port 3000
sudo lsof -t -i tcp:3000 | xargs kill -9

# Or start on different port
PORT=3001 npm start
```

#### AI Service Port 5001 Already in Use
```bash
# Kill Python process on port 5001
sudo lsof -t -i tcp:5001 | xargs kill -9
```

### 2. Database Connection Issues

#### MongoDB Atlas Connection Failed
- Check `.env` file in backend folder
- Verify `MONGODB_URI` is correct
- Ensure IP whitelist includes your IP (0.0.0.0/0 for development)
- Check MongoDB Atlas cluster is running

#### Example MongoDB URI format:
```
MONGODB_URI= ENTER YOUR MONDODB CONNECTION STRING HERE-------------------------------
```

### 3. Dependencies Issues

#### Node.js Dependencies
```bash
# Clear npm cache and reinstall
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Python Dependencies
```bash
cd ai-ml-service
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Authentication Issues

#### JWT Token Invalid
- Check `JWT_SECRET` in backend `.env`
- Clear browser localStorage and login again
- Ensure token is being sent in Authorization header

#### CORS Errors
- Check frontend is running on port 3000
- Verify backend CORS configuration allows frontend origin
- Check browser console for specific CORS errors

### 5. File Upload Issues

#### Document Upload Fails
- Check file size (should be < 50MB)
- Ensure file is PDF format
- Check AI service is running on port 5001
- Verify uploads folder exists in ai-ml-service

#### Permission Denied
```bash
# Fix upload folder permissions
chmod 755 ai-ml-service/uploads
```

### 6. Environment Variables

#### Missing .env Files
Create `.env` files in each service directory:

**Backend .env:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
AI_SERVICE_URL=http://localhost:5001
```

**Frontend .env:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:5001
```

**AI Service .env:**
```env
FLASK_ENV=development
FLASK_APP=app_simple.py
```

### 7. Script Generation Issues

#### AI Service Not Responding
- Check AI service console for errors
- Restart AI service: `python app_simple.py`
- Verify Flask dependencies are installed

#### Script Generation Fails
- Check request format matches API documentation
- Verify requirements array is not empty
- Check os_type is 'windows' or 'linux'

### 8. Development Mode Issues

#### Hot Reload Not Working
```bash
# Frontend
cd frontend
rm -rf node_modules/.cache
npm start

# Backend 
cd backend
npm run dev
```

#### Console Errors
- Check browser Developer Tools console
- Check terminal output for each service
- Enable debug mode: `DEBUG=* npm run dev` (backend)

### 9. Performance Issues

#### Slow Document Processing
- AI service uses simplified processing for development
- Large PDF files may take longer to process
- Check available system memory

#### Database Queries Slow
- Ensure MongoDB Atlas cluster is in same region
- Check network connection
- Consider upgrading Atlas cluster tier

### 10. Production Build Issues

#### Frontend Build Fails
```bash
cd frontend
npm run build
```
- Check for TypeScript/ESLint errors
- Verify all dependencies are installed
- Check environment variables are set

## Getting Help

1. Check service logs in terminal windows
2. Verify all three services are running
3. Test API endpoints directly with curl/Postman
4. Check browser Developer Tools for frontend issues
5. Verify database connection in MongoDB Atlas dashboard

## Quick Reset

If all else fails, complete reset:
```bash
# Stop all services (Ctrl+C in terminals)

# Reset backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Reset frontend  
cd ../frontend
rm -rf node_modules package-lock.json
npm install

# Reset AI service
cd ../ai-ml-service
pip install -r requirements.txt

# Restart all services
./start-dev.sh
```
