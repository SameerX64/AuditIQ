from src.models.model import ComplianceAI
import re
import logging

class AnalysisService:
    """Service for handling document analysis and script validation"""
    
    def __init__(self, ai_model: ComplianceAI):
        self.ai_model = ai_model
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def analyze_compliance_document(self, text):
        """
        Analyze compliance document text and extract policies
        
        Args:
            text (str): Document text content
            
        Returns:
            dict: Analysis results with extracted policies
        """
        try:
            # Extract policies using AI model
            policies = self.ai_model.parse_policies(text)
            
            # Categorize policies by importance
            categorized_policies = self._categorize_policies(policies)
            
            analysis_result = {
                'total_policies': len(policies),
                'policies': policies,
                'categorized_policies': categorized_policies,
                'analysis_summary': self._generate_summary(policies),
                'extraction_success': True
            }
            
            return analysis_result
            
        except Exception as e:
            self.logger.error(f"Error analyzing document: {str(e)}")
            return {
                'extraction_success': False,
                'error': str(e),
                'total_policies': 0,
                'policies': []
            }
    
    def _categorize_policies(self, policies):
        """Categorize policies by severity and type"""
        categorized = {
            'critical': [],
            'high': [],
            'medium': [],
            'low': []
        }
        
        for policy in policies:
            severity = self._determine_severity(policy)
            categorized[severity].append(policy)
        
        return categorized
    
    def _determine_severity(self, policy):
        """Determine policy severity based on content"""
        policy_text = policy.lower()
        
        critical_keywords = ['password', 'authentication', 'encryption', 'privilege', 'administrator']
        high_keywords = ['audit', 'log', 'access', 'permission', 'security']
        medium_keywords = ['configuration', 'setting', 'policy', 'control']
        
        if any(keyword in policy_text for keyword in critical_keywords):
            return 'critical'
        elif any(keyword in policy_text for keyword in high_keywords):
            return 'high'
        elif any(keyword in policy_text for keyword in medium_keywords):
            return 'medium'
        else:
            return 'low'
    
    def _generate_summary(self, policies):
        """Generate a summary of the analysis"""
        if not policies:
            return "No policies found in the document."
        
        return f"Extracted {len(policies)} compliance policies. Analysis includes categorization by severity and automated script generation capabilities."
    
    def validate_script(self, script, os_type):
        """
        Validate generated script for syntax and best practices
        
        Args:
            script (str): Script content to validate
            os_type (str): Operating system type (windows/linux)
            
        Returns:
            dict: Validation results
        """
        try:
            validation_result = {
                'is_valid': True,
                'syntax_errors': [],
                'warnings': [],
                'suggestions': [],
                'security_score': 0
            }
            
            if os_type.lower() == 'windows':
                validation_result = self._validate_windows_script(script)
            elif os_type.lower() == 'linux':
                validation_result = self._validate_linux_script(script)
            
            # Calculate security score
            validation_result['security_score'] = self._calculate_security_score(script, os_type)
            
            return validation_result
            
        except Exception as e:
            self.logger.error(f"Error validating script: {str(e)}")
            return {
                'is_valid': False,
                'error': str(e),
                'security_score': 0
            }
    
    def _validate_windows_script(self, script):
        """Validate Windows PowerShell/Batch script"""
        validation = {
            'is_valid': True,
            'syntax_errors': [],
            'warnings': [],
            'suggestions': []
        }
        
        # Check for common PowerShell patterns
        if 'Set-ExecutionPolicy' in script:
            validation['warnings'].append('Script modifies execution policy - ensure this is intended')
        
        if not re.search(r'#.*error.*handling', script, re.IGNORECASE):
            validation['suggestions'].append('Consider adding error handling with try-catch blocks')
        
        return validation
    
    def _validate_linux_script(self, script):
        """Validate Linux bash script"""
        validation = {
            'is_valid': True,
            'syntax_errors': [],
            'warnings': [],
            'suggestions': []
        }
        
        # Check for shebang
        if not script.startswith('#!/'):
            validation['warnings'].append('Script missing shebang line')
        
        # Check for error handling
        if 'set -e' not in script:
            validation['suggestions'].append('Consider adding "set -e" for better error handling')
        
        return validation
    
    def _calculate_security_score(self, script, os_type):
        """Calculate security score for the script (0-100)"""
        score = 100
        
        # Deduct points for risky patterns
        risky_patterns = [
            r'rm\s+-rf\s+/',  # Dangerous deletion
            r'chmod\s+777',   # Overly permissive permissions
            r'sudo\s+rm',     # Sudo with deletion
            r'exec\s*\(',     # Execution patterns
        ]
        
        for pattern in risky_patterns:
            if re.search(pattern, script, re.IGNORECASE):
                score -= 20
        
        return max(0, min(100, score))
