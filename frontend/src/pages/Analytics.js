import React from "react";
import { Paper, Typography, Box, Grid, Card, CardContent } from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  Assessment,
  BarChart,
} from "@mui/icons-material";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const Analytics = () => {
  // Mock data for demonstration
  const scriptGenerationData = [
    { month: "Jan", audit: 12, remediation: 8 },
    { month: "Feb", audit: 15, remediation: 12 },
    { month: "Mar", audit: 10, remediation: 6 },
    { month: "Apr", audit: 18, remediation: 14 },
    { month: "May", audit: 22, remediation: 18 },
    { month: "Jun", audit: 25, remediation: 20 },
  ];

  const osDistribution = [
    { name: "Windows", value: 65, color: "#1976d2" },
    { name: "Linux", value: 35, color: "#dc004e" },
  ];

  const complianceScores = [
    { framework: "CIS", score: 85 },
    { framework: "NIST", score: 78 },
    { framework: "ISO27001", score: 92 },
    { framework: "SOX", score: 88 },
  ];

  const weeklyActivity = [
    { day: "Mon", scripts: 8, documents: 2 },
    { day: "Tue", scripts: 12, documents: 3 },
    { day: "Wed", scripts: 6, documents: 1 },
    { day: "Thu", scripts: 15, documents: 4 },
    { day: "Fri", scripts: 10, documents: 2 },
    { day: "Sat", scripts: 4, documents: 1 },
    { day: "Sun", scripts: 2, documents: 0 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <AnalyticsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Analytics & Reports
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive analytics and insights for your compliance activities.
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Scripts
                  </Typography>
                  <Typography variant="h4">247</Typography>
                  <Typography variant="body2" color="success.main">
                    +12% this month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Security Score
                  </Typography>
                  <Typography variant="h4">86%</Typography>
                  <Typography variant="body2" color="success.main">
                    +3% improvement
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BarChart color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Documents Analyzed
                  </Typography>
                  <Typography variant="h4">42</Typography>
                  <Typography variant="body2" color="success.main">
                    +8 this week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AnalyticsIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4">94%</Typography>
                  <Typography variant="body2" color="success.main">
                    Excellent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Script Generation Trends */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Script Generation Trends
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={scriptGenerationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="audit" fill="#1976d2" name="Audit Scripts" />
                  <Bar
                    dataKey="remediation"
                    fill="#dc004e"
                    name="Remediation Scripts"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* OS Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Operating System Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {osDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box mt={2}>
              {osDistribution.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                  <Box
                    width={16}
                    height={16}
                    bgcolor={item.color}
                    borderRadius="50%"
                    mr={1}
                  />
                  <Typography variant="body2">
                    {item.name}: {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Compliance Framework Scores */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compliance Framework Scores
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={complianceScores} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="framework" type="category" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4caf50" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Activity
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="scripts"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Scripts"
                  />
                  <Line
                    type="monotone"
                    dataKey="documents"
                    stroke="#dc004e"
                    strokeWidth={2}
                    name="Documents"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Performance Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Insights
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Most Used Framework
                    </Typography>
                    <Typography variant="h4">CIS</Typography>
                    <Typography variant="body2" color="textSecondary">
                      42% of all generated scripts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Peak Activity Day
                    </Typography>
                    <Typography variant="h4">Thursday</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average 15 scripts generated
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Validation Success
                    </Typography>
                    <Typography variant="h4">94%</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Scripts pass validation first time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Export Options */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Export Reports
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Download detailed reports for compliance auditing and management
          review.
        </Typography>
        <Box display="flex" gap={2}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="subtitle2">Monthly Report</Typography>
            <Typography variant="body2" color="textSecondary">
              PDF • Last 30 days
            </Typography>
          </Card>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="subtitle2">Compliance Summary</Typography>
            <Typography variant="body2" color="textSecondary">
              Excel • All frameworks
            </Typography>
          </Card>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="subtitle2">Script Inventory</Typography>
            <Typography variant="body2" color="textSecondary">
              CSV • All scripts
            </Typography>
          </Card>
        </Box>
      </Paper>
    </Box>
  );
};

export default Analytics;
