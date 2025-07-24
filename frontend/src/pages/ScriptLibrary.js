import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import {
  Assignment,
  Search,
  FilterList,
  Computer,
  Security,
  Visibility,
  Download,
  Delete,
  Code,
  CheckCircle,
  Warning,
  Error,
} from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import complianceService from "../services/complianceService";

const ScriptLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOS, setFilterOS] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedScript, setSelectedScript] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch scripts
  const {
    data: scriptsData,
    isLoading,
    error,
  } = useQuery(
    ["scripts", page],
    () => complianceService.getScripts(page, 10),
    {
      keepPreviousData: true,
    }
  );

  // Delete script mutation
  const deleteMutation = useMutation(complianceService.deleteScript, {
    onSuccess: () => {
      toast.success("Script deleted successfully!");
      queryClient.invalidateQueries("scripts");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete script");
    },
  });

  const scripts = scriptsData?.scripts || [];
  const pagination = scriptsData?.pagination || {};

  // Filter scripts based on search and filters
  const filteredScripts = scripts.filter((script) => {
    const matchesSearch = script.policy
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesOS = filterOS === "all" || script.operatingSystem === filterOS;
    const matchesType =
      filterType === "all" || script.scriptType === filterType;
    return matchesSearch && matchesOS && matchesType;
  });

  const handleViewScript = async (scriptId) => {
    try {
      const script = await complianceService.getScript(scriptId);
      setSelectedScript(script);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load script details");
    }
  };

  const handleDownloadScript = (script) => {
    const extension =
      script.operatingSystem === "windows"
        ? script.scriptContent.includes("PowerShell")
          ? ".ps1"
          : ".bat"
        : ".sh";
    const filename = `${script.policy.replace(/[^a-z0-9]/gi, "_")}_${script.scriptType}${extension}`;

    const blob = new Blob([script.scriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Script downloaded successfully!");
  };

  const handleDeleteScript = async (scriptId) => {
    if (window.confirm("Are you sure you want to delete this script?")) {
      await deleteMutation.mutateAsync(scriptId);
    }
  };

  const getValidationIcon = (script) => {
    if (!script.validationResult) return null;

    if (script.validationResult.is_valid) {
      return <CheckCircle color="success" />;
    } else if (script.validationResult.warnings?.length > 0) {
      return <Warning color="warning" />;
    } else {
      return <Error color="error" />;
    }
  };

  const getLanguage = (script) => {
    if (script.operatingSystem === "windows") {
      return script.scriptContent.includes("PowerShell")
        ? "powershell"
        : "batch";
    }
    return "bash";
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Loading scripts...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">Failed to load scripts</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <Assignment sx={{ mr: 1, verticalAlign: "middle" }} />
        Script Library
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Manage and view your generated compliance scripts.
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search scripts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>OS</InputLabel>
            <Select
              value={filterOS}
              label="OS"
              onChange={(e) => setFilterOS(e.target.value)}
            >
              <MenuItem value="all">All OS</MenuItem>
              <MenuItem value="windows">Windows</MenuItem>
              <MenuItem value="linux">Linux</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="audit">Audit</MenuItem>
              <MenuItem value="remediation">Remediation</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {
              setSearchTerm("");
              setFilterOS("all");
              setFilterType("all");
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Scripts Grid */}
      {filteredScripts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Assignment sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No scripts found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {scripts.length === 0
              ? "You haven't generated any scripts yet."
              : "No scripts match your current filters."}
          </Typography>
          <Button variant="contained" href="/generate">
            Generate Your First Script
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredScripts.map((script) => (
              <Grid item xs={12} md={6} lg={4} key={script._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={2}
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                      >
                        {script.policy}
                      </Typography>
                      {getValidationIcon(script)}
                    </Box>

                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip
                        label={script.operatingSystem}
                        size="small"
                        color="default"
                        icon={<Computer />}
                      />
                      <Chip
                        label={script.scriptType}
                        size="small"
                        color={
                          script.scriptType === "audit"
                            ? "primary"
                            : "secondary"
                        }
                        icon={
                          script.scriptType === "audit" ? (
                            <Visibility />
                          ) : (
                            <Security />
                          )
                        }
                      />
                      {script.useAI && (
                        <Chip label="AI Generated" size="small" color="info" />
                      )}
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph>
                      Created: {new Date(script.createdAt).toLocaleDateString()}
                    </Typography>

                    {script.validationResult && (
                      <Typography variant="body2" color="textSecondary">
                        Security Score: {script.validationResult.security_score}
                        /100
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewScript(script._id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownloadScript(script)}
                    >
                      Download
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteScript(script._id)}
                      disabled={deleteMutation.isLoading}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Script View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{selectedScript?.policy}</Typography>
            <Box display="flex" gap={1}>
              <Chip
                label={selectedScript?.operatingSystem}
                size="small"
                icon={<Computer />}
              />
              <Chip
                label={selectedScript?.scriptType}
                size="small"
                color={
                  selectedScript?.scriptType === "audit"
                    ? "primary"
                    : "secondary"
                }
              />
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedScript && (
            <SyntaxHighlighter
              language={getLanguage(selectedScript)}
              style={tomorrow}
              customStyle={{
                borderRadius: "8px",
                fontSize: "14px",
                maxHeight: "400px",
              }}
            >
              {selectedScript.scriptContent}
            </SyntaxHighlighter>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedScript && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                handleDownloadScript(selectedScript);
                setViewDialogOpen(false);
              }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScriptLibrary;
