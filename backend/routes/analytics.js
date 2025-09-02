const express = require("express")
const Grievance = require("../models/Grievance")
const User = require("../models/User")
const Department = require("../models/Department")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics data
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    console.log("Analytics dashboard request from user:", req.user)

    // Build filter based on user role
    const filter = {}
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id
    } else if (req.user.role === "officer") {
      // For officers, show only grievances assigned to them
      filter.assignedOfficer = req.user.id
    }
    // Admin sees all grievances (no filter)

    console.log("Analytics filter:", filter)

    // Get total grievances count
    const totalGrievances = await Grievance.countDocuments(filter)

    // Get status-wise counts
    const statusStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])

    // Get category-wise counts
    const categoryStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ])

    // Get priority-wise counts
    const priorityStats = await Grievance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ])

    // Get recent grievances (last 5)
    const recentGrievances = await Grievance.find(filter)
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email department")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrend = await Grievance.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])

    // Calculate resolution rate
    const resolvedCount = statusStats.find(s => s._id === "resolved")?.count || 0
    const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0

    // Calculate average resolution time for resolved grievances
    const resolvedGrievances = await Grievance.find({
      ...filter,
      status: "resolved",
      resolutionTime: { $exists: true }
    })

    const avgResolutionTime = resolvedGrievances.length > 0
      ? Math.round(resolvedGrievances.reduce((sum, g) => sum + (g.resolutionTime || 0), 0) / resolvedGrievances.length)
      : 0

    // Get user statistics (admin only)
    let userStats = null
    if (req.user.role === "admin") {
      const [totalUsers, totalCitizens, totalOfficers] = await Promise.all([
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: "citizen", isActive: true }),
        User.countDocuments({ role: "officer", isActive: true })
      ])

      userStats = {
        total: totalUsers,
        citizens: totalCitizens,
        officers: totalOfficers
      }
    }

    // Get department statistics (admin only)
    let departmentStats = null
    if (req.user.role === "admin") {
      departmentStats = await Grievance.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 }
          }
        }
      ])
    }

    // Get officer performance data (for officers)
    let officerPerformance = null
    if (req.user.role === "officer") {
      const officerGrievances = await Grievance.find({ assignedOfficer: req.user.id })
      const resolvedOfficerGrievances = officerGrievances.filter(g => g.status === "resolved")
      
      officerPerformance = {
        totalCases: officerGrievances.length,
        resolvedCases: resolvedOfficerGrievances.length,
        resolutionRate: officerGrievances.length > 0 
          ? Math.round((resolvedOfficerGrievances.length / officerGrievances.length) * 100) 
          : 0,
        avgResolutionTime: resolvedOfficerGrievances.length > 0
          ? Math.round(resolvedOfficerGrievances.reduce((sum, g) => sum + (g.resolutionTime || 0), 0) / resolvedOfficerGrievances.length)
          : 0,
        efficiency: officerGrievances.length > 0 
          ? Math.min(Math.round((resolvedOfficerGrievances.length / officerGrievances.length) * 100), 100)
          : 85 // Default efficiency for new officers
      }
    }

    // Format the response
    const dashboardData = {
      summary: {
        total: totalGrievances,
        assigned: statusStats.find(s => s._id === "assigned")?.count || 0,
        pending: statusStats.find(s => s._id === "pending")?.count || 0,
        inProgress: statusStats.find(s => s._id === "in_progress")?.count || 0,
        resolved: resolvedCount,
        closed: statusStats.find(s => s._id === "closed")?.count || 0,
        rejected: statusStats.find(s => s._id === "rejected")?.count || 0,
        resolutionRate,
        avgResolutionTime
      },
      statusStats: statusStats.map(stat => ({
        status: stat._id,
        count: stat.count,
        percentage: totalGrievances > 0 ? Math.round((stat.count / totalGrievances) * 100) : 0
      })),
      categoryStats: categoryStats.map(stat => ({
        category: stat._id,
        count: stat.count,
        percentage: totalGrievances > 0 ? Math.round((stat.count / totalGrievances) * 100) : 0
      })),
      priorityStats: priorityStats.map(stat => ({
        priority: stat._id,
        count: stat.count,
        percentage: totalGrievances > 0 ? Math.round((stat.count / totalGrievances) * 100) : 0
      })),
      recentGrievances,
      monthlyTrend: monthlyTrend.map(trend => ({
        month: `${trend._id.year}-${String(trend._id.month).padStart(2, "0")}`,
        count: trend.count
      })),
      ...(userStats && { userStats }),
      ...(departmentStats && { departmentStats }),
      ...(officerPerformance && { officerPerformance })
    }

    console.log("Analytics dashboard data:", JSON.stringify(dashboardData, null, 2))

    res.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error("Analytics dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/trends
// @desc    Get trend analytics data
// @access  Private
router.get("/trends", auth, async (req, res) => {
  try {
    const { timeframe = "month" } = req.query

    // Build filter based on user role
    const filter = {}
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id
    } else if (req.user.role === "officer") {
      filter.assignedOfficer = req.user.id
    }

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()
    let groupBy = {}

    switch (timeframe) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        }
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        }
        break
      default: // month
        startDate.setMonth(now.getMonth() - 1)
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
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ])

    res.json({
      success: true,
      data: {
        timeframe,
        trends,
        summary: {
          totalPeriods: trends.length,
          avgPerPeriod: trends.length > 0 ? Math.round(trends.reduce((sum, t) => sum + t.total, 0) / trends.length) : 0
        }
      }
    })

  } catch (error) {
    console.error("Analytics trends error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch trend analytics",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/performance
// @desc    Get performance analytics data
// @access  Private (Officer/Admin)
router.get("/performance", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can view performance analytics."
      })
    }

    // Build filter based on user role
    const filter = {}
    if (req.user.role === "officer") {
      filter.assignedOfficer = req.user.id
    }

    // Get performance data by officer
    const performance = await Grievance.aggregate([
      { $match: { ...filter, assignedOfficer: { $exists: true } } },
      {
        $group: {
          _id: {
            officer: "$assignedOfficer",
            status: "$status"
          },
          count: { $sum: 1 },
          avgResolutionTime: { $avg: "$resolutionTime" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.officer",
          foreignField: "_id",
          as: "officer"
        }
      },
      {
        $group: {
          _id: "$_id.officer",
          officer: { $first: "$officer" },
          statusBreakdown: {
            $push: {
              status: "$_id.status",
              count: "$count",
              avgResolutionTime: "$avgResolutionTime"
            }
          },
          totalCases: { $sum: "$count" }
        }
      }
    ])

    res.json({
      success: true,
      data: performance
    })

  } catch (error) {
    console.error("Analytics performance error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance analytics",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/export
// @desc    Export analytics data as CSV
// @access  Private (Officer/Admin)
router.get("/export", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can export data."
      })
    }

    const { type = "dashboard", timeframe = "month" } = req.query

    // Build filter based on user role
    const filter = {}
    if (req.user.role === "officer") {
      filter.assignedOfficer = req.user.id
    }

    let data = []
    let filename = `analytics-${type}-${timeframe}.csv`

    switch (type) {
      case "dashboard":
        const grievances = await Grievance.find(filter)
          .populate("citizen", "name email")
          .populate("assignedOfficer", "name email department")
          .sort({ createdAt: -1 })

        data = grievances.map(g => ({
          ID: g._id,
          Title: g.title,
          Category: g.category,
          Status: g.status,
          Priority: g.priority,
          Department: g.department,
          Citizen: g.citizen?.name || "Anonymous",
          AssignedOfficer: g.assignedOfficer?.name || "Unassigned",
          CreatedAt: g.createdAt.toISOString(),
          ResolutionTime: g.resolutionTime || "",
          Feedback: g.feedback?.rating || ""
        }))
        break

      case "performance":
        const performanceData = await Grievance.aggregate([
          { $match: { ...filter, assignedOfficer: { $exists: true } } },
          {
            $lookup: {
              from: "users",
              localField: "assignedOfficer",
              foreignField: "_id",
              as: "officer"
            }
          },
          {
            $group: {
              _id: "$assignedOfficer",
              officerName: { $first: "$officer.name" },
              totalCases: { $sum: 1 },
              resolvedCases: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
              avgResolutionTime: { $avg: "$resolutionTime" }
            }
          }
        ])

        data = performanceData.map(p => ({
          Officer: p.officerName?.[0] || "Unknown",
          TotalCases: p.totalCases,
          ResolvedCases: p.resolvedCases,
          ResolutionRate: p.totalCases > 0 ? Math.round((p.resolvedCases / p.totalCases) * 100) : 0,
          AvgResolutionTime: Math.round(p.avgResolutionTime || 0)
        }))
        break

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid export type"
        })
    }

    // Convert to CSV
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data available for export"
      })
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => `"${row[header] || ""}"`).join(","))
    ].join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(csvContent)

  } catch (error) {
    console.error("Analytics export error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export analytics data",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/summary
// @desc    Get analytics summary for admin
// @access  Private (Admin only)
router.get("/summary", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const [
      totalGrievances,
      totalUsers,
      totalDepartments,
      avgResolutionTime,
      topCategories,
      departmentPerformance
    ] = await Promise.all([
      Grievance.countDocuments(),
      User.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Grievance.aggregate([
        { $match: { status: "resolved", resolutionTime: { $exists: true } } },
        { $group: { _id: null, avgTime: { $avg: "$resolutionTime" } } }
      ]),
      Grievance.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Grievance.aggregate([
        {
          $group: {
            _id: "$department",
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
          }
        },
        {
          $project: {
            department: "$_id",
            total: 1,
            resolved: 1,
            resolutionRate: {
              $cond: [
                { $gt: ["$total", 0] },
                { $multiply: [{ $divide: ["$resolved", "$total"] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { resolutionRate: -1 } }
      ])
    ])

    const summary = {
      overview: {
        totalGrievances,
        totalUsers,
        totalDepartments,
        avgResolutionTime: avgResolutionTime[0]?.avgTime || 0
      },
      topCategories,
      departmentPerformance
    }

    res.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error("Analytics summary error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/department/:code
// @desc    Get department-specific analytics
// @access  Private (Officer/Admin)
router.get("/department/:code", auth, async (req, res) => {
  try {
    const departmentCode = req.params.code.toUpperCase()

    // Check permissions
    if (req.user.role === "officer" && req.user.department !== departmentCode) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view analytics for your department."
      })
    }

    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Citizens cannot view department analytics."
      })
    }

    // Get department info
    const department = await Department.findOne({ code: departmentCode, isActive: true })
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    // Get department analytics
    const filter = { department: departmentCode }

    const [
      totalGrievances,
      statusStats,
      categoryStats,
      officerStats,
      monthlyTrend
    ] = await Promise.all([
      Grievance.countDocuments(filter),
      Grievance.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Grievance.aggregate([
        { $match: filter },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      Grievance.aggregate([
        { $match: { ...filter, assignedOfficer: { $exists: true } } },
        {
          $lookup: {
            from: "users",
            localField: "assignedOfficer",
            foreignField: "_id",
            as: "officer"
          }
        },
        {
          $group: {
            _id: "$assignedOfficer",
            officerName: { $first: "$officer.name" },
            totalCases: { $sum: 1 },
            resolvedCases: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            avgResolutionTime: { $avg: "$resolutionTime" }
          }
        }
      ]),
      Grievance.aggregate([
        {
          $match: {
            ...filter,
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ])
    ])

    const analytics = {
      department: {
        name: department.name,
        code: department.code,
        description: department.description
      },
      summary: {
        total: totalGrievances,
        resolved: statusStats.find(s => s._id === "resolved")?.count || 0,
        pending: statusStats.find(s => s._id === "pending")?.count || 0,
        inProgress: statusStats.find(s => s._id === "in_progress")?.count || 0,
        resolutionRate: totalGrievances > 0 
          ? Math.round(((statusStats.find(s => s._id === "resolved")?.count || 0) / totalGrievances) * 100)
          : 0
      },
      statusStats,
      categoryStats,
      officerStats: officerStats.map(stat => ({
        ...stat,
        resolutionRate: stat.totalCases > 0 
          ? Math.round((stat.resolvedCases / stat.totalCases) * 100)
          : 0
      })),
      monthlyTrend
    }

    res.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error("Department analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch department analytics",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/citizen/:id
// @desc    Get citizen-specific analytics
// @access  Private (Admin only)
router.get("/citizen/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const citizenId = req.params.id

    // Verify citizen exists
    const citizen = await User.findById(citizenId)
    if (!citizen || citizen.role !== "citizen") {
      return res.status(404).json({
        success: false,
        message: "Citizen not found"
      })
    }

    // Get citizen analytics
    const filter = { citizen: citizenId }

    const [
      totalGrievances,
      statusStats,
      categoryStats,
      avgResolutionTime,
      satisfactionRating
    ] = await Promise.all([
      Grievance.countDocuments(filter),
      Grievance.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Grievance.aggregate([
        { $match: filter },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      Grievance.aggregate([
        { $match: { ...filter, status: "resolved", resolutionTime: { $exists: true } } },
        { $group: { _id: null, avgTime: { $avg: "$resolutionTime" } } }
      ]),
      Grievance.aggregate([
        { $match: { ...filter, "feedback.rating": { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: "$feedback.rating" } } }
      ])
    ])

    const analytics = {
      citizen: {
        name: citizen.name,
        email: citizen.email,
        joinDate: citizen.createdAt
      },
      summary: {
        total: totalGrievances,
        resolved: statusStats.find(s => s._id === "resolved")?.count || 0,
        pending: statusStats.find(s => s._id === "pending")?.count || 0,
        avgResolutionTime: avgResolutionTime[0]?.avgTime || 0,
        satisfactionRating: satisfactionRating[0]?.avgRating || 0
      },
      statusStats,
      categoryStats
    }

    res.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error("Citizen analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch citizen analytics",
      error: error.message
    })
  }
})

module.exports = router