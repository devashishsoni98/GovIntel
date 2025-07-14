const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Grievance = require("../models/Grievance");
const auth = require("../middleware/auth");
const AIAnalysisEngine = require("../utils/aiAnalysis");
const SmartRoutingEngine = require("../utils/smartRouting");

const router = express.Router();

// Add this function to map category to department
const getCategoryDepartment = (category) => {
  const categoryDepartmentMap = {
    infrastructure: "municipal",
    sanitation: "municipal",
    water_supply: "municipal",
    electricity: "municipal",
    transportation: "transport",
    healthcare: "health",
    education: "education",
    police: "police",
    other: "municipal",
  }
  return (categoryDepartmentMap[category] || "municipal").toUpperCase()
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/grievances";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Get dashboard analytics for citizens
router.get("/analytics/dashboard", auth, async (req, res) => {
  try {
    console.log("=== ANALYTICS DASHBOARD DEBUG ===");
    console.log("req.user:", req.user);
    console.log("=== END ANALYTICS DEBUG ===");

    // Build filter based on user role
    const filter = {};
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id;
    } else if (req.user.role === "officer") {
      filter.department = req.user.department;
    }

    // Get total grievances count
    const totalGrievances = await Grievance.countDocuments(filter);

    // Get status-wise counts
    const statusStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get category-wise counts
    const categoryStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get priority-wise counts
    const priorityStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent grievances (last 5)
    const recentGrievances = await Grievance.find(filter)
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Grievance.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Calculate resolution rate
    const resolvedCount = statusStats.find((s) => s._id === "resolved")?.count || 0;
    const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0;

    // Calculate average resolution time for resolved grievances
    const resolvedGrievances = await Grievance.find({
      ...filter,
      status: "resolved",
      resolutionTime: { $exists: true },
    });

    const avgResolutionTime =
      resolvedGrievances.length > 0
        ? Math.round(
            resolvedGrievances.reduce((sum, g) => sum + (g.resolutionTime || 0), 0) / resolvedGrievances.length,
          )
        : 0;

    // Format the response
    const dashboardData = {
      summary: {
        total: totalGrievances,
        pending: statusStats.find((s) => s._id === "pending")?.count || 0,
        inProgress: statusStats.find((s) => s._id === "in_progress")?.count || 0,
        resolved: resolvedCount,
        closed: statusStats.find((s) => s._id === "closed")?.count || 0,
        rejected: statusStats.find((s) => s._id === "rejected")?.count || 0,
        resolutionRate,
        avgResolutionTime,
      },
      statusStats: statusStats.map((stat) => ({
        status: stat._id,
        count: stat.count,
      })),
      categoryStats: categoryStats.map((stat) => ({
        category: stat._id,
        count: stat.count,
      })),
      priorityStats: priorityStats.map((stat) => ({
        priority: stat._id,
        count: stat.count,
      })),
      recentGrievances,
      monthlyTrend: monthlyTrend.map((trend) => ({
        month: `${trend._id.year}-${String(trend._id.month).padStart(2, "0")}`,
        count: trend.count,
      })),
    };

    console.log("Dashboard data:", dashboardData);

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: error.message,
    });
  }
});

