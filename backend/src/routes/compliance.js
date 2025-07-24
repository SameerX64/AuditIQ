const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const { body, validationResult } = require("express-validator");

// Import models
const ComplianceDocument = require("../models/ComplianceDocument");
const ComplianceScript = require("../models/ComplianceScript");
const auth = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// AI/ML Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

/**
 * @route   POST /api/compliance/upload-document
 * @desc    Upload and analyze compliance document
 * @access  Private
 */
router.post(
  "/upload-document",
  auth,
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Create FormData for AI service
      const FormData = require("form-data");
      const formData = new FormData();
      formData.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // Send to AI service for analysis
      const response = await axios.post(
        "http://localhost:5001/analyze-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 seconds
        }
      );

      const analysisResult = response.data;

      // Save document record to database
      const complianceDoc = new ComplianceDocument({
        filename: req.file.originalname,
        uploadedBy: req.user.id,
        fileSize: req.file.size,
        analysisResult: analysisResult,
        policies: analysisResult.policies || [],
        status: analysisResult.extraction_success ? "analyzed" : "failed",
      });

      await complianceDoc.save();

      res.json({
        success: true,
        documentId: complianceDoc._id,
        analysis: analysisResult,
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({
        error: "Failed to process document",
        details: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/compliance/generate-script
 * @desc    Generate compliance script from policy
 * @access  Private
 */
router.post(
  "/generate-script",
  [
    auth,
    body("policy").notEmpty().withMessage("Policy is required"),
    body("auditRemediation")
      .isIn(["audit", "remediation"])
      .withMessage("Invalid audit/remediation type"),
    body("os").isIn(["windows", "linux"]).withMessage("Invalid OS type"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { policy, auditRemediation, os, useAI, remediationSteps } =
        req.body;

      // Send request to AI service
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/generate-script`,
        {
          requirements: [policy], // The AI service expects requirements array
          os: os || "windows",
          type: auditRemediation || "audit",
        },
        {
          timeout: 30000, // 30 seconds timeout
        }
      );

      const generatedScript = aiResponse.data.script || aiResponse.data;

      // Save script to database
      const complianceScript = new ComplianceScript({
        policy,
        scriptType: auditRemediation,
        operatingSystem: os,
        scriptContent: generatedScript,
        generatedBy: req.user.id,
        useAI: useAI || true,
      });

      await complianceScript.save();

      res.json({
        success: true,
        scriptId: complianceScript._id,
        script: generatedScript,
      });
    } catch (error) {
      console.error("Script generation error:", error);
      res.status(500).json({
        error: "Failed to generate script",
        details: error.response?.data?.error || error.message,
      });
    }
  }
);

/**
 * @route   POST /api/compliance/validate-script
 * @desc    Validate generated compliance script
 * @access  Private
 */
router.post(
  "/validate-script",
  [
    auth,
    body("script").notEmpty().withMessage("Script content is required"),
    body("os_type").isIn(["windows", "linux"]).withMessage("Invalid OS type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { script, os_type } = req.body;

      // Send to AI service for validation
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/validate-script`, {
        script,
        os_type,
      });

      res.json({
        success: true,
        validation: aiResponse.data,
      });
    } catch (error) {
      console.error("Script validation error:", error);
      res.status(500).json({
        error: "Failed to validate script",
        details: error.response?.data?.error || error.message,
      });
    }
  }
);

/**
 * @route   GET /api/compliance/documents
 * @desc    Get user's compliance documents
 * @access  Private
 */
router.get("/documents", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const documents = await ComplianceDocument.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("uploadedBy", "username email");

    const total = await ComplianceDocument.countDocuments({
      uploadedBy: req.user.id,
    });

    res.json({
      documents,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

/**
 * @route   GET /api/compliance/scripts
 * @desc    Get user's compliance scripts
 * @access  Private
 */
router.get("/scripts", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const scripts = await ComplianceScript.find({ generatedBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("generatedBy", "username email");

    const total = await ComplianceScript.countDocuments({
      generatedBy: req.user.id,
    });

    res.json({
      scripts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get scripts error:", error);
    res.status(500).json({ error: "Failed to fetch scripts" });
  }
});

/**
 * @route   GET /api/compliance/scripts/:id
 * @desc    Get specific compliance script
 * @access  Private
 */
router.get("/scripts/:id", auth, async (req, res) => {
  try {
    const script = await ComplianceScript.findOne({
      _id: req.params.id,
      generatedBy: req.user.id,
    }).populate("generatedBy", "username email");

    if (!script) {
      return res.status(404).json({ error: "Script not found" });
    }

    res.json(script);
  } catch (error) {
    console.error("Get script error:", error);
    res.status(500).json({ error: "Failed to fetch script" });
  }
});

/**
 * @route   DELETE /api/compliance/scripts/:id
 * @desc    Delete compliance script
 * @access  Private
 */
router.delete("/scripts/:id", auth, async (req, res) => {
  try {
    const script = await ComplianceScript.findOneAndDelete({
      _id: req.params.id,
      generatedBy: req.user.id,
    });

    if (!script) {
      return res.status(404).json({ error: "Script not found" });
    }

    res.json({ message: "Script deleted successfully" });
  } catch (error) {
    console.error("Delete script error:", error);
    res.status(500).json({ error: "Failed to delete script" });
  }
});

module.exports = router;
