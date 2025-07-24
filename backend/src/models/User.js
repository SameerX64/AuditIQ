const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["admin", "user", "auditor", "manager"],
      default: "user",
    },
    profile: {
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      organization: {
        type: String,
        trim: true,
      },
      department: {
        type: String,
        trim: true,
      },
      jobTitle: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String, // URL to avatar image
      },
    },
    preferences: {
      defaultOS: {
        type: String,
        enum: ["windows", "linux"],
        default: "windows",
      },
      defaultScriptType: {
        type: String,
        enum: ["audit", "remediation"],
        default: "audit",
      },
      useAIByDefault: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
    permissions: {
      canUploadDocuments: {
        type: Boolean,
        default: true,
      },
      canGenerateScripts: {
        type: Boolean,
        default: true,
      },
      canViewAllScripts: {
        type: Boolean,
        default: false,
      },
      canManageUsers: {
        type: Boolean,
        default: false,
      },
      canAccessAnalytics: {
        type: Boolean,
        default: false,
      },
    },
    statistics: {
      documentsUploaded: {
        type: Number,
        default: 0,
      },
      scriptsGenerated: {
        type: Number,
        default: 0,
      },
      scriptsExecuted: {
        type: Number,
        default: 0,
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ "profile.organization": 1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual for user display name
userSchema.virtual("displayName").get(function () {
  return this.fullName || this.username;
});

// Method to check if user has specific permission
userSchema.methods.hasPermission = function (permission) {
  if (this.role === "admin") return true; // Admin has all permissions
  return this.permissions[permission] || false;
};

// Method to update user statistics
userSchema.methods.updateStats = function (statType, increment = 1) {
  if (this.statistics.hasOwnProperty(statType)) {
    this.statistics[statType] += increment;
    this.statistics.lastActive = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to get user activity summary
userSchema.methods.getActivitySummary = function () {
  return {
    documentsUploaded: this.statistics.documentsUploaded,
    scriptsGenerated: this.statistics.scriptsGenerated,
    scriptsExecuted: this.statistics.scriptsExecuted,
    memberSince: this.createdAt,
    lastActive: this.statistics.lastActive,
    totalActivity:
      this.statistics.documentsUploaded +
      this.statistics.scriptsGenerated +
      this.statistics.scriptsExecuted,
  };
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Static method to find users by organization
userSchema.statics.findByOrganization = function (organization) {
  return this.find({
    "profile.organization": organization,
    isActive: true,
  });
};

// Static method to get user statistics
userSchema.statics.getUserStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
        adminUsers: {
          $sum: {
            $cond: [{ $eq: ["$role", "admin"] }, 1, 0],
          },
        },
        totalDocumentsUploaded: {
          $sum: "$statistics.documentsUploaded",
        },
        totalScriptsGenerated: {
          $sum: "$statistics.scriptsGenerated",
        },
      },
    },
  ]);
};

// Pre-save middleware to set permissions based on role
userSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("role")) {
    switch (this.role) {
      case "admin":
        this.permissions = {
          canUploadDocuments: true,
          canGenerateScripts: true,
          canViewAllScripts: true,
          canManageUsers: true,
          canAccessAnalytics: true,
        };
        break;
      case "manager":
        this.permissions = {
          canUploadDocuments: true,
          canGenerateScripts: true,
          canViewAllScripts: true,
          canManageUsers: false,
          canAccessAnalytics: true,
        };
        break;
      case "auditor":
        this.permissions = {
          canUploadDocuments: true,
          canGenerateScripts: true,
          canViewAllScripts: false,
          canManageUsers: false,
          canAccessAnalytics: false,
        };
        break;
      default: // 'user'
        this.permissions = {
          canUploadDocuments: true,
          canGenerateScripts: true,
          canViewAllScripts: false,
          canManageUsers: false,
          canAccessAnalytics: false,
        };
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
