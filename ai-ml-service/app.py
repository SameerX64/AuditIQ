from flask import Flask, request, jsonify
from flask_cors import CORS
from src.models.model import ComplianceAI
from src.services.pdf_service import PDFService
from src.services.analysis_service import AnalysisService
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize folders
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize services
ai_model = ComplianceAI()
pdf_service = PDFService()
analysis_service = AnalysisService(ai_model)

# Setup AI models
ai_model.setup_models()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'AI/ML Compliance Service'})

@app.route('/analyze_document', methods=['POST'])
def analyze_document():
    """Analyze uploaded compliance document"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Save file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Extract text from PDF
        text = pdf_service.extract_text_from_pdf(file_path)

        # Analyze document with AI
        analysis = analysis_service.analyze_compliance_document(text)

        # Clean up uploaded file
        os.remove(file_path)

        return jsonify(analysis)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_script', methods=['POST'])
def generate_script():
    """Generate compliance script based on policy"""
    data = request.get_json()
    
    required_fields = ['policy', 'auditRemediation', 'os']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        script = ai_model.generate_script(
            policy=data['policy'],
            audit_remediation=data['auditRemediation'],
            os_type=data['os'],
            use_ai=data.get('useAI', True),
            remediation_steps=data.get('remediationSteps')
        )

        return jsonify({'script': script})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/validate_script', methods=['POST'])
def validate_script():
    """Validate generated script for syntax and best practices"""
    data = request.get_json()
    
    if 'script' not in data or 'os_type' not in data:
        return jsonify({'error': 'Missing script or os_type'}), 400

    try:
        validation_result = analysis_service.validate_script(
            data['script'], 
            data['os_type']
        )
        return jsonify(validation_result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
