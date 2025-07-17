const express = require("express")
const Grievance = require("../models/Grievance")
const User = require("../models/User")
const Department = require("../models/Department")
const auth = require("../middleware/auth")

const router = express.Router()

// Middleware to check officer/admin role
const requireOfficerOrAdmin = (req, res, next) => {
  if (req.user.role !== "officer" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Officer or Admin privileges required."
    })
  }
  next()
}

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    })
  }
  next()
}

// @route   GET /api/reports/system
// @desc    Get system-wide reports
// @access  Private (Admin only)
router.get("/system", auth, requireAdmin, async (req, res) => {
  try {
    const { timeframe = "month" } = req.query

    // Calculate date range
    const now = new Date()
    let startDate
    switch (timeframe) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    // Get overall statistics
    const [totalStats, statusStats, categoryStats, departmentStats] = await Promise.all([
      Grievance.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
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
        }
      ]),
      
      Grievance.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      
      Grievance.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      
      Grievance.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$department", count: { $sum: 1 } } }
      ])
    ])

    const total = totalStats[0]?.total || 0
    const resolved = totalStats[0]?.resolved || 0
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    res.json({
      success: true,
      data: {
        totalGrievances: total,
        resolvedGrievances: resolved,
        resolutionRate,
        avgResolutionTime: Math.round(totalStats[0]?.avgResolutionTime || 0),
        statusBreakdown: statusStats,
        categoryBreakdown: categoryStats,
        departmentBreakdown: departmentStats,
        timeframe,
        dateRange: { start: startDate, end: now }
      }
    })

  } catch (error) {
    console.error("System report error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate system report"
    })
  }
})

// @route   GET /api/reports/department
// @desc    Get department-specific reports
// @access  Private (Officer/Admin)
router.get("/department", auth, requireOfficerOrAdmin, async (req, res) => {
  try {
    const { timeframe = "month", department } = req.query
    
    // Determine target department
    const targetDepartment = department || req.user.department
    
    if (!targetDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department is required"
      })
    }

    // Calculate date range
    const now = new Date()
    let startDate
    switch (timeframe) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    const filter = {
      department: targetDepartment.toUpperCase(),
      createdAt: { $gte: startDate }
    }

    // Get department statistics
    const [deptStats, officerStats, categoryStats] = await Promise.all([
      Grievance.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
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
        }
      ]),
      
      Grievance.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$assignedOfficer",
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
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
      ]),
      
      Grievance.aggregate([
        { $match: filter },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ])
    ])

    const total = deptStats[0]?.total || 0
    const resolved = deptStats[0]?.resolved || 0
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    res.json({
      success: true,
      data: {
        department: targetDepartment,
        totalGrievances: total,
        resolvedGrievances: resolved,
        pendingGrievances: deptStats[0]?.pending || 0,
        inProgressGrievances: deptStats[0]?.inProgress || 0,
        resolutionRate,
        avgResolutionTime: Math.round(deptStats[0]?.avgResolutionTime || 0),
        officerPerformance: officerStats.map(stat => ({
          officer: stat.officer[0] || null,
          total: stat.total,
          resolved: stat.resolved,
          rate: stat.total > 0 ? Math.round((stat.resolved / stat.total) * 100) : 0
        })),
        categoryBreakdown: categoryStats,
        timeframe,
        dateRange: { start: startDate, end: now }
      }
    })

  } catch (error) {
    console.error("Department report error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate department report"
    })
  }
})

