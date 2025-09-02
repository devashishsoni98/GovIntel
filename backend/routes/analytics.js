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
    console.log("=== ANALYTICS DASHBOARD DEBUG ===")
    console.log("User requesting analytics:", {
      id: req.user.id,
      role: req.user.role,
      department: req.user.department
    })

    // Build filter based on user role
    let filter = {}
    
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id
    } else if (req.user.role === "officer") {
      // Officers see all cases in their department
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null
      if (userDepartment) {
        filter.department = userDepartment
      }
    }
    // Admins see all grievances (no filter)

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

    // Calculate summary statistics
    const pendingCount = statusStats.find(s => s._id === "pending")?.count || 0
    const assignedCount = statusStats.find(s => s._id === "assigned")?.count || 0
    const inProgressCount = statusStats.find(s => s._id === "in_progress")?.count || 0
    const resolvedCount = statusStats.find(s => s._id === "resolved")?.count || 0
    const closedCount = statusStats.find(s => s._id === "closed")?.count || 0
    const rejectedCount = statusStats.find(s => s._id === "rejected")?.count || 0

    // Calculate resolution rate
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
    let departmentStats = []
    if (req.user.role === "admin") {
      departmentStats = await Grievance.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    }

    // Format the response
    const dashboardData = {
      summary: {
        total: totalGrievances,
        pending: pendingCount,
        assigned: assignedCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        closed: closedCount,
        rejected: rejectedCount,
        resolutionRate,
        avgResolutionTime
      },
      statusStats: statusStats.map(stat => ({
        status: stat._id,
        count: stat.count
      })),
      categoryStats: categoryStats.map(stat => ({
        category: stat._id,
        count: stat.count
      })),
      priorityStats: priorityStats.map(stat => ({
        priority: stat._id,
        count: stat.count
      })),
      recentGrievances,
      monthlyTrend: monthlyTrend.map(trend => ({
        month: `${trend._id.year}-${String(trend._id.month).padStart(2, "0")}`,
        count: trend.count
      })),
      userStats,
      departmentStats: departmentStats.map(stat => ({
        department: stat._id,
        count: stat.count
      }))
    }

    console.log("Analytics dashboard data:", {
      filter,
      totalGrievances,
      summary: dashboardData.summary,
      statusStatsCount: statusStats.length,
      categoryStatsCount: categoryStats.length,
      recentGrievancesCount: recentGrievances.length
    })

    res.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error("Get dashboard analytics error:", error)
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
    let filter = {}
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id
    } else if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null
      if (userDepartment) {
        filter.department = userDepartment
      }
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
    console.error("Get trends analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch trends analytics",
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
    let filter = {}
    if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null
      if (userDepartment) {
        filter.department = userDepartment
      }
    }

    // Get officer performance data
    const performance = await Grievance.aggregate([
      {
        $match: {
          ...filter,
          assignedOfficer: { $exists: true }
        }
      },
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
                { $and: [{ $eq: ["$status", "resolved"] }, { $ne: ["$resolutionTime", null] }] },
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
      },
      {
        $group: {
          _id: {
            officer: "$_id.officer",
            status: "$_id.status"
          },
          count: { $first: "$count" },
          avgResolutionTime: { $first: "$avgResolutionTime" },
          officer: { $first: "$officer" }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Get department performance (admin only)
    let departmentPerformance = []
    if (req.user.role === "admin") {
      departmentPerformance = await Grievance.aggregate([
        {
          $group: {
            _id: "$department",
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            avgResolutionTime: {
              $avg: {
                $cond: [
                  { $and: [{ $eq: ["$status", "resolved"] }, { $ne: ["$resolutionTime", null] }] },
                  "$resolutionTime",
                  null
                ]
              }
            }
          }
        },
        {
          $addFields: {
            resolutionRate: {
              $cond: [
                { $gt: ["$total", 0] },
                { $multiply: [{ $divide: ["$resolved", "$total"] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { total: -1 } }
      ])
    }

    res.json({
      success: true,
      data: {
        officerPerformance: performance,
        departmentPerformance,
        summary: {
          totalOfficersWithCases: performance.length,
          avgCasesPerOfficer: performance.length > 0 ? Math.round(performance.reduce((sum, p) => sum + p.count, 0) / performance.length) : 0
        }
      }
    })

  } catch (error) {
    console.error("Get performance analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance analytics",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/department/:code
// @desc    Get specific department analytics
// @access  Private (Officer/Admin)
router.get("/department/:code", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can view department analytics."
      })
    }

    const departmentCode = req.params.code.toUpperCase()

    // Check if officer has access to this department
    if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null
      if (userDepartment !== departmentCode) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only view analytics for your own department."
        })
      }
    }

    const filter = { department: departmentCode }

    // Get department info
    const department = await Department.findOne({ code: departmentCode })
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }

    // Get comprehensive department analytics
    const [
      totalGrievances,
      statusBreakdown,
      categoryBreakdown,
      priorityBreakdown,
      officerWorkload,
      resolutionMetrics
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
        { $match: filter },
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ]),
      
      Grievance.aggregate([
        {
          $match: {
            ...filter,
            assignedOfficer: { $exists: true }
          }
        },
        {
          $group: {
            _id: "$assignedOfficer",
            totalCases: { $sum: 1 },
            resolvedCases: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            avgResolutionTime: {
              $avg: {
                $cond: [
                  { $and: [{ $eq: ["$status", "resolved"] }, { $ne: ["$resolutionTime", null] }] },
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
            localField: "_id",
            foreignField: "_id",
            as: "officer"
          }
        },
        {
          $addFields: {
            resolutionRate: {
              $cond: [
                { $gt: ["$totalCases", 0] },
                { $multiply: [{ $divide: ["$resolvedCases", "$totalCases"] }, 100] },
                0
              ]
            }
          }
        }
      ]),
      
      Grievance.aggregate([
        {
          $match: {
            ...filter,
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
      ])
    ])

    const resolvedCount = statusBreakdown.find(s => s._id === "resolved")?.count || 0
    const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0

    const analytics = {
      department: {
        name: department.name,
        code: department.code,
        description: department.description
      },
      summary: {
        total: totalGrievances,
        pending: statusBreakdown.find(s => s._id === "pending")?.count || 0,
        assigned: statusBreakdown.find(s => s._id === "assigned")?.count || 0,
        inProgress: statusBreakdown.find(s => s._id === "in_progress")?.count || 0,
        resolved: resolvedCount,
        closed: statusBreakdown.find(s => s._id === "closed")?.count || 0,
        rejected: statusBreakdown.find(s => s._id === "rejected")?.count || 0,
        resolutionRate,
        avgResolutionTime: resolutionMetrics[0]?.avgResolutionTime || 0
      },
      breakdown: {
        status: statusBreakdown,
        category: categoryBreakdown,
        priority: priorityBreakdown
      },
      officers: officerWorkload,
      performance: resolutionMetrics[0] || {
        avgResolutionTime: 0,
        minResolutionTime: 0,
        maxResolutionTime: 0,
        totalResolved: 0
      }
    }

    res.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error("Get department analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch department analytics",
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
        message: "Access denied. Only officers and admins can export analytics."
      })
    }

    const { type = "dashboard", timeframe = "month" } = req.query

    // Build filter based on user role
    let filter = {}
    if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null
      if (userDepartment) {
        filter.department = userDepartment
      }
    }

    let csvData = ""
    let filename = `analytics-${type}-${timeframe}.csv`

    switch (type) {
      case "dashboard":
        const grievances = await Grievance.find(filter)
          .populate("citizen", "name email")
          .populate("assignedOfficer", "name email")
          .sort({ createdAt: -1 })

        csvData = "ID,Title,Category,Status,Priority,Department,Citizen,Officer,Created,Updated\n"
        grievances.forEach(g => {
          csvData += `"${g._id}","${g.title}","${g.category}","${g.status}","${g.priority}","${g.department}","${g.citizen?.name || 'Anonymous'}","${g.assignedOfficer?.name || 'Unassigned'}","${g.createdAt}","${g.updatedAt}"\n`
        })
        break

      case "performance":
        const performance = await Grievance.aggregate([
          {
            $match: {
              ...filter,
              assignedOfficer: { $exists: true }
            }
          },
          {
            $group: {
              _id: "$assignedOfficer",
              totalCases: { $sum: 1 },
              resolvedCases: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
              avgResolutionTime: { $avg: "$resolutionTime" }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "officer"
            }
          }
        ])

        csvData = "Officer,Email,Department,Total Cases,Resolved Cases,Resolution Rate,Avg Resolution Time\n"
        performance.forEach(p => {
          const officer = p.officer[0]
          const resolutionRate = p.totalCases > 0 ? ((p.resolvedCases / p.totalCases) * 100).toFixed(1) : 0
          csvData += `"${officer?.name || 'Unknown'}","${officer?.email || 'Unknown'}","${officer?.department || 'Unknown'}","${p.totalCases}","${p.resolvedCases}","${resolutionRate}%","${Math.round(p.avgResolutionTime || 0)}h"\n`
        })
        break

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid export type"
        })
    }

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csvData)

  } catch (error) {
    console.error("Export analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export analytics data",
      error: error.message
    })
  }
})

