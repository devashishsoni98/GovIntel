const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const multer = require("multer")

// Import routes
const authRoutes = require("./routes/auth")
const grievanceRoutes = require("./routes/grievances")
const userRoutes = require("./routes/users")
const analyticsRoutes = require("./routes/analytics")
const departmentRoutes = require("./routes/departments")
const adminRoutes = require("./routes/admin")
const aiRoutes = require("./routes/ai")

// Import models
const User = require("./models/User")

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173", // Vite default port
      "http://localhost:3000", // React default port
    ],
    credentials: true,
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Serve static files (uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/grievances", grievanceRoutes)
app.use("/api/users", userRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/ai", aiRoutes)

// Test route to verify API is working
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString()
  })
})

// Debug route to test password (REMOVE IN PRODUCTION)
app.post("/api/debug/test-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    const passwordMatch = await user.comparePassword(password);
    
    return res.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
        passwordMatch
      }
    });
  } catch (error) {
    console.error("Password test error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Debug route to view users (REMOVE IN PRODUCTION)
app.get("/api/debug/users", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Debug route to clear users (REMOVE IN PRODUCTION)
app.delete('/api/debug/clear-users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ success: true, message: 'All users deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "GovIntel Backend Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error)

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB per file.",
      })
    }
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Create default admin user after successful DB connection
    await createDefaultAdmin()
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

// Create default admin user (one-time setup)
const createDefaultAdmin = async () => {
  try {
    console.log("Checking for default admin user...")

    // Check if admin already exists
    const adminExists = await User.findOne({
      email: "admin@gmail.com",
      role: "admin",
    })

    if (adminExists) {
      console.log("✅ Default admin user already exists")
      return
    }

    console.log("Creating default admin user...")

    // Create admin user with plain text password - the model will hash it
    const admin = new User({
      name: "System Administrator",
      email: "admin@gmail.com",
      password: "123456", // PLAIN TEXT - will be hashed by the model
      role: "admin",
      phone: "+919999999999", // Valid international format
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await admin.save()

    console.log("✅ Default admin user created successfully!")
    console.log("📧 Email: admin@gmail.com")
    console.log("🔑 Password: 123456")
    console.log("👤 Role: admin")
    console.log("📱 Phone: +919999999999")
  } catch (error) {
    console.error("❌ Error creating default admin user:", error)
    console.error("Full error details:", error.message)
    // Don't exit the process, just log the error
  }
}

// Create some sample data for testing (optional)
const createSampleData = async () => {
  try {
    // Only create sample data in development
    if (process.env.NODE_ENV !== "development") {
      return
    }

    const userCount = await User.countDocuments()

    // If we already have users (other than admin), skip sample data creation
    if (userCount > 1) {
      console.log("Sample data already exists, skipping creation...")
      return
    }

    console.log("Creating sample users for testing...")

    // Create sample citizen
    const citizenExists = await User.findOne({ email: "citizen@example.com" })
    if (!citizenExists) {
      const citizen = new User({
        name: "John Citizen",
        email: "citizen@example.com",
        password: "password123", // PLAIN TEXT - will be hashed by the model
        role: "citizen",
        phone: "+919876543210", // Valid international format
        address: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      })

      await citizen.save()
      console.log("✅ Sample citizen created: citizen@example.com / password123")
    }

    // Create sample officer
    const officerExists = await User.findOne({ email: "officer@municipal.gov" })
    if (!officerExists) {
      const officer = new User({
        name: "Jane Officer",
        email: "officer@municipal.gov",
        password: "password123", // PLAIN TEXT - will be hashed by the model
        role: "officer",
        phone: "+919123456789", // Valid international format
        department: "municipal",
        address: {
          street: "456 Government Ave",
          city: "New York",
          state: "NY",
          zipCode: "10002",
        },
      })

      await officer.save()
      console.log("✅ Sample officer created: officer@municipal.gov / password123")
    }
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
    console.error("Full error details:", error.message)
  }
}

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB()

    // Create sample data if in development mode
    if (process.env.NODE_ENV === "development") {
      await createSampleData()
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
      console.log(`📱 API Base URL: http://localhost:${PORT}`)
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`)
      console.log("=".repeat(50))
      console.log("🔐 Test Accounts:")
      console.log("   Admin: admin@gmail.com / 123456")
      console.log("   Citizen: citizen@example.com / password123")
      console.log("   Officer: officer@municipal.gov / password123")
      console.log("   Officer Passcode: OFFICER2024")
      console.log("=".repeat(50))
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Promise Rejection:", err.message)
  // Close server & exit process
  process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message)
  process.exit(1)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  process.exit(0)
})

startServer()

module.exports = app