// @route   GET /api/reports/monthly
// @desc    Get monthly reports
// @access  Private (Officer/Admin)
router.get("/monthly", auth, requireOfficerOrAdmin, async (req, res) => {
  try {
    const { month, year, department } = req.query
    
    // Default to current month/year
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1
    const targetYear = year ? parseInt(year) : new Date().getFullYear()
    
    // Calculate month date range
    const startDate = new Date(targetYear, targetMonth - 1, 1)
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59)

    let filter = {
      createdAt: { $gte: startDate, $lte: endDate }
    }

    // Add department filter if specified or if user is officer
    if (department) {
      filter.department = department.toUpperCase()
    } else if (req.user.role === "officer" && req.user.department) {
      filter.department = req.user.department.toUpperCase()
    }

    // Get monthly statistics
    const [monthlyStats, weeklyStats, dailyStats] = await Promise.all([
      Grievance.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
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
        }
      ]),
      
      // Weekly breakdown
      Grievance.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { week: { $week: "$createdAt" } },
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
          }
        },
        { $sort: { "_id.week": 1 } }
      ]),
      
      // Daily breakdown
      Grievance.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { day: { $dayOfMonth: "$createdAt" } },
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
          }
        },
        { $sort: { "_id.day": 1 } }
      ])
    ])

    const total = monthlyStats[0]?.total || 0
    const resolved = monthlyStats[0]?.resolved || 0
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        department: filter.department || "All Departments",
        totalGrievances: total,
        resolvedGrievances: resolved,
        pendingGrievances: monthlyStats[0]?.pending || 0,
        inProgressGrievances: monthlyStats[0]?.inProgress || 0,
        resolutionRate,
        avgResolutionTime: Math.round(monthlyStats[0]?.avgResolutionTime || 0),
        weeklyBreakdown: weeklyStats,
        dailyBreakdown: dailyStats,
        dateRange: { start: startDate, end: endDate }
      }
    })

  } catch (error) {
    console.error("Monthly report error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate monthly report"
    })
  }
})

// @route   GET /api/reports/performance
// @desc    Get performance reports
// @access  Private (Officer/Admin)
router.get("/performance", auth, requireOfficerOrAdmin, async (req, res) => {
  try {
    const { timeframe = "month", department } = req.query

    // Calculate date range
    const now = new Date()
    let startDate
    switch (timeframe) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    let filter = { createdAt: { $gte: startDate } }
    
    // Add department filter if specified or if user is officer
    if (department) {
      filter.department = department.toUpperCase()
    } else if (req.user.role === "officer" && req.user.department) {
      filter.department = req.user.department.toUpperCase()
    }

    // Get performance statistics
    const [officerPerformance, departmentPerformance, topPerformers] = await Promise.all([
      // Officer performance
      Grievance.aggregate([
        { $match: { ...filter, assignedOfficer: { $ne: null } } },
        {
          $group: {
            _id: "$assignedOfficer",
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
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "officer"
          }
        },
        { $sort: { resolved: -1 } }
      ]),
      
      // Department performance
      Grievance.aggregate([
        { $match: filter },
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
        { $sort: { resolutionRate: -1 } }
      ]),
      
      // Top performers (officers with highest resolution rates)
      Grievance.aggregate([
        { $match: { ...filter, assignedOfficer: { $ne: null } } },
        {
          $group: {
            _id: "$assignedOfficer",
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
        { $match: { total: { $gte: 5 } } }, // Only include officers with at least 5 cases
        { $sort: { resolutionRate: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "officer"
          }
        }
      ])
    ])

    res.json({
      success: true,
      data: {
        timeframe,
        dateRange: { start: startDate, end: now },
        officerPerformance: officerPerformance.map(stat => ({
          officer: stat.officer[0] || null,
          total: stat.total,
          resolved: stat.resolved,
          resolutionRate: stat.total > 0 ? Math.round((stat.resolved / stat.total) * 100) : 0,
          avgResolutionTime: Math.round(stat.avgResolutionTime || 0)
        })),
        departmentPerformance: departmentPerformance.map(stat => ({
          department: stat._id,
          total: stat.total,
          resolved: stat.resolved,
          resolutionRate: Math.round(stat.resolutionRate || 0),
          avgResolutionTime: Math.round(stat.avgResolutionTime || 0)
        })),
        topPerformers: topPerformers.map(stat => ({
          officer: stat.officer[0] || null,
          total: stat.total,
          resolved: stat.resolved,
          resolutionRate: Math.round(stat.resolutionRate || 0),
          avgResolutionTime: Math.round(stat.avgResolutionTime || 0)
        }))
      }
    })

  } catch (error) {
    console.error("Performance report error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate performance report"
    })
  }
})

// @route   GET /api/reports/:type/export
// @desc    Export report data
// @access  Private (Officer/Admin)
router.get("/:type/export", auth, requireOfficerOrAdmin, async (req, res) => {
  try {
    const { type } = req.params
    const { format = "csv" } = req.query

    // This is a placeholder for export functionality
    // In a real implementation, you would generate the actual file
    
    res.json({
      success: true,
      message: `Export functionality for ${type} reports in ${format} format would be implemented here`,
      data: {
        type,
        format,
        downloadUrl: `/api/reports/${type}/download?format=${format}`
      }
    })

  } catch (error) {
    console.error("Export report error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export report"
    })
  }
})

module.exports = router