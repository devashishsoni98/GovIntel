const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    // Only admins can access user stats
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const [totalUsers, totalCitizens, totalOfficers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "citizen", isActive: true }),
      User.countDocuments({ role: "officer", isActive: true }),
    ])

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCitizens,
        totalOfficers,
      },
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching user statistics",
    })
  }
})

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // Only admins can access user list
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const { page = 1, limit = 10, role, department, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build query
    const query = { isActive: true }

    if (role) query.role = role
    if (department) query.department = department

    // Search functionality
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 }

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort(sort).skip(skip).limit(Number.parseInt(limit)),
      User.countDocuments(query),
    ])

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
          limit: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    })
  }
})

module.exports = router
