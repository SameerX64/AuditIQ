const mongoose = require("mongoose");

const complianceScriptSchema = new mongoose.Schema(
  {
    policy: {
      type: String,
      required: true,
      trim: true,
    },
    policyDescription: {
      type: String,
      trim: true,
    },
    scriptType: {
      type: String,
      enum: ["audit", "remediation"],
      required: true,
    },
    operatingSystem: {
      type: String,
      enum: ["windows", "linux"],
      required: true,
    },
    scriptContent: {
      type: String,
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceDocument",
    },
    useAI: {
      type: Boolean,
      default: true,
    },
    aiModel: {
      type: String,
      default: "gemini-pro",
    },
    validationResult: {
      is_valid: {
        type: Boolean,
        default: true,
      },
      syntax_errors: [String],
      warnings: [String],
      suggestions: [String],
      security_score: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
      validated_at: Date,
    },
    metadata: {
      complexity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      estimatedRuntime: String, // e.g., "< 1 minute", "5-10 minutes"
      requiresAdminPrivileges: {
        type: Boolean,
        default: false,
      },
      requiresReboot: {
        type: Boolean,
        default: false,
      },
      framework: String, // CIS, NIST, etc.
      controlId: String, // e.g., "CIS-1.1.1"
      category: String, // e.g., "Access Control", "Audit Policy"
    },
    executionHistory: [
      {
        executedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        executedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["success", "failed", "partial"],
          required: true,
        },
        output: String,
        errorMessage: String,
        environment: String, // e.g., "production", "test", "dev"
      },
    ],
    status: {
      type: String,
      enum: ["draft", "validated", "approved", "deprecated"],
      default: "draft",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    version: {
      type: String,
      default: "1.0.0",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
complianceScriptSchema.index({ generatedBy: 1, createdAt: -1 });
complianceScriptSchema.index({ operatingSystem: 1, scriptType: 1 });
complianceScriptSchema.index({ status: 1 });
complianceScriptSchema.index({ "metadata.framework": 1 });
complianceScriptSchema.index({ "metadata.controlId": 1 });
complianceScriptSchema.index({ tags: 1 });

// Virtual for script file extension
complianceScriptSchema.virtual("fileExtension").get(function () {
  if (this.operatingSystem === "windows") {
    return this.scriptContent.includes("PowerShell") ? ".ps1" : ".bat";
  } else if (this.operatingSystem === "linux") {
    return ".sh";
  }
  return ".txt";
});

// Virtual for estimated script length
complianceScriptSchema.virtual("scriptLength").get(function () {
  if (!this.scriptContent) return 0;
  return this.scriptContent.split("\n").length;
});

// Method to get latest execution status
complianceScriptSchema.methods.getLatestExecution = function () {
  if (this.executionHistory.length === 0) return null;
  return this.executionHistory[this.executionHistory.length - 1];
};

// Method to add execution result
complianceScriptSchema.methods.addExecutionResult = function (executionData) {
  this.executionHistory.push(executionData);
  if (this.executionHistory.length > 10) {
    // Keep only last 10 execution records
    this.executionHistory = this.executionHistory.slice(-10);
  }
  return this.save();
};

// Static method to find scripts by framework
complianceScriptSchema.statics.findByFramework = function (framework) {
  return this.find({ "metadata.framework": framework });
};

// Static method to find scripts by control ID
complianceScriptSchema.statics.findByControlId = function (controlId) {
  return this.find({ "metadata.controlId": controlId });
};

// Static method to get popular scripts
complianceScriptSchema.statics.getPopularScripts = function (limit = 10) {
  return this.aggregate([
    {
      $addFields: {
        executionCount: { $size: "$executionHistory" },
      },
    },
    {
      $sort: { executionCount: -1, createdAt: -1 },
    },
    {
      $limit: limit,
    },
  ]);
};

// Pre-save middleware to update metadata
complianceScriptSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("scriptContent")) {
    const content = this.scriptContent.toLowerCase();

    // Detect if requires admin privileges
    const adminKeywords = [
      "sudo",
      "administrator",
      "elevated",
      "run as administrator",
      "privilege",
    ];
    this.metadata.requiresAdminPrivileges = adminKeywords.some((keyword) =>
      content.includes(keyword)
    );

    // Detect if requires reboot
    const rebootKeywords = [
      "reboot",
      "restart",
      "shutdown -r",
      "restart-computer",
    ];
    this.metadata.requiresReboot = rebootKeywords.some((keyword) =>
      content.includes(keyword)
    );

    // Estimate complexity based on script length and content
    const lines = this.scriptContent.split("\n").length;
    if (lines < 10) {
      this.metadata.complexity = "low";
    } else if (lines < 50) {
      this.metadata.complexity = "medium";
    } else {
      this.metadata.complexity = "high";
    }
  }

  next();
});

module.exports = mongoose.model("ComplianceScript", complianceScriptSchema);
