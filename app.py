from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from src.ai.model import ComplianceAI
import os
import fitz  # PyMuPDF
import re
from typing import Tuple, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Initialize folders
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize AI model
ai_model = ComplianceAI()
ai_model.setup_models()

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF using PyMuPDF."""
    doc = fitz.open(pdf_path)
    text = ""
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text += page.get_text()
    return text

def extract_policies_and_remediation_paths(text: str) -> Tuple[List[str], List[str]]:
    """Extract policies and their remediation paths."""
    policies = []
    remediation_paths = []

    # Regular expression to find policy titles
    policy_pattern = re.compile(r'\d+\.\d+\.\d+\s+\(L[1-2]\)\s+Ensure\s[\'"](.*?)[\'"]')
    # Regular expression to find remediation paths, assuming it starts with "Remediation:"
    remediation_pattern = re.compile(r'Remediation:([\s\S]*?)(?=\n\s*\d+\.\d+\.\d+|\Z)', re.MULTILINE)

    policy_matches = policy_pattern.findall(text)
    remediation_matches = remediation_pattern.findall(text)

    for match in policy_matches:
        policies.append(match.strip())

    for match in remediation_matches:
        cleaned_path = " ".join(match.split()).strip()
        remediation_paths.append(cleaned_path)

    return policies, remediation_paths

@app.route('/')
def serve_index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        # Extract text from the PDF
        text = extract_text_from_pdf(file_path)

        # Extract policies and remediation paths
        policies, remediation_paths = extract_policies_and_remediation_paths(text)

        # Analyze document with AI
        analysis = ai_model.analyze_compliance_doc(text)

        return jsonify({
            'policies': policies,
            'remediationPaths': remediation_paths,
            'analysis': analysis
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_script', methods=['POST'])
def generate_script_route():
    data = request.get_json()
    policy = data.get('policy')
    audit_remediation = data.get('auditRemediation')
    os_type = data.get('os')
    remediation_steps = data.get('remediationSteps')
    use_ai = data.get('useAI', True)  # Default to using AI

    if not policy or not audit_remediation or not os_type:
        return jsonify({'error': 'Incomplete data provided'}), 400

    try:
        # Generate script based on policy and selected options
        script = ai_model.generate_script(
            policy=policy,
            audit_remediation=audit_remediation,
            os_type=os_type,
            use_ai=use_ai,
            remediation_steps=remediation_steps
        )

        return jsonify({'script': script})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
