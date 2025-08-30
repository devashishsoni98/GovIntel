const mongoose = require("mongoose")

const grievanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "infrastructure",
          "sanitation",
          "water_supply",
          "electricity",
          "transportation",
          "healthcare",
          "education",
          "police",
          "other",
        ],
        message: "Please select a valid category",
      },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "resolved", "closed", "rejected"],
      default: "pending",
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    department: {
      type: String,
      enum: ["MUNICIPAL", "HEALTH", "EDUCATION", "TRANSPORT", "POLICE", "REVENUE", "OTHER"],
      required: true,
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      coordinates: {
        latitude: { 
          type: Number, 
          min: [-90, "Latitude must be between -90 and 90"], 
          max: [90, "Latitude must be between -90 and 90"] 
        },
        longitude: { 
          type: Number, 
          min: [-180, "Longitude must be between -180 and 180"], 
          max: [180, "Longitude must be between -180 and 180"] 
        },
      },
      landmark: {
        type: String,
        trim: true
      },
    },
    attachments: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        path: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    updates: [
      {
        message: { type: String, required: true },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "assigned", "in_progress", "resolved", "closed", "rejected"],
        },
        attachments: [
          {
            filename: String,
            originalName: String,
            mimetype: String,
            size: Number,
            path: String,
          },
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],
    aiAnalysis: {
      sentiment: {
        type: String,
        enum: ["positive", "neutral", "negative"],
        default: "neutral",
      },
      urgencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      keywords: [String],
      suggestedDepartment: String,
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    expectedResolutionDate: Date,
    actualResolutionDate: Date,
    resolutionTime: Number, // in hours
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better performance
grievanceSchema.index({ citizen: 1, createdAt: -1 })
grievanceSchema.index({ status: 1, createdAt: -1 })
grievanceSchema.index({ category: 1, department: 1 })
grievanceSchema.index({ assignedOfficer: 1, status: 1 })
grievanceSchema.index({ priority: 1, status: 1 })

// Virtual for grievance ID display
grievanceSchema.virtual("grievanceId").get(function () {
  return `GRV-${this._id.toString().slice(-8).toUpperCase()}`
})

// Virtual for days since creation
grievanceSchema.virtual("daysSinceCreation").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24))
})

// Calculate resolution time when status changes to resolved
grievanceSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "resolved" && !this.actualResolutionDate) {
    this.actualResolutionDate = new Date()
    this.resolutionTime = Math.round((this.actualResolutionDate - this.createdAt) / (1000 * 60 * 60))
  }
  next()
})

// Auto-assign department based on category
grievanceSchema.pre("save", function (next) {
  if (this.isNew && !this.department) {
    const categoryDepartmentMap = {
      infrastructure: "municipal",
      sanitation: "municipal",
      water_supply: "municipal",
      electricity: "municipal",
      revenue: "revenue",
      transportation: "transport",
      healthcare: "health",
      education: "education",
      police: "police",
      other: "municipal",
    }
    this.department = categoryDepartmentMap[this.category]?.toUpperCase() || "MUNICIPAL"
  }
  next()
})

module.exports = mongoose.model("Grievance", grievanceSchema)
