document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const auditScript = document.getElementById('auditScript');
    const remediationScript = document.getElementById('remediationScript');
    const downloadBtn = document.getElementById('downloadBtn');
    const platformSelect = document.getElementById('platform');
    const scriptTypeSelect = document.getElementById('scriptType');

    // Update available script types based on platform
    platformSelect.addEventListener('change', function() {
        const platform = this.value;
        scriptTypeSelect.innerHTML = '';
        
        if (platform === 'windows') {
            addOption(scriptTypeSelect, 'powershell', 'PowerShell');
            addOption(scriptTypeSelect, 'batch', 'Batch');
        } else {
            addOption(scriptTypeSelect, 'shell', 'Shell Script');
            addOption(scriptTypeSelect, 'bash', 'Bash');
        }
    });

    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        const file = document.getElementById('complianceDoc').files[0];
        
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        formData.append('file', file);
        formData.append('platform', platformSelect.value);
        formData.append('scriptType', scriptTypeSelect.value);

        try {
            // First analyze the document
            const analysisResponse = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });
            
            const analysisData = await analysisResponse.json();
            
            if (!analysisResponse.ok) throw new Error(analysisData.error);

            // Then generate scripts
            const scriptResponse = await fetch('/api/generate-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rule_info: analysisData,
                    platform: platformSelect.value,
                    script_type: scriptTypeSelect.value
                })
            });

            const scriptData = await scriptResponse.json();
            
            if (!scriptResponse.ok) throw new Error(scriptData.error);

            // Update the UI with generated scripts
            auditScript.textContent = scriptData.script.audit;
            remediationScript.textContent = scriptData.script.remediation;
            
            // Highlight the code
            Prism.highlightAll();
            
            // Enable download button
            downloadBtn.disabled = false;

        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    downloadBtn.addEventListener('click', function() {
        const zip = new JSZip();
        const platform = platformSelect.value;
        const extension = platform === 'windows' ? '.ps1' : '.sh';
        
        zip.file('audit' + extension, auditScript.textContent);
        zip.file('remediation' + extension, remediationScript.textContent);
        
        zip.generateAsync({type: 'blob'})
            .then(function(content) {
                const url = window.URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'compliance-scripts.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            });
    });

    function addOption(select, value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
    }
});
