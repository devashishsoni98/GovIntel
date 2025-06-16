const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, department, address } = req.body

    console.log("Registration attempt:", { name, email, role, phone, department })

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Prevent admin registration through API
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be created through registration",
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

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    await user.updateLastLogin()

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toSafeObject(),
        token,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body

    console.log("Login attempt:", { email, role })

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and role",
      })
    }

    // Find user and include password (since it's excluded by default)
    const user = await User.findOne({ email }).select("+password")

    console.log("User found:", user ? { id: user._id, email: user.email, role: user.role } : "No user found")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials - user not found",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated. Please contact administrator.",
      })
    }

    // Verify role matches FIRST (before password check)
    if (user.role !== role) {
      const roleNames = {
        citizen: "Citizen",
        officer: "Officer",
        admin: "Administrator",
      }
      console.log("Role mismatch:", { userRole: user.role, requestedRole: role })
      return res.status(401).json({
        success: false,
        message: `Role mismatch. This account is registered as ${roleNames[user.role]}, but you selected ${roleNames[role]}.`,
      })
    }

    // Verify password
    console.log("Checking password...")
    const isPasswordValid = await user.comparePassword(password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials - incorrect password",
      })
    }

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    await user.updateLastLogin()

    console.log("Login successful for user:", user.email)

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toSafeObject(),
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, address, preferences } = req.body

    const user = await User.findById(req.user.id)

    if (name) user.name = name
    if (phone) user.phone = phone
    if (address) user.address = { ...user.address, ...address }
    if (preferences) user.preferences = { ...user.preferences, ...preferences }

    await user.save()

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: user.toSafeObject(),
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", auth, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  })
})

module.exports = router