// Create a new grievance
router.post("/", auth, upload.array("attachments", 5), async (req, res) => {
  try {
    console.log("=== BACKEND ROUTE DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("req.user:", req.user);
    console.log("=== END BACKEND DEBUG ===");

    const {
      title,
      description,
      category,
      department,
      priority,
      location,
      isAnonymous,
      expectedResolutionDate,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !department) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and department are required",
        received: { title, description, category, department }
      });
    }

    // Parse location if it's a string
    let parsedLocation;
    try {
      parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
      });
    }

    // Validate location
    if (!parsedLocation || !parsedLocation.address) {
      return res.status(400).json({
        success: false,
        message: "Location with address is required",
      });
    }

    // Create grievance data
    const grievanceData = {
      title: title.trim(),
      description: description.trim(),
      category,
      department,
      priority: priority || "medium",
      location: parsedLocation,
      isAnonymous: isAnonymous === "true" || isAnonymous === true,
      citizen: req.user.id,
    };

    // Add expected resolution date if provided
    if (expectedResolutionDate) {
      grievanceData.expectedResolutionDate = new Date(expectedResolutionDate);
    }

    // Add file attachments if any
    if (req.files && req.files.length > 0) {
      grievanceData.attachments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));
    }

    console.log("Creating grievance with data:", grievanceData);

    // Create and save the grievance
    const grievance = new Grievance(grievanceData);
    await grievance.save();

    // Perform AI analysis and smart routing
    try {
      // AI Analysis
      const analysisResult = await AIAnalysisEngine.analyzeGrievance(
        grievance.title,
        grievance.description,
        grievance.category
      );

      // Update grievance with AI analysis
      grievance.aiAnalysis = {
        sentiment: analysisResult.sentiment,
        urgencyScore: analysisResult.urgencyScore,
        keywords: analysisResult.keywords,
        suggestedDepartment: analysisResult.suggestedDepartment,
        confidence: analysisResult.confidence
      };

      // Update priority based on AI urgency analysis
      if (analysisResult.urgencyLevel === 'urgent' && grievance.priority !== 'urgent') {
        grievance.priority = 'urgent';
      } else if (analysisResult.urgencyLevel === 'high' && grievance.priority === 'medium') {
        grievance.priority = 'high';
      }

      await grievance.save();

      // Smart routing - auto-assign to best officer
      console.log("Starting auto-assignment for grievance:", grievance._id)
      const routingResult = await SmartRoutingEngine.autoAssignGrievance(grievance._id)
      
      if (routingResult.success) {
        console.log("Auto-assignment successful:", routingResult.routing?.assignedOfficer?.name)
        // Reload the grievance to get the updated assignment
        await grievance.populate([
          { path: "citizen", select: "name email" },
          { path: "assignedOfficer", select: "name email department" }
        ])
      } else {
        console.log("Auto-assignment failed:", routingResult.error)
        // Continue without assignment - grievance will remain unassigned
      }

    } catch (aiError) {
      console.error("AI/Routing error (non-blocking):", aiError);
      // Continue without AI analysis if it fails
    }

    // Ensure grievance is populated for response
    if (!grievance.populated('citizen')) {
      await grievance.populate([
        { path: "citizen", select: "name email" },
        { path: "assignedOfficer", select: "name email department" }
      ])
    }
    res.status(201).json({
      success: true,
      message: "Grievance created successfully",
      data: grievance,
    });
  } catch (error) {
    console.error("Create grievance error:", error);
    
    // Clean up uploaded files if grievance creation failed
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create grievance",
    });
  }
});

// @route   POST /api/grievances/:id/analyze
// @desc    Re-run AI analysis on a grievance
// @access  Private (Officer/Admin)
router.post("/:id/analyze", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can trigger analysis."
      });
    }

    const result = await AIAnalysisEngine.updateGrievanceWithAnalysis(req.params.id);
    
    if (result.success) {
      res.json({
        success: true,
        message: "AI analysis completed successfully",
        data: {
          grievance: result.grievance,
          analysis: result.analysis
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error("Manual AI analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform AI analysis"
    });
  }
});

// @route   POST /api/grievances/:id/reassign
// @desc    Reassign grievance to different officer
// @access  Private (Admin only)
router.post("/:id/reassign", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const { officerId } = req.body;
    
    if (!officerId) {
      return res.status(400).json({
        success: false,
        message: "Officer ID is required"
      });
    }

    const result = await SmartRoutingEngine.reassignGrievance(
      req.params.id,
      officerId,
      req.user.id
    );

    if (result.success) {
      await result.grievance.populate([
        { path: "citizen", select: "name email" },
        { path: "assignedOfficer", select: "name email department" }
      ]);

      res.json({
        success: true,
        message: result.message,
        data: result.grievance
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error("Reassign grievance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reassign grievance"
    });
  }
});

