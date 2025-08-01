from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize folders
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Simple mock AI service for demonstration
class SimpleComplianceAI:
    def __init__(self):
        self.frameworks = ['CIS', 'NIST', 'ISO27001', 'SOX']
    
    def analyze_policy_document(self, text):
        """Simple policy analysis without heavy AI dependencies"""
        return {
            "framework": "CIS",
            "requirements": [
                {
                    "id": "CIS-001",
                    "title": "Password Policy",
                    "description": "Implement strong password requirements",
                    "risk_level": "High",
                    "priority": "Critical",
                    "category": "Access Control",
                    "implementation_steps": [
                        "Set minimum password length to 12 characters",
                        "Require complex characters",
                        "Enable password expiration"
                    ]
                },
                {
                    "id": "CIS-002", 
                    "title": "Account Lockout",
                    "description": "Configure account lockout policies",
                    "risk_level": "Medium",
                    "priority": "High",
                    "category": "Access Control",
                    "implementation_steps": [
                        "Set lockout threshold to 5 attempts",
                        "Set lockout duration to 30 minutes",
                        "Configure reset counter"
                    ]
                }
            ],
            "summary": {
                "total_requirements": 2,
                "critical_count": 1,
                "high_count": 1,
                "medium_count": 0,
                "low_count": 0
            }
        }
    
    def generate_audit_script(self, requirements, os_type='windows'):
        """Generate basic audit script"""
        if os_type.lower() == 'windows':
            return '''# Windows Audit Script
# Generated by ComplianceAI

Write-Host "Starting compliance audit..."

# Check password policy
$passwordPolicy = Get-LocalSecurityPolicy | Where-Object { $_.Name -eq "PasswordPolicy" }
Write-Host "Password policy check: $($passwordPolicy.Status)"

# Check account lockout policy  
$lockoutPolicy = Get-LocalSecurityPolicy | Where-Object { $_.Name -eq "AccountLockoutPolicy" }
Write-Host "Account lockout policy check: $($lockoutPolicy.Status)"

Write-Host "Audit completed."'''
        else:
            return '''#!/bin/bash
# Linux Audit Script
# Generated by ComplianceAI

echo "Starting compliance audit..."

# Check password policy
if [ -f /etc/security/pwquality.conf ]; then
    echo "Password policy file exists"
    grep -E "minlen|minclass" /etc/security/pwquality.conf
else
    echo "Password policy file not found"
fi

# Check account lockout settings
if [ -f /etc/security/faillock.conf ]; then
    echo "Account lockout configuration exists"
    grep -E "deny|unlock_time" /etc/security/faillock.conf
else
    echo "Account lockout configuration not found"
fi

echo "Audit completed."'''
    
    def generate_remediation_script(self, requirements, os_type='windows'):
        """Generate basic remediation script"""
        if os_type.lower() == 'windows':
            return '''# Windows Remediation Script
# Generated by ComplianceAI
# WARNING: This script modifies system settings

Write-Host "Starting compliance remediation..."

# Set password policy
Write-Host "Configuring password policy..."
secedit /configure /db $env:temp\\secpol.sdb /cfg $env:temp\\secpol.inf /quiet

# Set account lockout policy
Write-Host "Configuring account lockout policy..."
net accounts /lockoutthreshold:5 /lockoutduration:30 /lockoutwindow:30

Write-Host "Remediation completed."'''
        else:
            return '''#!/bin/bash
# Linux Remediation Script
# Generated by ComplianceAI
# WARNING: This script modifies system settings

echo "Starting compliance remediation..."

# Configure password policy
echo "Configuring password policy..."
if [ -f /etc/security/pwquality.conf ]; then
    cp /etc/security/pwquality.conf /etc/security/pwquality.conf.backup
    echo "minlen = 12" >> /etc/security/pwquality.conf
    echo "minclass = 3" >> /etc/security/pwquality.conf
fi

# Configure account lockout
echo "Configuring account lockout..."
if [ -f /etc/security/faillock.conf ]; then
    cp /etc/security/faillock.conf /etc/security/faillock.conf.backup
    echo "deny = 5" >> /etc/security/faillock.conf
    echo "unlock_time = 1800" >> /etc/security/faillock.conf
fi

echo "Remediation completed."'''
    
    def validate_script_syntax(self, script, os_type):
        """Simple script validation"""
        return {
            "is_valid": True,
            "syntax_errors": [],
            "security_issues": [],
            "warnings": ["This is a simplified validation"],
            "suggestions": ["Test in a non-production environment"],
            "overall_score": 85
        }

# Initialize AI service
ai_model = SimpleComplianceAI()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'AI/ML ComplianceAI'})

@app.route('/analyze-document', methods=['POST'])
def analyze_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Read file content (simplified - just read as text)
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Analyze document
        analysis_result = ai_model.analyze_policy_document(content)
        
        return jsonify(analysis_result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-script', methods=['POST'])
def generate_script():
    data = request.get_json()
    
    if not data or 'requirements' not in data:
        return jsonify({'error': 'Missing requirements'}), 400
    
    requirements = data['requirements']
    script_type = data.get('script_type', 'audit')
    os_type = data.get('os_type', 'windows')
    
    try:
        if script_type == 'audit':
            script = ai_model.generate_audit_script(requirements, os_type)
        elif script_type == 'remediation':
            script = ai_model.generate_remediation_script(requirements, os_type)
        else:
            return jsonify({'error': 'Invalid script type'}), 400
        
        return jsonify({
            'script': script,
            'script_type': script_type,
            'os_type': os_type
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/validate-script', methods=['POST'])
def validate_script():
    data = request.get_json()
    
    if not data or 'script' not in data or 'os_type' not in data:
        return jsonify({'error': 'Missing script or os_type'}), 400

    try:
        validation_result = ai_model.validate_script_syntax(
            data['script'], 
            data['os_type']
        )
        return jsonify(validation_result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting AI/ML Service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
