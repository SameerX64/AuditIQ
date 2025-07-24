import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  Code,
  Computer,
  Security,
  Assignment,
  Download,
  Visibility,
} from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import complianceService from "../services/complianceService";

const ScriptGeneration = () => {
  const [formData, setFormData] = useState({
    policy: "",
    auditRemediation: "audit",
    os: "windows",
    useAI: true,
    remediationSteps: "",
  });
  const [generatedScript, setGeneratedScript] = useState("");
  const [validationResult, setValidationResult] = useState(null);

  const generateMutation = useMutation(complianceService.generateScript, {
    onSuccess: (data) => {
      setGeneratedScript(data.script);
      toast.success("Script generated successfully!");
      // Auto-validate the generated script
      validateScript(data.script, formData.os);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Script generation failed");
    },
  });

  const validateMutation = useMutation(
    ({ script, osType }) => complianceService.validateScript(script, osType),
    {
      onSuccess: (data) => {
        setValidationResult(data.validation);
      },
      onError: (error) => {
        toast.error("Script validation failed");
      },
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.policy.trim()) {
      toast.error("Please enter a policy description");
      return;
    }

    setGeneratedScript("");
    setValidationResult(null);

    await generateMutation.mutateAsync(formData);
  };

  const validateScript = async (script, osType) => {
    if (!script) return;
    await validateMutation.mutateAsync({ script, osType });
  };

  const downloadScript = () => {
    if (!generatedScript) return;

    const extension =
      formData.os === "windows"
        ? generatedScript.includes("PowerShell")
          ? ".ps1"
          : ".bat"
        : ".sh";
    const filename = `compliance_script_${Date.now()}${extension}`;

    const blob = new Blob([generatedScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Script downloaded successfully!");
  };

  const getLanguage = () => {
    if (formData.os === "windows") {
      return generatedScript.includes("PowerShell") ? "powershell" : "batch";
    }
    return "bash";
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <Code sx={{ mr: 1, verticalAlign: "middle" }} />
        Script Generation
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Generate automated compliance scripts for audit and remediation tasks.
      </Typography>

      {/* Script Generation Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Script Configuration
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Policy Description"
            name="policy"
            value={formData.policy}
            onChange={handleChange}
            placeholder="Describe the compliance policy you want to implement (e.g., 'Ensure password complexity requirements are met', 'Configure firewall settings', etc.)"
            sx={{ mb: 3 }}
            required
          />

          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Script Type</InputLabel>
              <Select
                name="auditRemediation"
                value={formData.auditRemediation}
                label="Script Type"
                onChange={handleChange}
                startAdornment={<Assignment sx={{ mr: 1 }} />}
              >
                <MenuItem value="audit">
                  <Box display="flex" alignItems="center">
                    <Visibility sx={{ mr: 1 }} />
                    Audit Script
                  </Box>
                </MenuItem>
                <MenuItem value="remediation">
                  <Box display="flex" alignItems="center">
                    <Security sx={{ mr: 1 }} />
                    Remediation Script
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Operating System</InputLabel>
              <Select
                name="os"
                value={formData.os}
                label="Operating System"
                onChange={handleChange}
                startAdornment={<Computer sx={{ mr: 1 }} />}
              >
                <MenuItem value="windows">Windows</MenuItem>
                <MenuItem value="linux">Linux</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.useAI}
                onChange={handleSwitchChange}
                name="useAI"
                color="primary"
              />
            }
            label="Use AI-Enhanced Generation"
            sx={{ mb: 3 }}
          />

          {formData.auditRemediation === "remediation" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Remediation Steps (Optional)"
              name="remediationSteps"
              value={formData.remediationSteps}
              onChange={handleChange}
              placeholder="Provide specific remediation steps if you have them..."
              sx={{ mb: 3 }}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={generateMutation.isLoading}
            startIcon={
              generateMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Code />
              )
            }
          >
            {generateMutation.isLoading ? "Generating..." : "Generate Script"}
          </Button>
        </Box>
      </Paper>

      {/* Generated Script */}
      {generatedScript && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              Generated{" "}
              {formData.auditRemediation === "audit" ? "Audit" : "Remediation"}{" "}
              Script
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={() => validateScript(generatedScript, formData.os)}
                disabled={validateMutation.isLoading}
                sx={{ mr: 1 }}
                startIcon={
                  validateMutation.isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Security />
                  )
                }
              >
                Validate
              </Button>
              <Button
                variant="contained"
                onClick={downloadScript}
                startIcon={<Download />}
              >
                Download
              </Button>
            </Box>
          </Box>

          <SyntaxHighlighter
            language={getLanguage()}
            style={tomorrow}
            customStyle={{
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {generatedScript}
          </SyntaxHighlighter>
        </Paper>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Validation Results
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body1">
              Security Score:{" "}
              <strong>{validationResult.security_score}/100</strong>
            </Typography>
            {validationResult.is_valid ? (
              <Alert severity="success" sx={{ flexGrow: 1 }}>
                Script validation passed
              </Alert>
            ) : (
              <Alert severity="error" sx={{ flexGrow: 1 }}>
                Script validation failed
              </Alert>
            )}
          </Box>

          {validationResult.syntax_errors &&
            validationResult.syntax_errors.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Syntax Errors:
                </Typography>
                {validationResult.syntax_errors.map((error, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    {error}
                  </Alert>
                ))}
              </Box>
            )}

          {validationResult.warnings &&
            validationResult.warnings.length > 0 && (
              <Box mb={2}>
                <Typography
                  variant="subtitle2"
                  color="warning.main"
                  gutterBottom
                >
                  Warnings:
                </Typography>
                {validationResult.warnings.map((warning, index) => (
                  <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                    {warning}
                  </Alert>
                ))}
              </Box>
            )}

          {validationResult.suggestions &&
            validationResult.suggestions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Suggestions:
                </Typography>
                {validationResult.suggestions.map((suggestion, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    {suggestion}
                  </Alert>
                ))}
              </Box>
            )}
        </Paper>
      )}

      {/* Examples */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Example Policies
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {[
            "Ensure password complexity requirements are configured",
            "Configure Windows Firewall with Advanced Security",
            "Disable unnecessary network services",
            "Enable audit logging for privileged operations",
            "Configure automatic screen lock timeout",
            "Set minimum password length to 14 characters",
          ].map((example, index) => (
            <Card
              key={index}
              sx={{ minWidth: 250, cursor: "pointer" }}
              onClick={() =>
                setFormData((prev) => ({ ...prev, policy: example }))
              }
            >
              <CardContent>
                <Typography variant="body2">{example}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ScriptGeneration;