// @route   POST /api/grievances/:id/auto-assign
// @desc    Trigger auto-assignment for unassigned grievance
// @access  Private (Officer/Admin)
router.post("/:id/auto-assign", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const result = await SmartRoutingEngine.autoAssignGrievance(req.params.id);
    
    if (result.success) {
      await result.grievance.populate([
        { path: "citizen", select: "name email" },
        { path: "assignedOfficer", select: "name email department" }
      ]);

      res.json({
        success: true,
        message: "Auto-assignment completed successfully",
        data: {
          grievance: result.grievance,
          routing: result.routing
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error("Auto-assign error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to auto-assign grievance"
    });
  }
});

// Get all grievances with filters
router.get("/", auth, async (req, res) => {
  try {
    console.log("=== GET GRIEVANCES DEBUG ===");
    console.log("req.query:", req.query);
    console.log("req.user:", req.user);
    console.log("=== END GET DEBUG ===");

    const {
      status,
      category,
      department,
      priority,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    // Role-based filtering
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id;
    } else if (req.user.role === "officer") {
      // For officers, show grievances assigned to them OR in their department
      filter.$or = [
        { assignedOfficer: req.user.id },
        { department: req.user.department, assignedOfficer: null }
      ]
    }

    // Apply additional filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department && req.user.role === "admin") {
      // For admin department filter, override the base filter
      delete filter.$or
      filter.department = department
    }
    if (priority) filter.priority = priority;

    console.log("Filter object:", filter);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get grievances with pagination
    const grievances = await Grievance.find(filter)
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email department")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Found grievances:", grievances.length);

    // Get total count for pagination
    const total = await Grievance.countDocuments(filter);

    res.json({
      success: true,
      data: grievances,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Get grievances error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch grievances",
      error: error.message
    });
  }
});

// Get a single grievance by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email department")
      .populate("updates.updatedBy", "name email");

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found",
      });
    }

    // Check if user has permission to view this grievance
    if (
      req.user.role === "citizen" &&
      grievance.citizen._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      req.user.role === "officer" &&
      grievance.department !== req.user.department
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: grievance,
    });
  } catch (error) {
    console.error("Get grievance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch grievance",
    });
  }
});

// Update grievance status (only for officers and admins)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    // Check if user has permission to update status
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can update status.",
      });
    }

    const { status, comment } = req.body;
    const grievanceId = req.params.id;

    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found",
      });
    }

    // Check if officer has permission to update this grievance
    if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null;
      const grievanceDepartment = grievance.department ? grievance.department.toUpperCase() : null;
      const isAssignedToUser = grievance.assignedOfficer && grievance.assignedOfficer.toString() === req.user.id;
      const isSameDepartment = userDepartment && grievanceDepartment === userDepartment;
      
      if (!isAssignedToUser && !isSameDepartment) {
        return res.status(403).json({
          success: false,
          message: "Access denied - you can only update grievances assigned to you or in your department",
        });
      }
    }

    // Update grievance
    grievance.status = status;
    if (comment) {
      grievance.updates.push({
        message: comment,
        status,
        updatedBy: req.user.id,
        timestamp: new Date(),
      });
    }

    if (status === "in_progress" && !grievance.assignedOfficer) {
      grievance.assignedOfficer = req.user.id;
    }

    await grievance.save();

    await grievance.populate([
      { path: "citizen", select: "name email" },
      { path: "assignedOfficer", select: "name email department" },
      { path: "updates.updatedBy", select: "name email" }
    ]);

    res.json({
      success: true,
      message: "Grievance status updated successfully",
      data: grievance,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update grievance status",
    });
  }
});

// Add feedback to a resolved grievance
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const grievanceId = req.params.id;

    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found",
      });
    }

    // Check if user is the one who submitted the grievance
    if (grievance.citizen.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only provide feedback for your own grievances",
      });
    }

    // Check if grievance is resolved
    if (grievance.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Feedback can only be provided for resolved grievances",
      });
    }

    // Add feedback
    grievance.feedback = {
      rating: parseInt(rating),
      comment,
      submittedAt: new Date(),
    };

    await grievance.save();

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      data: grievance,
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
});

// Get grievance statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    // Build filter based on user role
    const filter = {};
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id;
    } else if (req.user.role === "officer") {
      filter.department = req.user.department;
    }

    const stats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        categoryStats,
        priorityStats,
      },
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",      
    });
  }
});

module.exports = router;