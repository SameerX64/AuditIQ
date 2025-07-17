from flask import Blueprint, request, jsonify
from src.ai.model import ComplianceAI
from src.models.compliance import ComplianceTemplate, ComplianceRule
from datetime import datetime
import os

api = Blueprint('api', __name__)
ai_model = ComplianceAI()

@api.route('/analyze', methods=['POST'])
def analyze_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    # Save and process file
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)
    
    # Extract text and analyze
    with open(file_path, 'rb') as f:
        analysis = ai_model.analyze_compliance_doc(f.read())
    
    return jsonify(analysis)

@api.route('/generate-script', methods=['POST'])
def generate_script():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    rule_info = data.get('rule_info')
    platform = data.get('platform')
    script_type = data.get('script_type')
    
    if not all([rule_info, platform, script_type]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    script = ai_model.generate_script(rule_info, platform, script_type)
    
    return jsonify({
        'script': script,
        'generated_at': datetime.now().isoformat()
    })
