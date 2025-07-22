# AI-Powered Compliance Script Generator

 <img src="https://github.com/SameerX64/Compliance-Automation/blob/main/header_image.png" alt="Screenshot" width="1000"/>

 This Project was made under BMC Software's Hackathon organised at Pune Institute of Computer Technology, Pune

A professional compliance script generator that automates the creation of audit and remediation scripts from CIS, DISA, and PCI DSS documentation using AI/ML and template-based generation.

## 🚀 Features

- **Automated PDF Processing**: Extract compliance rules from PDF documents
- **Dual-Mode Script Generation**:
  - AI-powered generation using Google Gemini Pro
  - Template-based generation with customizable templates
- **Multi-Platform Support**:
  - Windows (PowerShell)
  - Linux/Unix (Bash)
- **Built-in Features**:
  - Comprehensive error handling
  - Detailed logging with timestamps
  - Backup and restore functionality
  - Progress tracking
  - Template customization
  - Security best practices

## 🛠️ Technologies Used

- **Backend**: Python 3.9+, Flask
- **AI/ML**: Google Gemini Pro, LangChain, Transformers
- **PDF Processing**: PyMuPDF
- **Template System**: Custom Jinja2-based templates
- **Dependencies**: See `requirements.txt`

## 📁 Project Structure

```
Compliance-Automation/
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── .env                      # Environment configuration (not tracked in git)
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── CIS_Microsoft_Windows_Server_2022_Benchmark_v3.0.0.pdf  # Example benchmark document
├── header_image.png          # UI header image
├── src/                      # Core application code
│   ├── ai/
│   │   └── model.py          # AI model implementation
│   ├── api/
│   │   └── routes.py         # API endpoints
│   ├── models/
│   │   └── compliance.py     # Data models
│   └── templates/            # Script templates
│       ├── windows/
│       │   └── powershell/
│       │       ├── audit_template.txt
│       │       ├── remediation_template.txt
│       │       └── functions.json
│       └── linux/
│           ├── shell/        # Shell script templates
│           └── bash/
│               ├── audit_template.txt
│               ├── remediation_template.txt
│               └── functions.json
├── static/                   # Static assets for web interface
│   ├── main.js               # Frontend JavaScript
│   └── styles.css            # CSS styles
├── templates/                # Flask HTML templates
│   └── index.html            # Main application interface
└── uploads/                  # Document upload directory
    └── CIS_Microsoft_Windows_Server_2022_Benchmark_v3.0.0.pdf  # Uploaded benchmark
```

## ⚙️ Setup and Installation

### Prerequisites
- Python 3.9 or higher
- Google Gemini API key (Get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/SameerX64/Compliance-Automation.git
cd Compliance-Automation
```

2. **Create and activate a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
```bash
# Create and edit the .env file with your settings:
# GOOGLE_API_KEY=your_gemini_api_key_here
```

5. **Run the application:**
```bash
python app.py
```

The server will start on `http://localhost:5000`

## 🔧 Configuration

### Environment Variables (.env)
```properties
GOOGLE_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
FLASK_DEBUG=1
MODEL_PATH=microsoft/codebert-base
GENERATION_CONFIG={"temperature":0.3,"top_p":0.9,"top_k":40}
MAX_OUTPUT_TOKENS=2048
SAFETY_SETTINGS={"HARASSMENT":"block_none","HATE_SPEECH":"block_none","DANGEROUS_CONTENT":"block_none"}
LOG_LEVEL=INFO
```

## 📋 Version Control

### .gitignore Configuration

The project includes a comprehensive `.gitignore` file that excludes:

- Python bytecode and cache files
- Virtual environment directories
- Environment configuration files (.env)
- User uploads (except for examples)
- OS-specific files
- IDE settings
- Logs and temporary files

This ensures that sensitive information and unnecessary files aren't committed to the repository.

## 📝 Usage

### 1. Web Interface

1. Open your browser and navigate to `http://localhost:5000`
2. Upload a compliance document (PDF format)
3. Select policies from the extracted list
4. Choose:
   - Script type: Audit or Remediation
   - Operating System: Windows or Linux
   - Generation mode: AI-powered or Template-based
5. Generate and download your compliance script

### 2. API Usage

#### Upload Document
```bash
curl -X POST \
  -F "file=@your_compliance_doc.pdf" \
  http://localhost:5000/upload
```

#### Generate Script
```bash
curl -X POST http://localhost:5000/generate_script \
  -H "Content-Type: application/json" \
  -d '{
    "policy": "1.1.1 (L1) Ensure Maximum password age is set to 60 or fewer days",
    "auditRemediation": "audit",
    "os": "windows",
    "useAI": true,
    "remediationSteps": "Optional remediation steps"
  }'
```

## 🎯 Template System

The application includes a flexible template system for both Windows and Linux scripts:

### Windows Templates
- `/src/templates/windows/powershell/audit_template.txt`
- `/src/templates/windows/powershell/remediation_template.txt`
- `/src/templates/windows/powershell/functions.json`

### Linux Templates
- `/src/templates/linux/bash/audit_template.txt`
- `/src/templates/linux/bash/remediation_template.txt`
- `/src/templates/linux/bash/functions.json`

### Template Features
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Timestamped logging with different levels
- **Backup/Restore**: Automatic backup before changes
- **Validation**: Input and configuration validation
- **Customizable**: Easy to modify for your organization's needs

## 📚 API Documentation

### POST /upload

Upload a compliance document for analysis.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (PDF document)

**Response:**
```json
{
    "policies": ["List of extracted policies"],
    "remediationPaths": ["List of remediation steps"],
    "analysis": "AI analysis of the document"
}
```

### POST /generate_script

Generate a compliance script.

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
    "policy": "Policy text",
    "auditRemediation": "audit|remediation",
    "os": "windows|linux",
    "useAI": true|false,
    "remediationSteps": "Optional remediation steps"
}
```

**Response:**
```json
{
    "script": "Generated script content"
}
```

## 🔧 Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/

# Run with coverage
pytest --cov=src tests/
```

### Code Formatting
```bash
# Format code
black .

# Check code style
flake8 .
```

### Adding New Templates
1. Create template files in `src/templates/{platform}/{shell}/`
2. Update the template loader in `src/ai/model.py`
3. Test with different compliance rules

## 🐛 Troubleshooting

### Common Issues

1. **Package Installation Errors**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt --no-cache-dir
   ```

2. **API Key Issues**:
   - Ensure your Gemini API key is valid
   - Check `.env` file configuration
   - Verify API key permissions

3. **Template Loading Errors**:
   - Check file paths in `src/templates/`
   - Verify file permissions
   - Ensure templates directory structure is correct

4. **Memory Issues with Large PDFs**:
   - Increase system memory allocation
   - Process PDFs in smaller chunks
   - Use more efficient PDF processing

### Development Guidelines
- Follow PEP 8 style guidelines
- Add tests for new features
- Update documentation
- Ensure backward compatibility

## 🙏 Acknowledgments

- Google Gemini Pro for AI capabilities
- LangChain for AI orchestration
- PyMuPDF for PDF processing
- Flask for web framework
- Open source community for inspiration
---


