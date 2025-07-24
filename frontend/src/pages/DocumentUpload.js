import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material";
import {
  CloudUpload,
  Description,
  CheckCircle,
  Error,
  Warning,
  Analytics,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import complianceService from "../services/complianceService";

const DocumentUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation(complianceService.uploadDocument, {
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
      toast.success("Document uploaded and analyzed successfully!");
      queryClient.invalidateQueries("documents");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Upload failed");
    },
  });

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      toast.error("File size must be less than 16MB");
      return;
    }

    setAnalysisResult(null);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await uploadMutation.mutateAsync(file);
      setUploadProgress(100);
    } catch (error) {
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <Error color="error" />;
      case "high":
        return <Warning color="warning" />;
      case "medium":
        return <Warning color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "success";
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <CloudUpload sx={{ mr: 1, verticalAlign: "middle" }} />
        Document Upload & Analysis
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Upload compliance documents (PDF) for AI-powered policy extraction and
        analysis.
      </Typography>

      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: "center",
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.300",
          backgroundColor: isDragActive ? "primary.light" : "background.paper",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "primary.light",
          },
        }}
      >
        <input {...getInputProps()} />

        <CloudUpload sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />

        {isDragActive ? (
          <Typography variant="h6" color="primary">
            Drop the PDF file here...
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Drag & drop a PDF file here, or click to select
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Supported formats: PDF (max 16MB)
            </Typography>
          </>
        )}

        <Box mt={2}>
          <Button
            variant="contained"
            component="span"
            disabled={uploadMutation.isLoading}
          >
            Select PDF File
          </Button>
        </Box>
      </Paper>

      {/* Upload Progress */}
      {(uploadMutation.isLoading || uploadProgress > 0) && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {uploadMutation.isLoading
              ? "Uploading and Analyzing..."
              : "Processing Complete"}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="textSecondary">
            {uploadProgress}% complete
          </Typography>

          {uploadMutation.isLoading && (
            <Box display="flex" alignItems="center" mt={2}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">
                AI is analyzing the document and extracting policies...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Analytics sx={{ mr: 1, verticalAlign: "middle" }} />
            Analysis Results
          </Typography>

          {analysisResult.extraction_success ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                Successfully extracted {analysisResult.total_policies} policies
                from the document
              </Alert>

              {/* Summary Stats */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <Chip
                  label={`${analysisResult.total_policies} Total Policies`}
                  color="primary"
                  variant="outlined"
                />
                {analysisResult.categorized_policies && (
                  <>
                    <Chip
                      label={`${analysisResult.categorized_policies.critical?.length || 0} Critical`}
                      color="error"
                      size="small"
                    />
                    <Chip
                      label={`${analysisResult.categorized_policies.high?.length || 0} High`}
                      color="warning"
                      size="small"
                    />
                    <Chip
                      label={`${analysisResult.categorized_policies.medium?.length || 0} Medium`}
                      color="info"
                      size="small"
                    />
                    <Chip
                      label={`${analysisResult.categorized_policies.low?.length || 0} Low`}
                      color="success"
                      size="small"
                    />
                  </>
                )}
              </Box>

              {/* Extracted Policies */}
              {analysisResult.policies &&
                analysisResult.policies.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Extracted Policies
                    </Typography>
                    <List>
                      {analysisResult.policies
                        .slice(0, 10)
                        .map((policy, index) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemIcon>
                                <Description color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`Policy ${index + 1}`}
                                secondary={
                                  typeof policy === "string"
                                    ? policy.substring(0, 200) +
                                      (policy.length > 200 ? "..." : "")
                                    : "Policy extracted"
                                }
                              />
                            </ListItem>
                            {index <
                              Math.min(
                                analysisResult.policies.length - 1,
                                9
                              ) && <Divider />}
                          </React.Fragment>
                        ))}
                    </List>

                    {analysisResult.policies.length > 10 && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 2 }}
                      >
                        Showing first 10 policies. Total:{" "}
                        {analysisResult.policies.length}
                      </Typography>
                    )}
                  </>
                )}

              {/* Next Steps */}
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Next Steps
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mr: 2 }}
                  onClick={() => (window.location.href = "/generate")}
                >
                  Generate Scripts
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => (window.location.href = "/scripts")}
                >
                  View Script Library
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="error">
              Failed to analyze document:{" "}
              {analysisResult.error || "Unknown error"}
            </Alert>
          )}
        </Paper>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          How it Works
        </Typography>
        <Typography variant="body2" paragraph>
          1. <strong>Upload</strong> a compliance document (CIS benchmarks, NIST
          guidelines, etc.)
        </Typography>
        <Typography variant="body2" paragraph>
          2. <strong>AI Analysis</strong> extracts security policies and
          categorizes them by severity
        </Typography>
        <Typography variant="body2" paragraph>
          3. <strong>Generate Scripts</strong> to create audit and remediation
          scripts for your policies
        </Typography>
        <Typography variant="body2">
          4. <strong>Deploy</strong> scripts on your systems for compliance
          enforcement
        </Typography>
      </Paper>
    </Box>
  );
};

export default DocumentUpload;
