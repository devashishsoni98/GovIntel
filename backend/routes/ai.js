const express = require("express")
const Grievance = require("../models/Grievance")
const User = require("../models/User")
const auth = require("../middleware/auth")
const AnalysisEngine = require("../utils/aiAnalysis")

const router = express.Router()

// @route   POST /api/analysis/analyze-grievance
// @desc    Analyze a single grievance with data analysis
// @access  Private (Officer/Admin)
router.post("/analyze-grievance", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can use data analysis."
      })
    }

    const { grievanceId } = req.body

    if (!grievanceId) {
      return res.status(400).json({
        success: false,
        message: "Grievance ID is required"
      })
    }

    const result = await AnalysisEngine.updateGrievanceWithAnalysis(grievanceId)
    
    if (result.success) {
      res.json({
        success: true,
        message: "Data analysis completed successfully",
        data: {
          grievance: result.grievance,
          analysis: result.analysis
        }
      })
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      })
    }

  } catch (error) {
    console.error("Data analysis error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to perform data analysis"
    })
  }
})

// @route   POST /api/analysis/smart-recommendations
// @desc    Get data-driven recommendations for grievance handling
// @access  Private (Officer/Admin)
router.post("/smart-recommendations", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      })
    }

    const { grievanceId } = req.body
    const grievance = await Grievance.findById(grievanceId)
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email")

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      })
    }

    // Generate AI recommendations
    const recommendations = await generateSmartRecommendations(grievance)

    res.json({
      success: true,
      data: {
        grievanceId: grievance._id,
        recommendations
      }
    })

  } catch (error) {
    console.error("Smart recommendations error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations"
    })
  }
})

// @route   GET /api/analysis/department-insights
// @desc    Get data-driven insights for department performance
// @access  Private (Officer/Admin)
router.get("/department-insights", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      })
    }

    const { department } = req.query
    const targetDepartment = department || req.user.department

    if (!targetDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department is required"
      })
    }

    const insights = await generateDepartmentInsights(targetDepartment)

    res.json({
      success: true,
      data: {
        department: targetDepartment,
        insights
      }
    })

  } catch (error) {
    console.error("Department insights error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate department insights"
    })
  }
})

// @route   POST /api/analysis/predict-resolution-time
// @desc    Predict resolution time for a grievance using data analysis
// @access  Private (Officer/Admin)
router.post("/predict-resolution-time", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      })
    }

    const { grievanceId } = req.body
    const grievance = await Grievance.findById(grievanceId)

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      })
    }

    const prediction = await predictResolutionTime(grievance)

    res.json({
      success: true,
      data: {
        grievanceId: grievance._id,
        prediction
      }
    })

  } catch (error) {
    console.error("Resolution time prediction error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to predict resolution time"
    })
  }
})

// @route   GET /api/analysis/sentiment-trends
// @desc    Get sentiment analysis trends over time
// @access  Private (Admin only)
router.get("/sentiment-trends", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const { timeframe = "month", department } = req.query
    const trends = await analyzeSentimentTrends(timeframe, department)

    res.json({
      success: true,
      data: {
        timeframe,
        department: department || "all",
        trends
      }
    })

  } catch (error) {
    console.error("Sentiment trends error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to analyze sentiment trends"
    })
  }
})

