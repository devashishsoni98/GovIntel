const express = require("express")
const User = require("../models/User")
const bcrypt = require("bcryptjs")

const router = express.Router()

// Debug route to check users (only in development)
router.get("/users", async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        message: "Debug routes only available in development",
      })
    }

    const users = await User.find({}).select("+password")

    const userInfo = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
    }))

    res.json({
      success: true,
      count: users.length,
      users: userInfo,
    })
  } catch (error) {
    console.error("Debug users error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    })
  }
})

// Debug route to test password comparison
router.post("/test-password", async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        message: "Debug routes only available in development",
      })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    console.log("Debug password test:", {
      email,
      providedPassword: password,
      storedPasswordExists: !!user.password,
      storedPasswordLength: user.password ? user.password.length : 0,
      storedPasswordSample: user.password ? user.password.substring(0, 10) + "..." : "none"
    });
    const isMatch = await user.comparePassword(password)

    res.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
        passwordMatch: isMatch,
        passwordLength: user.password ? user.password.length : 0
      },
    })
  } catch (error) {
    console.error("Debug password test error:", error)
    res.status(500).json({
      success: false,
      message: "Error testing password",
      error: error.message
    })
  }
})

module.exports = router
