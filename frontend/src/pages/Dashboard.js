import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Description,
  Code,
  Security,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Assignment,
  Computer,
  CloudUpload,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery } from "react-query";
import { useAuth } from "../contexts/AuthContext";
import complianceService from "../services/complianceService";

const Dashboard = () => {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery("dashboardData", complianceService.getDashboardData, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mock data for demonstration
  const mockData = {
    stats: {
      totalDocuments: 12,
      totalScripts: 45,
      scriptsGenerated: 38,
      successRate: 92,
    },
    recentScripts: [
      {
        id: 1,
        policy: "Password Policy Audit",
        os: "Windows",
        type: "audit",
        createdAt: "2024-01-15",
      },
      {
        id: 2,
        policy: "Firewall Configuration",
        os: "Linux",
        type: "remediation",
        createdAt: "2024-01-14",
      },
      {
        id: 3,
        policy: "User Account Control",
        os: "Windows",
        type: "audit",
        createdAt: "2024-01-13",
      },
    ],
    complianceStatus: [
      { name: "Compliant", value: 75, color: "#4caf50" },
      { name: "Needs Attention", value: 20, color: "#ff9800" },
      { name: "Non-Compliant", value: 5, color: "#f44336" },
    ],
    weeklyActivity: [
      { day: "Mon", scripts: 8, documents: 2 },
      { day: "Tue", scripts: 12, documents: 3 },
      { day: "Wed", scripts: 6, documents: 1 },
      { day: "Thu", scripts: 15, documents: 4 },
      { day: "Fri", scripts: 10, documents: 2 },
      { day: "Sat", scripts: 4, documents: 1 },
      { day: "Sun", scripts: 2, documents: 0 },
    ],
  };

  const data = dashboardData || mockData;

  // Quick Stats Component
  const QuickStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Description color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Documents
                </Typography>
                <Typography variant="h4">
                  {data.stats.totalDocuments}
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
              <Code color="secondary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Scripts Generated
                </Typography>
                <Typography variant="h4">
                  {data.stats.scriptsGenerated}
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
              <Security color="success" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h4">{data.stats.successRate}%</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUp color="info" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Scripts
                </Typography>
                <Typography variant="h4">{data.stats.totalScripts}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Recent Activity Component
  const RecentActivity = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Scripts
      </Typography>
      <List>
        {data.recentScripts.map((script, index) => (
          <React.Fragment key={script.id}>
            <ListItem>
              <ListItemIcon>
                {script.type === "audit" ? (
                  <Assignment color="primary" />
                ) : (
                  <Security color="secondary" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={script.policy}
                secondary={
                  <Box>
                    <Chip
                      label={script.os}
                      size="small"
                      color="default"
                      sx={{ mr: 1 }}
                      icon={<Computer />}
                    />
                    <Chip
                      label={script.type}
                      size="small"
                      color={script.type === "audit" ? "primary" : "secondary"}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      {new Date(script.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            {index < data.recentScripts.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <Box textAlign="center" mt={2}>
        <Button variant="outlined" href="/scripts">
          View All Scripts
        </Button>
      </Box>
    </Paper>
  );

  // Compliance Status Chart
  const ComplianceChart = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Compliance Status
      </Typography>
      <Box height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.complianceStatus}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.complianceStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box mt={2}>
        {data.complianceStatus.map((item, index) => (
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
  );

  // Weekly Activity Chart
  const ActivityChart = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Weekly Activity
      </Typography>
      <Box height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="scripts" fill="#1976d2" name="Scripts" />
            <Bar dataKey="documents" fill="#dc004e" name="Documents" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data. Using sample data for demonstration.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          <DashboardIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back, {user?.username || user?.email}! Here's your compliance
          overview.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Box mb={4}>
        <QuickStats />
      </Box>

      {/* Charts and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <RecentActivity />
        </Grid>
        <Grid item xs={12} md={6}>
          <ComplianceChart />
        </Grid>
        <Grid item xs={12}>
          <ActivityChart />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<CloudUpload />}
              href="/upload"
            >
              Upload Document
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Code />}
              href="/generate"
            >
              Generate Script
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Assignment />}
              href="/scripts"
            >
              View Scripts
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<TrendingUp />}
              href="/analytics"
            >
              Analytics
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