// Helper function to generate smart recommendations
async function generateSmartRecommendations(grievance) {
  const recommendations = {
    priority: "medium",
    suggestedActions: [],
    estimatedResolutionTime: "48 hours",
    similarCases: [],
    riskFactors: [],
    successFactors: []
  }

  try {
    // Analyze grievance content for recommendations
    const analysis = await AIAnalysisEngine.analyzeGrievance(
      grievance.title,
      grievance.description,
      grievance.category
    )

    // Priority recommendation based on AI analysis
    if (analysis.urgencyScore > 80) {
      recommendations.priority = "urgent"
      recommendations.suggestedActions.push("Immediate attention required")
      recommendations.estimatedResolutionTime = "6 hours"
    } else if (analysis.urgencyScore > 60) {
      recommendations.priority = "high"
      recommendations.suggestedActions.push("Schedule for next business day")
      recommendations.estimatedResolutionTime = "24 hours"
    }

    // Sentiment-based recommendations
    if (analysis.sentiment === "negative") {
      recommendations.suggestedActions.push("Prioritize citizen communication")
      recommendations.riskFactors.push("Negative citizen sentiment detected")
    }

    // Category-specific recommendations
    const categoryRecommendations = getCategoryRecommendations(grievance.category)
    recommendations.suggestedActions.push(...categoryRecommendations)

    // Find similar resolved cases
    const similarCases = await Grievance.find({
      category: grievance.category,
      status: "resolved",
      _id: { $ne: grievance._id }
    })
    .limit(3)
    .select("title resolutionTime")

    recommendations.similarCases = similarCases.map(grievanceCase => ({
      title: grievanceCase.title,
      resolutionTime: grievanceCase.resolutionTime
    }))

    // Calculate average resolution time for similar cases
    if (similarCases.length > 0) {
      const avgTime = similarCases.reduce((sum, grievanceCase) => sum + (grievanceCase.resolutionTime || 48), 0) / similarCases.length
      recommendations.estimatedResolutionTime = `${Math.round(avgTime)} hours`
    }

    // Success factors based on historical data
    recommendations.successFactors = [
      "Clear communication with citizen",
      "Regular status updates",
      "Proper documentation",
      "Timely escalation when needed"
    ]

  } catch (error) {
    console.error("Error generating recommendations:", error)
  }

  return recommendations
}

// Helper function for category-specific recommendations
function getCategoryRecommendations(category) {
  const categoryMap = {
    infrastructure: [
      "Coordinate with engineering team",
      "Schedule site inspection",
      "Check for safety hazards"
    ],
    sanitation: [
      "Deploy cleaning crew",
      "Check waste collection schedule",
      "Inspect drainage systems"
    ],
    water_supply: [
      "Test water quality",
      "Check pipeline integrity",
      "Coordinate with water department"
    ],
    electricity: [
      "Contact electrical maintenance",
      "Check power grid status",
      "Schedule emergency repairs if needed"
    ],
    transportation: [
      "Review traffic patterns",
      "Coordinate with transport authority",
      "Check route optimization"
    ],
    healthcare: [
      "Escalate to medical supervisor",
      "Check facility capacity",
      "Ensure emergency protocols"
    ],
    education: [
      "Contact school administration",
      "Review educational policies",
      "Schedule parent-teacher meeting"
    ],
    police: [
      "File incident report",
      "Assign investigating officer",
      "Ensure citizen safety"
    ]
  }

  return categoryMap[category] || ["Review case details", "Contact relevant department"]
}

// Helper function to generate department insights
async function generateDepartmentInsights(department) {
  const insights = {
    performance: {},
    trends: {},
    recommendations: [],
    alerts: []
  }

  try {
    // Get department statistics
    const stats = await Grievance.aggregate([
      { $match: { department: department.toUpperCase() } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          avgResolutionTime: { $avg: "$resolutionTime" },
          avgUrgencyScore: { $avg: "$aiAnalysis.urgencyScore" }
        }
      }
    ])

    if (stats.length > 0) {
      const stat = stats[0]
      insights.performance = {
        totalCases: stat.total,
        resolutionRate: Math.round((stat.resolved / stat.total) * 100),
        avgResolutionTime: Math.round(stat.avgResolutionTime || 0),
        avgUrgencyScore: Math.round(stat.avgUrgencyScore || 50)
      }

      // Generate recommendations based on performance
      if (insights.performance.resolutionRate < 70) {
        insights.recommendations.push("Consider increasing staff or improving processes")
        insights.alerts.push("Low resolution rate detected")
      }

      if (insights.performance.avgResolutionTime > 72) {
        insights.recommendations.push("Focus on reducing resolution time")
        insights.alerts.push("High average resolution time")
      }

      if (insights.performance.avgUrgencyScore > 70) {
        insights.recommendations.push("High urgency cases require immediate attention")
        insights.alerts.push("High urgency score trend")
      }
    }

    // Sentiment trends
    const sentimentStats = await Grievance.aggregate([
      { $match: { department: department.toUpperCase() } },
      {
        $group: {
          _id: "$aiAnalysis.sentiment",
          count: { $sum: 1 }
        }
      }
    ])

    insights.trends.sentiment = sentimentStats.reduce((acc, item) => {
      acc[item._id || "neutral"] = item.count
      return acc
    }, {})

  } catch (error) {
    console.error("Error generating department insights:", error)
  }

  return insights
}

