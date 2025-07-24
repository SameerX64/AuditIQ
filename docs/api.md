# API Documentation

## Base URLs
- **Backend API**: `http://localhost:5000`
- **AI Service**: `http://localhost:5001`

## Authentication

### Register User
**POST** `/api/auth/register`

```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "role": "user|auditor|manager|admin"
}
```

### Login User  
**POST** `/api/auth/login`

```json
{
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string", 
    "role": "string"
  }
}
```

## Document Management

### Upload Document
**POST** `/api/compliance/upload-document`

Headers: `Authorization: Bearer <token>`
Content-Type: `multipart/form-data`

Form Data:
- `file`: PDF file

Response:
```json
{
  "success": true,
  "documentId": "string",
  "analysis": {
    "framework": "CIS|NIST|ISO27001|SOX",
    "requirements": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "risk_level": "Low|Medium|High|Critical",
        "category": "string"
      }
    ]
  }
}
```

### Get User Documents
**GET** `/api/compliance/documents`

Headers: `Authorization: Bearer <token>`

## Script Generation

### Generate Script
**POST** `/api/compliance/generate-script`

Headers: `Authorization: Bearer <token>`

```json
{
  "requirements": ["requirement_id_1", "requirement_id_2"],
  "script_type": "audit|remediation",
  "os_type": "windows|linux"
}
```

Response:
```json
{
  "success": true,
  "script": "string",
  "script_type": "string",
  "os_type": "string"
}
```

### Validate Script
**POST** `/api/compliance/validate-script`

Headers: `Authorization: Bearer <token>`

```json
{
  "script": "string",
  "os_type": "windows|linux"
}
```

Response:
```json
{
  "success": true,
  "validation": {
    "is_valid": true,
    "syntax_errors": [],
    "security_issues": [],
    "warnings": [],
    "suggestions": [],
    "overall_score": 85
  }
}
```

## Dashboard

### Get Analytics
**GET** `/api/dashboard/analytics`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "totalUsers": 0,
  "totalDocuments": 0,
  "totalScripts": 0,
  "recentActivity": []
}
```

## AI Service Endpoints

### Health Check
**GET** `/health`

Response:
```json
{
  "status": "healthy",
  "service": "AI/ML ComplianceAI"
}
```

### Analyze Document (Direct)
**POST** `/analyze-document`

Content-Type: `multipart/form-data`

Form Data:
- `file`: Document file

### Generate Script (Direct)
**POST** `/generate-script`

```json
{
  "requirements": ["string"],
  "script_type": "audit|remediation", 
  "os_type": "windows|linux"
}
```

### Validate Script (Direct)
**POST** `/validate-script`

```json
{
  "script": "string",
  "os_type": "windows|linux"
}
```
