from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ComplianceRule:
    rule_id: str
    description: str
    level: str
    platform: str
    audit_steps: List[str]
    remediation_steps: Optional[List[str]]
    
@dataclass
class ComplianceTemplate:
    template_id: str
    name: str
    version: str
    authority: str
    rules: List[ComplianceRule]
    
@dataclass
class GeneratedScript:
    rule_id: str
    platform: str
    script_type: str
    audit_script: str
    remediation_script: Optional[str]
    generated_at: str