// Helper function to predict resolution time
async function predictResolutionTime(grievance) {
  const prediction = {
    estimatedHours: 48,
    confidence: 0.7,
    factors: [],
    recommendations: []
  }

  try {
    // Get historical data for similar cases
    const similarCases = await Grievance.find({
      category: grievance.category,
      department: grievance.department,
      status: "resolved",
      resolutionTime: { $exists: true }
    }).select("resolutionTime priority aiAnalysis")

    if (similarCases.length > 0) {
      // Calculate weighted average based on priority and urgency
      let totalTime = 0
      let totalWeight = 0

      similarCases.forEach(grievanceCase => {
        let weight = 1
        
        // Weight by priority
        if (grievanceCase.priority === grievance.priority) weight += 0.5
        if (grievanceCase.priority === "urgent") weight += 0.3
        
+        // Weight by urgency score similarity
+        if (grievanceCase.analysisData?.urgencyScore && grievance.analysisData?.urgencyScore) {
+          const scoreDiff = Math.abs(grievanceCase.analysisData.urgencyScore - grievance.analysisData.urgencyScore)
          if (scoreDiff < 20) weight += 0.3
        }
          if (scoreDiff < 20) weight += 0.3
        }

        totalTime += grievanceCase.resolutionTime * weight
        totalWeight += weight
      })

      prediction.estimatedHours = Math.round(totalTime / totalWeight)
      prediction.confidence = Math.min(0.9, 0.5 + (similarCases.length * 0.1))
      prediction.factors.push(`Based on ${similarCases.length} similar resolved cases`)
    } else {
      // No historical data available
      prediction.factors.push("No historical data available for similar cases")
      prediction.confidence = 0.3
    }

    // Adjust based on current factors
    if (grievance.priority === "urgent") {
      prediction.estimatedHours = Math.max(6, prediction.estimatedHours * 0.5)
      prediction.factors.push("Urgent priority reduces estimated time")
    }

    if (grievance.analysisData?.urgencyScore > 80) {
      prediction.estimatedHours = Math.max(8, prediction.estimatedHours * 0.7)
      prediction.factors.push("High urgency score detected")
    }

    // Add recommendations
    if (prediction.estimatedHours > 72) {
      prediction.recommendations.push("Consider escalating to supervisor")
      prediction.recommendations.push("Allocate additional resources")
    }

    if (prediction.estimatedHours < 24) {
      prediction.recommendations.push("Fast-track this case")
      prediction.recommendations.push("Ensure immediate officer assignment")
    }

  } catch (error) {
    console.error("Error predicting resolution time:", error)
    prediction.factors.push("Prediction based on default estimates")
  }

  return prediction
}

// Helper function to analyze sentiment trends
async function analyzeSentimentTrends(timeframe, department) {
  const trends = {
    overall: {},
    timeline: [],
    insights: []
  }

  try {
    // Calculate date range
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

    const matchQuery = {
      createdAt: { $gte: startDate },
      "aiAnalysis.sentiment": { $exists: true }
    }

    if (department) {
      matchQuery.department = department.toUpperCase()
    }

    // Overall sentiment distribution
    const overallStats = await Grievance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$aiAnalysis.sentiment",
          count: { $sum: 1 }
        }
      }
    ])

    trends.overall = overallStats.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    // Timeline trends
    const timelineStats = await Grievance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            ...groupBy,
            sentiment: "$aiAnalysis.sentiment"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ])

    // Process timeline data
    const timelineMap = {}
    timelineStats.forEach(item => {
      const dateKey = timeframe === "year" 
        ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
        : `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`
      
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey, positive: 0, neutral: 0, negative: 0 }
      }
      
      timelineMap[dateKey][item._id.sentiment] = item.count
    })

    trends.timeline = Object.values(timelineMap)

    // Generate insights
    const totalCases = Object.values(trends.overall).reduce((sum, count) => sum + count, 0)
    const negativePercentage = ((trends.overall.negative || 0) / totalCases) * 100

    if (negativePercentage > 40) {
      trends.insights.push("High negative sentiment detected - consider improving service quality")
    }

    if (negativePercentage < 20) {
      trends.insights.push("Good sentiment trends - maintain current service levels")
    }

    const positivePercentage = ((trends.overall.positive || 0) / totalCases) * 100
    if (positivePercentage > 30) {
      trends.insights.push("Strong positive feedback - identify and replicate success factors")
    }

  } catch (error) {
    console.error("Error analyzing sentiment trends:", error)
  }

  return trends
}

module.exports = router