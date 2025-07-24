const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ComplianceDocument = require("../models/ComplianceDocument");
const ComplianceScript = require("../models/ComplianceScript");
const User = require("../models/User");

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get dashboard analytics data
 * @access  Private
 */
router.get("/analytics", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Get user's documents and scripts, or all if admin
    const documentFilter = isAdmin ? {} : { uploadedBy: userId };
    const scriptFilter = isAdmin ? {} : { generatedBy: userId };

    const [
      totalDocuments,
      totalScripts,
      userDocuments,
      userScripts,
      recentScripts,
    ] = await Promise.all([
      ComplianceDocument.countDocuments(documentFilter),
      ComplianceScript.countDocuments(scriptFilter),
      ComplianceDocument.find(documentFilter).limit(5).sort({ createdAt: -1 }),
      ComplianceScript.find(scriptFilter).limit(5).sort({ createdAt: -1 }),
      ComplianceScript.find(scriptFilter)
        .populate("generatedBy", "username email")
        .limit(5)
        .sort({ createdAt: -1 }),
    ]);

    // Calculate success rate (scripts with validation success)
    const validatedScripts = await ComplianceScript.find({
      ...scriptFilter,
      "validationResult.is_valid": true,
    });
    const successRate =
      totalScripts > 0
        ? Math.round((validatedScripts.length / totalScripts) * 100)
        : 0;

    // Get compliance status distribution
    const complianceStatus = [
      { name: "Compliant", value: 75, color: "#4caf50" },
      { name: "Needs Attention", value: 20, color: "#ff9800" },
      { name: "Non-Compliant", value: 5, color: "#f44336" },
    ];

    // Generate weekly activity data (mock data for now)
    const weeklyActivity = [
      { day: "Mon", scripts: 8, documents: 2 },
      { day: "Tue", scripts: 12, documents: 3 },
      { day: "Wed", scripts: 6, documents: 1 },
      { day: "Thu", scripts: 15, documents: 4 },
      { day: "Fri", scripts: 10, documents: 2 },
      { day: "Sat", scripts: 4, documents: 1 },
      { day: "Sun", scripts: 2, documents: 0 },
    ];

    res.json({
      stats: {
        totalDocuments,
        totalScripts,
        scriptsGenerated: totalScripts,
        successRate,
      },
      recentScripts: recentScripts.map((script) => ({
        id: script._id,
        policy: script.policy,
        os: script.operatingSystem,
        type: script.scriptType,
        createdAt: script.createdAt,
      })),
      complianceStatus,
      weeklyActivity,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get user activity data
 * @access  Private
 */
router.get("/activity", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent activity
    const [recentDocuments, recentScripts] = await Promise.all([
      ComplianceDocument.find({ uploadedBy: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("filename status createdAt"),
      ComplianceScript.find({ generatedBy: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("policy scriptType operatingSystem createdAt"),
    ]);

    // Combine and sort by date
    const activity = [
      ...recentDocuments.map((doc) => ({
        type: "document",
        title: `Uploaded ${doc.filename}`,
        status: doc.status,
        date: doc.createdAt,
      })),
      ...recentScripts.map((script) => ({
        type: "script",
        title: `Generated ${script.scriptType} script for ${script.policy}`,
        status: "completed",
        date: script.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    res.json({ activity });
  } catch (error) {
    console.error("Activity error:", error);
    res.status(500).json({ error: "Failed to fetch activity data" });
  }
});

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get detailed statistics
 * @access  Private (Admin only)
 */
router.get("/stats", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [
      userCount,
      totalDocuments,
      totalScripts,
      scriptsToday,
      documentsToday,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      ComplianceDocument.countDocuments(),
      ComplianceScript.countDocuments(),
      ComplianceScript.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      ComplianceDocument.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    // Get script generation trends
    const scriptTrends = await ComplianceScript.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $limit: 30 },
    ]);

    res.json({
      overview: {
        userCount,
        totalDocuments,
        totalScripts,
        scriptsToday,
        documentsToday,
      },
      trends: {
        scriptGeneration: scriptTrends,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

module.exports = router;
