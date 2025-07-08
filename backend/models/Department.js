const mongoose = require("mongoose")

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, "Department code cannot exceed 10 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    categories: [{
      type: String,
      enum: [
        "infrastructure",
        "sanitation",
        "water_supply",
        "electricity",
        "transportation",
        "healthcare",
        "education",
        "police",
        "revenue",
        "other"
      ],
    }],
    officers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contactInfo: {
      email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
      },
      phone: {
        type: String,
        match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
    },
    workingHours: {
      start: {
        type: String,
        default: "09:00",
      },
      end: {
        type: String,
        default: "17:00",
      },
      workingDays: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    statistics: {
      totalGrievances: {
        type: Number,
        default: 0,
      },
      resolvedGrievances: {
        type: Number,
        default: 0,
      },
      avgResolutionTime: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes for better performance
departmentSchema.index({ name: 1 })
departmentSchema.index({ code: 1 })
departmentSchema.index({ categories: 1 })
departmentSchema.index({ isActive: 1 })

// Virtual for resolution rate
departmentSchema.virtual("resolutionRate").get(function () {
  if (this.statistics.totalGrievances === 0) return 0
  return Math.round((this.statistics.resolvedGrievances / this.statistics.totalGrievances) * 100)
})

// Virtual for officer count
departmentSchema.virtual("officerCount").get(function () {
  return this.officers ? this.officers.length : 0
})

// Method to update statistics
departmentSchema.methods.updateStatistics = async function () {
  const Grievance = mongoose.model("Grievance")
  
  const stats = await Grievance.aggregate([
    { $match: { department: this.code } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ["$status", "resolved"] }, { $ne: ["$resolutionTime", null] }] },
              "$resolutionTime",
              null
            ]
          }
        }
      }
    }
  ])

  if (stats.length > 0) {
    this.statistics.totalGrievances = stats[0].total
    this.statistics.resolvedGrievances = stats[0].resolved
    this.statistics.avgResolutionTime = Math.round(stats[0].avgResolutionTime || 0)
    this.statistics.lastUpdated = new Date()
    await this.save()
  }
}

// Static method to get department by category
departmentSchema.statics.findByCategory = function (category) {
  return this.findOne({ categories: category, isActive: true })
}

// Pre-save middleware to ensure working days default
departmentSchema.pre("save", function (next) {
  if (this.isNew && (!this.workingHours.workingDays || this.workingHours.workingDays.length === 0)) {
    this.workingHours.workingDays = ["monday", "tuesday", "wednesday", "thursday", "friday"]
  }
  next()
})

module.exports = mongoose.model("Department", departmentSchema)