const express = require("express")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
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

    const { page = 1, limit = 10, role, department, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build query
    const query = {}

    // Handle status filter
    if (status === "active") {
      query.isActive = true
    } else if (status === "inactive") {
      query.isActive = false
    }
    // If status is empty, show all users (no filter)

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

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    // Only admins can create users
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const { name, email, password, role, phone, department, address } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || "citizen",
      phone,
      department,
      address,
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user.toSafeObject(),
    })
  } catch (error) {
    console.error("Create user error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error during user creation",
    })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    // Only admins can update users
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const { name, email, role, phone, department, address, password } = req.body

    // Check for duplicate email (excluding current user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email
    if (role) user.role = role
    if (phone) user.phone = phone
    if (department) user.department = department
    if (address) user.address = { ...user.address, ...address }
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(12)
      user.password = await bcrypt.hash(password, salt)
    }

    await user.save()

    res.json({
      success: true,
      message: "User updated successfully",
      data: user.toSafeObject(),
    })
  } catch (error) {
    console.error("Update user error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error during user update",
    })
  }
})

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      })
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during user deletion",
    })
  }
})

// @route   PATCH /api/users/:id/status
// @desc    Toggle user active status (Admin only)
// @access  Private
router.patch("/:id/status", auth, async (req, res) => {
  try {
    // Only admins can change user status
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      })
    }

    const { isActive } = req.body
    user.isActive = isActive
    await user.save()

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user.toSafeObject(),
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during status update",
    })
  }
})

// @route   GET /api/users/:id
// @desc    Get single user (Admin only)
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    // Only admins can view individual users
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user.toSafeObject(),
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    })
  }
})

module.exports = router