// @route   GET /api/analytics/summary
// @desc    Get analytics summary for specific user/role
// @access  Private
router.get("/summary", auth, async (req, res) => {
  try {
    // Build filter based on user role
    let filter = {}
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id
    } else if (req.user.role === "officer") {
      const userDepartment = req.user.department ? req.user.department.toUpperCase() : null
      if (userDepartment) {
        filter.department = userDepartment
      }
    }

    const [
      totalGrievances,
      statusCounts,
      recentActivity,
      urgentCases
    ] = await Promise.all([
      Grievance.countDocuments(filter),
      
      Grievance.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      Grievance.find(filter)
        .sort({ updatedAt: -1 })
        .limit(3)
        .populate("citizen", "name")
        .populate("assignedOfficer", "name"),
      
      Grievance.countDocuments({
        ...filter,
        priority: "urgent",
        status: { $in: ["pending", "assigned", "in_progress"] }
      })
    ])

    const summary = {
      total: totalGrievances,
      statusBreakdown: statusCounts,
      recentActivity,
      urgentCases,
      resolutionRate: totalGrievances > 0 ? 
        Math.round(((statusCounts.find(s => s._id === "resolved")?.count || 0) / totalGrievances) * 100) : 0
    }

    res.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error("Get analytics summary error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
      error: error.message
    })
  }
})

module.exports = router