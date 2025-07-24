const mongoose = require("mongoose");

const complianceDocumentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    analysisResult: {
      total_policies: {
        type: Number,
        default: 0,
      },
      policies: [
        {
          type: String,
        },
      ],
      categorized_policies: {
        critical: [String],
        high: [String],
        medium: [String],
        low: [String],
      },
      analysis_summary: String,
      extraction_success: {
        type: Boolean,
        default: false,
      },
    },
    policies: [
      {
        text: String,
        severity: {
          type: String,
          enum: ["critical", "high", "medium", "low"],
          default: "medium",
        },
        category: String,
        scriptsGenerated: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ComplianceScript",
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["uploaded", "analyzing", "analyzed", "failed"],
      default: "uploaded",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      framework: String, // e.g., 'CIS', 'NIST', 'ISO27001'
      version: String,
      applicableOS: [String], // ['windows', 'linux', 'macos']
      complianceLevel: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
complianceDocumentSchema.index({ uploadedBy: 1, createdAt: -1 });
complianceDocumentSchema.index({ status: 1 });
complianceDocumentSchema.index({ "metadata.framework": 1 });
complianceDocumentSchema.index({ "policies.severity": 1 });

// Virtual for document URL (if storing files)
complianceDocumentSchema.virtual("documentUrl").get(function () {
  if (this.filename) {
    return `/uploads/documents/${this._id}/${this.filename}`;
  }
  return null;
});

// Method to get policy count by severity
complianceDocumentSchema.methods.getPolicyCountBySeverity = function () {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  this.policies.forEach((policy) => {
    if (counts.hasOwnProperty(policy.severity)) {
      counts[policy.severity]++;
    }
  });

  return counts;
};

// Static method to get documents by framework
complianceDocumentSchema.statics.findByFramework = function (framework) {
  return this.find({ "metadata.framework": framework });
};

// Pre-save middleware to update metadata based on filename
complianceDocumentSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("filename")) {
    const filename = this.filename.toLowerCase();

    // Detect framework from filename
    if (filename.includes("cis")) {
      this.metadata.framework = "CIS";
    } else if (filename.includes("nist")) {
      this.metadata.framework = "NIST";
    } else if (filename.includes("iso")) {
      this.metadata.framework = "ISO27001";
    }

    // Detect OS from filename
    this.metadata.applicableOS = [];
    if (filename.includes("windows")) {
      this.metadata.applicableOS.push("windows");
    }
    if (filename.includes("linux")) {
      this.metadata.applicableOS.push("linux");
    }
    if (filename.includes("ubuntu")) {
      this.metadata.applicableOS.push("linux");
    }
  }

  next();
});

module.exports = mongoose.model("ComplianceDocument", complianceDocumentSchema);
