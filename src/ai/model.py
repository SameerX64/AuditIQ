from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from langchain import LLMChain, PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.callbacks import get_openai_callback
import torch
import json
import os
import re
from typing import Dict, List, Tuple, Optional

class ComplianceAI:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        # Initialize Gemini model with optimized settings
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.3,  # Lower temperature for more deterministic outputs
            top_p=0.9,       # Nucleus sampling for better code generation
            top_k=40,        # Limit token selection for more focused outputs
            convert_system_message_to_human=True,
            safety_settings={
                "HARASSMENT": "block_none",
                "HATE_SPEECH": "block_none",
                "SEXUALLY_EXPLICIT": "block_none",
                "DANGEROUS_CONTENT": "block_none"
            }
        )
        self.templates: Dict[str, Dict] = {}
        self.functions: Dict[str, Dict] = {}
        
    def setup_models(self):
        """Initialize the transformer models and load templates"""
        # Set up AI models
        model_name = "microsoft/codebert-base"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        
        # Load templates
        self._load_templates()
    
    def _load_templates(self):
        """Load script templates and function definitions."""
        try:
            # Load Windows templates
            self.templates['windows'] = {
                'audit': self._load_template('windows/powershell/audit_template.txt'),
                'remediation': self._load_template('windows/powershell/remediation_template.txt')
            }
            self.functions['windows'] = self._load_json('windows/powershell/functions.json')
            
            # Load Linux templates
            self.templates['linux'] = {
                'audit': self._load_template('linux/bash/audit_template.txt'),
                'remediation': self._load_template('linux/bash/remediation_template.txt')
            }
            self.functions['linux'] = self._load_json('linux/bash/functions.json')
        except Exception as e:
            print(f"Warning: Failed to load templates: {e}")

    def _load_template(self, path: str) -> str:
        """Load a template file from the templates directory."""
        template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
        with open(os.path.join(template_dir, path), 'r') as f:
            return f.read()

    def _load_json(self, path: str) -> Dict:
        """Load a JSON file from the templates directory."""
        template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
        with open(os.path.join(template_dir, path), 'r') as f:
            return json.load(f)
    
    def analyze_compliance_doc(self, text):
        """Analyze compliance document text and extract relevant information"""
        # Gemini-optimized prompt template with explicit structure
        template = """
        You are a compliance script generator analyzing security documentation.
        Analyze the following compliance document text and extract the exact information in this format:
        
        Rule_ID: (Extract the numerical ID)
        Rule_Level: (Extract L1 or L2)
        Rule_Title: (Extract the full title)
        Platform: (Specify Windows/Linux/Unix)
        Description: (Provide a clear, concise description)
        
        Audit_Steps:
        1. (List specific technical steps)
        2. (Include commands or registry keys)
        3. (Add validation checks)
        
        Remediation_Steps:
        1. (List specific technical steps)
        2. (Include exact commands)
        3. (Add verification steps)
        
        Text to analyze: {text}
        """
        
        prompt = PromptTemplate(template=template, input_variables=["text"])
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        # Get AI analysis
        analysis = chain.run(text=text)
        
        # Extract structured info using regex
        policy_info = self.analyze_policy(text)
        
        # Combine AI analysis with structured extraction
        result = analysis + "\n\nExtracted Policy Info:\n" + str(policy_info)
        return result

    def analyze_policy(self, policy_text: str) -> Dict:
        """Analyze a policy and extract key information."""
        # Extract policy ID, title, and level
        id_match = re.search(r'(\d+\.\d+\.\d+)', policy_text)
        level_match = re.search(r'\(L(\d+)\)', policy_text)
        title_match = re.search(r'Ensure\s[\'"](.*?)[\'"]', policy_text)
        
        return {
            'id': id_match.group(1) if id_match else None,
            'level': int(level_match.group(1)) if level_match else None,
            'title': title_match.group(1) if title_match else None
        }

    def generate_script(self, 
                       policy: str, 
                       audit_remediation: str, 
                       os_type: str, 
                       use_ai: bool = True,
                       remediation_steps: Optional[str] = None) -> str:
        """Generate a script based on the policy, audit/remediation choice, and OS type."""
        os_key = 'windows' if os_type.lower() == 'windows' else 'linux'
        policy_info = self.analyze_policy(policy)
        
        if use_ai:
            # Gemini-optimized template for script generation
            ai_template = """
            You are generating a {script_type} script for {platform}. 
            Follow these exact requirements:

            Rule Details:
            - ID: {rule_id}
            - Title: {title}
            - Level: {level}

            Requirements:
            1. Use native {platform} commands only
            2. Include proper error handling for each step
            3. Add detailed logging with timestamps
            4. Implement input validation
            5. Follow security best practices
            6. Add comments explaining complex operations
            7. Include backup/restore functionality
            8. Add status checks after each critical operation

            Generate only the script content, no explanations.
            Use {platform}-specific commands and best practices.
            """
            
            prompt = PromptTemplate(
                template=ai_template,
                input_variables=["script_type", "platform", "rule_id", "title", "level"]
            )
            
            chain = LLMChain(llm=self.llm, prompt=prompt)
            ai_script = chain.run(
                script_type=audit_remediation,
                platform=os_type,
                rule_id=policy_info['id'],
                title=policy_info['title'],
                level=policy_info['level']
            )
            
            # Get template and format it with AI-generated steps
            template = self.templates[os_key][audit_remediation.lower()]
            script = template.format(
                rule_id=policy_info['id'],
                description=policy_info['title'],
                audit_steps=ai_script if audit_remediation.lower() == 'audit' else '',
                remediation_steps=ai_script if audit_remediation.lower() == 'remediation' else ''
            )
        else:
            # Use template-based generation
            template = self.templates[os_key][audit_remediation.lower()]
            functions = self.functions[os_key]
            
            # Generate script steps based on remediation instructions or policy
            if remediation_steps:
                steps = self._generate_steps_from_instructions(remediation_steps, os_key, functions)
            else:
                steps = self._generate_steps_from_policy(policy_info, os_key, functions)
            
            # Format template
            script = template.format(
                rule_id=policy_info['id'],
                description=policy_info['title'],
                audit_steps=steps if audit_remediation.lower() == 'audit' else '',
                remediation_steps=steps if audit_remediation.lower() == 'remediation' else ''
            )
        
        return script

    def _generate_steps_from_instructions(self, 
                                        instructions: str, 
                                        os_type: str, 
                                        functions: Dict) -> str:
        """Generate script steps from remediation instructions."""
        # Enhanced NLP-based step generation
        steps = []
        
        # Pre-process instructions to identify command patterns
        lines = instructions.strip().split('\n')
        for line in lines:
            if not line.strip():
                continue
                
            # Detect command patterns
            if os_type == 'windows':
                if 'registry' in line.lower():
                    steps.append(self._generate_registry_command(line))
                elif 'service' in line.lower():
                    steps.append(self._generate_service_command(line))
                else:
                    steps.append(f"Write-Log 'Executing: {line}'")
            else:
                if any(cmd in line.lower() for cmd in ['chmod', 'chown', 'systemctl']):
                    steps.append(self._generate_linux_command(line))
                else:
                    steps.append(f"log 'Executing: {line}'")
        
        return '\n'.join(steps)
    
    def _generate_registry_command(self, instruction: str) -> str:
        """Generate PowerShell registry commands with proper error handling."""
        return f"""try {{
    Write-Log 'Checking registry value...'
    # {instruction}
    $result = Get-ItemProperty -Path HKLM:\\... -ErrorAction Stop
    Write-Log 'Registry operation completed successfully'
}} catch {{
    Write-Log "Failed to modify registry: $_"
    throw
}}"""

    def _generate_service_command(self, instruction: str) -> str:
        """Generate PowerShell service management commands."""
        return f"""try {{
    Write-Log 'Managing service...'
    # {instruction}
    $service = Get-Service -Name ... -ErrorAction Stop
    Write-Log 'Service operation completed successfully'
}} catch {{
    Write-Log "Failed to manage service: $_"
    throw
}}"""

    def _generate_linux_command(self, instruction: str) -> str:
        """Generate Linux commands with proper error handling."""
        return f"""if ! {{ {instruction} }}; then
    log "Failed to execute: {instruction}"
    exit 1
fi
log "Successfully executed: {instruction}"\"\"\"
