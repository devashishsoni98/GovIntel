const express = require("express")
const Department = require("../models/Department")
const User = require("../models/User")
const Grievance = require("../models/Grievance")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/departments
// @desc    Get all departments
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { active = true } = req.query
    
    const filter = active === "false" ? {} : { isActive: true }
    
    const departments = await Department.find(filter)
      .populate("officers", "name email")
      .populate("head", "name email")
      .sort({ name: 1 })

    res.json({
      success: true,
      data: departments
    })
  } catch (error) {
    console.error("Get departments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments"
    })
  }
})

// @route   GET /api/departments/:id
// @desc    Get single department
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("officers", "name email phone")
      .populate("head", "name email phone")

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    res.json({
      success: true,
      data: department
    })
  } catch (error) {
    console.error("Get department error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch department"
    })
  }
})

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const {
      name,
      code,
      description,
      categories,
      contactInfo,
      workingHours
    } = req.body

    // Check if department already exists
    const existingDept = await Department.findOne({
      $or: [{ name }, { code }]
    })

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: "Department with this name or code already exists"
      })
    }

    const department = new Department({
      name,
      code: code.toUpperCase(),
      description,
      categories,
      contactInfo,
      workingHours
    })

    await department.save()

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department
    })
  } catch (error) {
    console.error("Create department error:", error)
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to create department"
    })
  }
})

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const department = await Department.findById(req.params.id)

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    const {
      name,
      code,
      description,
      categories,
      contactInfo,
      workingHours,
      isActive
    } = req.body

    // Check for duplicate name/code (excluding current department)
    if (name || code) {
      const existingDept = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(name ? [{ name }] : []),
          ...(code ? [{ code: code.toUpperCase() }] : [])
        ]
      })

      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: "Department with this name or code already exists"
        })
      }
    }

    // Update fields
    if (name) department.name = name
    if (code) department.code = code.toUpperCase()
    if (description !== undefined) department.description = description
    if (categories) department.categories = categories
    if (contactInfo) department.contactInfo = { ...department.contactInfo, ...contactInfo }
    if (workingHours) department.workingHours = { ...department.workingHours, ...workingHours }
    if (isActive !== undefined) department.isActive = isActive

    await department.save()

    await department.populate("officers", "name email")
    await department.populate("head", "name email")

    res.json({
      success: true,
      message: "Department updated successfully",
      data: department
    })
  } catch (error) {
    console.error("Update department error:", error)
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to update department"
    })
  }
})

// @route   POST /api/departments/:id/officers
// @desc    Add officer to department
// @access  Private (Admin only)
router.post("/:id/officers", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const { officerId } = req.body

    const department = await Department.findById(req.params.id)
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    const officer = await User.findById(officerId)
    if (!officer || officer.role !== "officer") {
      return res.status(400).json({
        success: false,
        message: "Invalid officer ID"
      })
    }

    // Check if officer is already in department
    if (department.officers.includes(officerId)) {
      return res.status(400).json({
        success: false,
        message: "Officer is already assigned to this department"
      })
    }

    // Add officer to department
    department.officers.push(officerId)
    await department.save()

    // Update officer's department
    officer.department = department.code
    await officer.save()

    await department.populate("officers", "name email")

    res.json({
      success: true,
      message: "Officer added to department successfully",
      data: department
    })
  } catch (error) {
    console.error("Add officer error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to add officer to department"
    })
  }
})

// @route   DELETE /api/departments/:id/officers/:officerId
// @desc    Remove officer from department
// @access  Private (Admin only)
router.delete("/:id/officers/:officerId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const department = await Department.findById(req.params.id)
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    const officerId = req.params.officerId

    // Remove officer from department
    department.officers = department.officers.filter(
      id => id.toString() !== officerId
    )
    await department.save()

    // Update officer's department
    const officer = await User.findById(officerId)
    if (officer) {
      officer.department = undefined
      await officer.save()
    }

    await department.populate("officers", "name email")

    res.json({
      success: true,
      message: "Officer removed from department successfully",
      data: department
    })
  } catch (error) {
    console.error("Remove officer error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to remove officer from department"
    })
  }
})

// @route   GET /api/departments/:id/statistics
// @desc    Get department statistics
// @access  Private
router.get("/:id/statistics", auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    // Check access permissions
    if (req.user.role === "officer" && req.user.department !== department.code) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      })
    }

    // Update statistics
    await department.updateStatistics()

    // Get detailed statistics
    const detailedStats = await Grievance.aggregate([
      { $match: { department: department.code } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])

    const categoryStats = await Grievance.aggregate([
      { $match: { department: department.code } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ])

    const priorityStats = await Grievance.aggregate([
      { $match: { department: department.code } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ])

    res.json({
      success: true,
      data: {
        department: department.name,
        summary: department.statistics,
        resolutionRate: department.resolutionRate,
        statusBreakdown: detailedStats,
        categoryBreakdown: categoryStats,
        priorityBreakdown: priorityStats
      }
    })
  } catch (error) {
    console.error("Get department statistics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch department statistics"
    })
  }
})

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const department = await Department.findById(req.params.id)
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    // Check if department has active grievances
    const activeGrievances = await Grievance.countDocuments({
      department: department.code,
      status: { $in: ["pending", "in_progress"] }
    })

    if (activeGrievances > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${activeGrievances} active grievances`
      })
    }

    // Remove department reference from officers
    await User.updateMany(
      { department: department.code },
      { $unset: { department: 1 } }
    )

    await Department.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Department deleted successfully"
    })
  } catch (error) {
    console.error("Delete department error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete department"
    })
  }
})

module.exports = router