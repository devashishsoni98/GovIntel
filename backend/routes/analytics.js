const express = require("express")
const Grievance = require("../models/Grievance")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive dashboard analytics
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    const { role, department, id } = req.user
    
    // Build filter based on user role
    let grievanceFilter = {}
    
    if (role === "citizen") {
      grievanceFilter.citizen = id
    } else if (role === "officer") {
      // For officers, show only grievances assigned to them specifically
      grievanceFilter.assignedOfficer = id
    }
    // Admin sees all data (no filter)

    // Get date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Parallel data fetching
    const [
      totalGrievances,
      statusStats,
      categoryStats,
      priorityStats,
      departmentStats,
      recentGrievances,
      monthlyTrend,
      resolutionMetrics,
      userStats
    ] = await Promise.all([
      // Total grievances count
      Grievance.countDocuments(grievanceFilter),
      
      // Status distribution
      Grievance.aggregate([
        { $match: grievanceFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Category distribution
      Grievance.aggregate([
        { $match: grievanceFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Priority distribution
      Grievance.aggregate([
        { $match: grievanceFilter },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Department distribution (admin only)
      role === "admin" ? Grievance.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]) : [],
      
      // Recent grievances
      Grievance.find(grievanceFilter)
        .populate("citizen", "name email")
        .populate("assignedOfficer", "name email")
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Monthly trend (last 12 months)
      Grievance.aggregate([
        {
          $match: {
            ...grievanceFilter,
            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      
      // Resolution metrics
      Grievance.aggregate([
        {
          $match: {
            ...grievanceFilter,
            status: "resolved",
            resolutionTime: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: "$resolutionTime" },
            minResolutionTime: { $min: "$resolutionTime" },
            maxResolutionTime: { $max: "$resolutionTime" },
            totalResolved: { $sum: 1 }
          }
        }
      ]),
      
      // User statistics (admin only)
      role === "admin" ? Promise.all([
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: true, role: "citizen" }),
        User.countDocuments({ isActive: true, role: "officer" }),
        User.countDocuments({ isActive: true, role: "admin" })
      ]) : [0, 0, 0, 0]
    ])

    // Process status stats
    const statusMap = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})

    // Calculate resolution rate
    const resolvedCount = statusMap.resolved || 0
    const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0

    // Process resolution metrics
    const avgResolutionTime = resolutionMetrics[0]?.avgResolutionTime || 0

    // Format monthly trend
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      total: item.count,
      resolved: item.resolved,
      resolutionRate: item.count > 0 ? Math.round((item.resolved / item.count) * 100) : 0
    }))

    // Add percentage calculations for stats
    const statusStatsWithPercentage = statusStats.map(stat => ({
      status: stat._id,
      count: stat.count,
      percentage: totalGrievances > 0 ? Math.round((stat.count / totalGrievances) * 100) : 0
    }))

    const categoryStatsWithPercentage = categoryStats.map(stat => ({
      category: stat._id,
      count: stat.count,
      percentage: totalGrievances > 0 ? Math.round((stat.count / totalGrievances) * 100) : 0
    }))

    const priorityStatsWithPercentage = priorityStats.map(stat => ({
      priority: stat._id,
      count: stat.count,
      percentage: totalGrievances > 0 ? Math.round((stat.count / totalGrievances) * 100) : 0
    }))

    const departmentStatsWithPercentage = departmentStats.map(stat => ({
      department: stat._id,
      count: stat.count,
      percentage: totalGrievances > 0 ? Math.round((stat.count / totalGrievances) * 100) : 0
    }))

    // Build response
    const dashboardData = {
      summary: {
        total: totalGrievances,
        pending: statusMap.pending || 0,
        inProgress: statusMap.in_progress || 0,
        resolved: statusMap.resolved || 0,
        closed: statusMap.closed || 0,
        rejected: statusMap.rejected || 0,
        resolutionRate,
        avgResolutionTime: Math.round(avgResolutionTime)
      },
      statusStats: statusStatsWithPercentage,
      categoryStats: categoryStatsWithPercentage,
      priorityStats: priorityStatsWithPercentage,
      departmentStats: departmentStatsWithPercentage,
      recentGrievances: recentGrievances.slice(0, 5),
      monthlyTrend: formattedMonthlyTrend,
      userStats: role === "admin" ? {
        total: userStats[0],
        citizens: userStats[1],
        officers: userStats[2],
        admins: userStats[3]
      } : null
    }

    console.log("Dashboard analytics data:", {
      totalGrievances,
      statusStatsCount: statusStats.length,
      categoryStatsCount: categoryStats.length,
      priorityStatsCount: priorityStats.length,
      departmentStatsCount: departmentStats.length,
      monthlyTrendCount: monthlyTrend.length,
      userRole: role,
      grievanceFilter,
      statusMap
    })

    res.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error("Dashboard analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/performance
// @desc    Get performance metrics
// @access  Private (Officer/Admin)
router.get("/performance", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
      // For officers, show all grievances in their department
      // For officers, show all grievances in their department
      const userDepartment = department ? department.toUpperCase() : null;
      if (userDepartment) {
        filter.department = userDepartment;
      }
      }
    }

    const { role, department, id } = req.user
    let filter = {}
    
    if (role === "officer") {
      filter = { assignedOfficer: id }
    } else if (role === "officer" && department) {
      filter = { department: department.toUpperCase() }
    }

    const performanceData = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            officer: "$assignedOfficer",
            status: "$status"
          },
          count: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $eq: ["$status", "resolved"] },
                "$resolutionTime",
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.officer",
          foreignField: "_id",
          as: "officer"
        }
      }
    ])

    res.json({
      success: true,
      data: performanceData
    })

  } catch (error) {
    console.error("Performance analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance analytics"
    })
  }
})

// @route   GET /api/analytics/trends
// @desc    Get trend analysis
// @access  Private
router.get("/trends", auth, async (req, res) => {
  try {
    const { timeframe = "month" } = req.query
    const { role, department, id } = req.user
    
    let filter = {}
    if (role === "citizen") {
      filter.citizen = id
    } else if (role === "officer") {
      // For officers, show all grievances in their department
      const userDepartment = department ? department.toUpperCase() : null;
      if (userDepartment) {
        filter.department = userDepartment;
    // Calculate date range based on timeframe
    const now = new Date()
    let startDate
    let groupBy

    switch (timeframe) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        }
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        }
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        }
    }

    const trends = await Grievance.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          avgPriority: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$priority", "low"] }, then: 1 },
                  { case: { $eq: ["$priority", "medium"] }, then: 2 },
                  { case: { $eq: ["$priority", "high"] }, then: 3 },
                  { case: { $eq: ["$priority", "urgent"] }, then: 4 }
                ],
                default: 2
              }
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ])

    res.json({
      success: true,
      data: {
        timeframe,
        trends
      }
    })

  } catch (error) {
    console.error("Trends analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch trend analytics"
    })
  }
})

module.exports = router