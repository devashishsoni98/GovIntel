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
    revenue: "revenue",
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
    const uploadDir = path.join(__dirname, "..", "uploads", "grievances");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + sanitizedOriginalName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|avi|mov|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.originalname}. Allowed types: images, videos, audio, PDF, Word documents`));
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

// @route   POST /api/grievances
// @desc    Create a new grievance
// @access  Private (Citizens)
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
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required",
        received: { title, description, category }
      });
    }

    // Additional validation for empty strings
    if (!title.trim() || !description.trim() || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category cannot be empty",
        received: { title: title.trim(), description: description.trim(), category: category.trim() }
      });
    }
    // Parse location if it's a string
    let parsedLocation;
    try {
      parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
    } catch (error) {
      console.error("Location parsing error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
        locationReceived: location
      });
    }

    // Validate location
    if (!parsedLocation || !parsedLocation.address) {
      return res.status(400).json({
        success: false,
        message: "Location with address is required",
        locationReceived: parsedLocation
      });
    }

    // Additional validation for empty address
    if (!parsedLocation.address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location address cannot be empty",
        locationReceived: parsedLocation
      });
    }
    // Auto-determine department based on category
    const determinedDepartment = getCategoryDepartment(category)

    console.log("Validation passed, creating grievance with:", {
      title: title.trim(),
      description: description.trim(),
      category,
      department: determinedDepartment,
      priority: priority || "medium",
      location: parsedLocation,
      isAnonymous: isAnonymous === "true" || isAnonymous === true,
      citizen: req.user.id,
    });
    // Create grievance data
    const grievanceData = {
      title: title.trim(),
      description: description.trim(),
      category,
      department: determinedDepartment,
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
        path: `uploads/grievances/${file.filename}`,
        relativePath: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      }));
    }

    console.log("Creating grievance with data:", grievanceData);

    // Create and save the grievance
    const grievance = new Grievance(grievanceData);
    
    try {
      await grievance.save();
      console.log("Grievance saved successfully:", grievance._id);
    } catch (saveError) {
      console.error("Grievance save error:", saveError);
      throw saveError;
    }

    // Perform AI analysis and smart routing
    try {
      // Data Analysis
      const analysisResult = await AIAnalysisEngine.analyzeGrievance(
        grievance.title,
        grievance.description,
        grievance.category
      );

      // Update grievance with analysis data
      grievance.analysisData = {
        sentiment: analysisResult.sentiment,
        urgencyScore: analysisResult.urgencyScore,
        keywords: analysisResult.keywords,
        suggestedDepartment: analysisResult.suggestedDepartment,
        confidence: analysisResult.confidence
      };

      // Update priority based on urgency analysis
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
        // Reload the grievance to get the updated assignment data
        await grievance.populate([
          { path: "citizen", select: "name email" },
          { path: "assignedOfficer", select: "name email department" }
        ])
      } else {
        console.log("Auto-assignment failed:", routingResult.error)
        // If auto-assignment fails, try to assign to any available officer in the department
        console.log("Attempting fallback assignment...")
        const fallbackResult = await fallbackAssignment(grievance)
        if (fallbackResult.success) {
          console.log("Fallback assignment successful:", fallbackResult.officer.name)
          grievance.assignedOfficer = fallbackResult.officer._id
          grievance.status = "assigned"
          grievance.updates.push({
            message: `Auto-assigned to ${fallbackResult.officer.name} (fallback assignment)`,
            updatedBy: fallbackResult.officer._id,
            status: "assigned",
            timestamp: new Date()
          })
          await grievance.save()
          await grievance.populate([
            { path: "citizen", select: "name email" },
            { path: "assignedOfficer", select: "name email department" }
          ])
        }
      }

    } catch (aiError) {
      console.error("Analysis/Routing error (non-blocking):", aiError);
      // Continue without analysis if it fails
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
        fs.unlink(path.join(__dirname, "..", file.path), (err) => {
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

// Fallback assignment function
const fallbackAssignment = async (grievance) => {
  try {
    const User = require("../models/User")
    
    // Find any available officer in the grievance's department
    const officers = await User.find({
      role: "officer",
      department: grievance.department,
      isActive: true
    })
    
    if (officers.length === 0) {
      return { success: false, error: "No officers available in department" }
    }
    
    // Get officer workloads
    const officerWorkloads = await Promise.all(
      officers.map(async (officer) => {
        const workload = await Grievance.countDocuments({
          assignedOfficer: officer._id,
          status: { $in: ["pending", "assigned", "in_progress"] }
        })
        return { officer, workload }
      })
    )
    
    // Sort by workload (ascending) and pick the officer with least workload
    officerWorkloads.sort((a, b) => a.workload - b.workload)
    const selectedOfficer = officerWorkloads[0].officer
    
    return { success: true, officer: selectedOfficer }
  } catch (error) {
    console.error("Fallback assignment error:", error)
    return { success: false, error: error.message }
  }
}

// @route   POST /api/grievances/:id/analyze
// @desc    Re-run data analysis on a grievance
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
        message: "Data analysis completed successfully",
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
    console.error("Manual data analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform data analysis"
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

    console.log("Reassign route called:", { grievanceId: req.params.id, officerId, adminId: req.user.id })
    const result = await SmartRoutingEngine.reassignGrievance(
      req.params.id,
      officerId,
      req.user.id
    );
    console.log("Reassign result:", result)

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
      console.error("Reassign failed:", result.error)
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

    console.log("Auto-assign route called for grievance:", req.params.id)
    const result = await SmartRoutingEngine.autoAssignGrievance(req.params.id);
    console.log("Auto-assign result:", result)
    
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
      console.error("Auto-assign failed:", result.error)
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

// @route   GET /api/grievances/officers/available
// @desc    Get available officers for assignment
// @access  Private (Admin only)
router.get("/officers/available", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const { department } = req.query;
    const result = await SmartRoutingEngine.getAvailableOfficersForAssignment(department);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.officers
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error("Get available officers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available officers"
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
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    // Role-based filtering
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id;
    } else if (req.user.role === "officer") {
      // For officers, show all grievances in their department
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null;
      if (userDepartment) {
        filter.department = userDepartment;
      }
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

    // Enhanced officer access check
    if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null;
      const grievanceDepartment = grievance.department ? grievance.department.toUpperCase() : null;
      const isAssignedToUser = grievance.assignedOfficer && grievance.assignedOfficer._id.toString() === req.user.id;
      
      console.log("Officer access check:", {
        userId: req.user.id,
        userDepartment,
        grievanceDepartment,
        isAssignedToUser,
        assignedOfficerId: grievance.assignedOfficer?._id?.toString()
      });
      
      if (!isAssignedToUser) {
        return res.status(403).json({
          success: false,
          message: "Access denied - you can only view grievances assigned to you",
        });
      }
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
    console.log("=== STATUS UPDATE DEBUG ===");
    console.log("Grievance ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("User:", req.user);
    console.log("=== END STATUS UPDATE DEBUG ===");

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

    console.log("Found grievance:", {
      id: grievance._id,
      currentStatus: grievance.status,
      newStatus: status,
      assignedOfficer: grievance.assignedOfficer
    });
    // Check if officer has permission to update this grievance
    if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null;
      const grievanceDepartment = grievance.department ? grievance.department.toUpperCase() : null;
      const isAssignedToUser = grievance.assignedOfficer && grievance.assignedOfficer.toString() === req.user.id;
      
      console.log("Officer permission check:", {
        userDepartment,
        grievanceDepartment,
        isAssignedToUser,
        userId: req.user.id,
        assignedOfficerId: grievance.assignedOfficer?.toString()
      });

      if (!isAssignedToUser) {
        return res.status(403).json({
          success: false,
          message: "Access denied - you can only update grievances assigned to you",
        });
      }
    }

    // Validate status transition (allow any valid status change)
    const validStatuses = ["pending", "assigned", "in_progress", "resolved", "closed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Prevent changing status from closed or rejected (optional business rule)
    // Remove this block if you want to allow any status changes
    // if (grievance.status === "closed" || grievance.status === "rejected") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot update status of closed or rejected grievances",
    //   });
    // }
    // Update grievance
    const oldStatus = grievance.status;
    grievance.status = status;
    
    // Always add an update entry for status changes
    const updateMessage = comment || `Status changed from ${oldStatus} to ${status}`;
    grievance.updates.push({
      message: updateMessage,
      status,
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    // Auto-assign officer if moving to in_progress or assigned and no officer assigned
    if ((status === "in_progress" || status === "assigned") && !grievance.assignedOfficer) {
      grievance.assignedOfficer = req.user.id;
      grievance.updates.push({
        message: `Auto-assigned to ${req.user.name || 'officer'} due to status change`,
        status: "assigned",
        updatedBy: req.user.id,
        timestamp: new Date(),
      });
    }

    // Set resolution date when status changes to resolved
    if (status === "resolved" && oldStatus !== "resolved") {
      grievance.actualResolutionDate = new Date();
      // Calculate resolution time in hours
      const resolutionTime = Math.round((grievance.actualResolutionDate - grievance.createdAt) / (1000 * 60 * 60));
      grievance.resolutionTime = resolutionTime;
    }

    console.log("Updating grievance status from", oldStatus, "to", status);
    await grievance.save();
    console.log("Grievance saved successfully");

    await grievance.populate([
      { path: "citizen", select: "name email" },
      { path: "assignedOfficer", select: "name email department" },
      { path: "updates.updatedBy", select: "name email" }
    ]);

    console.log("Status update completed successfully");

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
      error: error.message
    });
  }
});

// Add feedback to a resolved grievance
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const grievanceId = req.params.id;

    console.log("Feedback submission request:", { grievanceId, rating, comment, userId: req.user.id });

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

    // Check if feedback already exists
    if (grievance.feedback && grievance.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: "Feedback has already been provided for this grievance",
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Add feedback
    grievance.feedback = {
      rating: parseInt(rating),
      comment: comment || "",
      submittedAt: new Date(),
    };

    await grievance.save();

    console.log("Feedback saved successfully:", grievance.feedback);

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