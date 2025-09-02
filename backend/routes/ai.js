const express = require("express")
const Grievance = require("../models/Grievance")
const AIAnalysisEngine = require("../utils/aiAnalysis")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/analysis/grievance/:id
// @desc    Analyze a specific grievance with AI
// @access  Private (Officer/Admin)
router.post("/grievance/:id", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can trigger analysis."
      })
    }

    const grievanceId = req.params.id
    const grievance = await Grievance.findById(grievanceId)

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      })
    }

    // Perform AI analysis
    const analysisResult = await AIAnalysisEngine.analyzeGrievance(
      grievance.title,
      grievance.description,
      grievance.category
    )

    // Update grievance with analysis data
    grievance.analysisData = {
      sentiment: analysisResult.sentiment,
      urgencyScore: analysisResult.urgencyScore,
      keywords: analysisResult.keywords,
      suggestedDepartment: analysisResult.suggestedDepartment,
      confidence: analysisResult.confidence,
      analyzedAt: new Date()
    }

    // Update priority based on urgency analysis if needed
    if (analysisResult.urgencyLevel === 'urgent' && grievance.priority !== 'urgent') {
      grievance.priority = 'urgent'
    } else if (analysisResult.urgencyLevel === 'high' && grievance.priority === 'medium') {
      grievance.priority = 'high'
    }

    await grievance.save()

    res.json({
      success: true,
      message: "AI analysis completed successfully",
      data: {
        grievance,
        analysis: analysisResult
      }
    })

  } catch (error) {
    console.error("AI analysis error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to perform AI analysis",
      error: error.message
    })
  }
})

// @route   POST /api/analysis/batch
// @desc    Batch analyze multiple grievances
// @access  Private (Admin only)
router.post("/batch", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    const { grievanceIds } = req.body

    if (!grievanceIds || !Array.isArray(grievanceIds) || grievanceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Grievance IDs array is required"
      })
    }

    const grievances = await Grievance.find({ _id: { $in: grievanceIds } })
    
    if (grievances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No grievances found"
      })
    }

    const results = []
    
    for (const grievance of grievances) {
      try {
        const analysisResult = await AIAnalysisEngine.analyzeGrievance(
          grievance.title,
          grievance.description,
          grievance.category
        )

        // Update grievance with analysis data
        grievance.analysisData = {
          sentiment: analysisResult.sentiment,
          urgencyScore: analysisResult.urgencyScore,
          keywords: analysisResult.keywords,
          suggestedDepartment: analysisResult.suggestedDepartment,
          confidence: analysisResult.confidence,
          analyzedAt: new Date()
        }

        await grievance.save()

        results.push({
          grievanceId: grievance._id,
          success: true,
          analysis: analysisResult
        })
      } catch (error) {
        console.error(`Analysis failed for grievance ${grievance._id}:`, error)
        results.push({
          grievanceId: grievance._id,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    res.json({
      success: true,
      message: `Batch analysis completed. ${successCount} successful, ${failureCount} failed.`,
      data: {
        results,
        summary: {
          total: grievances.length,
          successful: successCount,
          failed: failureCount
        }
      }
    })

  } catch (error) {
    console.error("Batch analysis error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to perform batch analysis",
      error: error.message
    })
  }
})

// @route   GET /api/analysis/insights/:id
// @desc    Get detailed AI insights for a grievance
// @access  Private (Officer/Admin)
router.get("/insights/:id", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can view detailed insights."
      })
    }

    const grievanceId = req.params.id
    const grievance = await Grievance.findById(grievanceId)
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email department")

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      })
    }

    // Check officer permissions
    if (req.user.role === "officer") {
      const isAssignedToUser = grievance.assignedOfficer && grievance.assignedOfficer._id.toString() === req.user.id
      
      if (!isAssignedToUser) {
        return res.status(403).json({
          success: false,
          message: "Access denied - you can only view insights for cases assigned to you"
        })
      }
    }

    // Generate comprehensive insights
    const insights = {
      grievance: {
        id: grievance._id,
        title: grievance.title,
        status: grievance.status,
        priority: grievance.priority,
        category: grievance.category,
        department: grievance.department
      },
      analysis: grievance.analysisData || {},
      timeline: {
        created: grievance.createdAt,
        lastUpdated: grievance.updatedAt,
        daysSinceCreation: Math.floor((Date.now() - new Date(grievance.createdAt)) / (1000 * 60 * 60 * 24)),
        updatesCount: grievance.updates ? grievance.updates.length : 0
      },
      performance: {
        resolutionTime: grievance.resolutionTime || null,
        expectedResolution: grievance.expectedResolutionDate || null,
        actualResolution: grievance.actualResolutionDate || null
      },
      citizen: grievance.isAnonymous ? null : {
        name: grievance.citizen?.name,
        email: grievance.citizen?.email
      },
      officer: grievance.assignedOfficer ? {
        name: grievance.assignedOfficer.name,
        email: grievance.assignedOfficer.email,
        department: grievance.assignedOfficer.department
      } : null
    }

    res.json({
      success: true,
      data: insights
    })

  } catch (error) {
    console.error("Get insights error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI insights",
      error: error.message
    })
  }
})

// @route   GET /api/analysis/summary
// @desc    Get AI analysis summary statistics
// @access  Private (Officer/Admin)
router.get("/summary", auth, async (req, res) => {
  try {
    if (req.user.role === "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only officers and admins can view analysis summary."
      })
    }

    const { role, department, id } = req.user
    
    // Build filter based on user role
    let filter = {}
    if (role === "officer") {
      const userDepartment = department ? department.toUpperCase() : null
      if (userDepartment) {
        filter.$or = [
          { assignedOfficer: id },
          { department: userDepartment }
        ]
      }
    }

    // Get analysis statistics
    const [
      totalAnalyzed,
      sentimentStats,
      urgencyStats,
      categoryAccuracy
    ] = await Promise.all([
      Grievance.countDocuments({
        ...filter,
        "analysisData.sentiment": { $exists: true }
      }),
      
      Grievance.aggregate([
        { $match: { ...filter, "analysisData.sentiment": { $exists: true } } },
        { $group: { _id: "$analysisData.sentiment", count: { $sum: 1 } } }
      ]),
      
      Grievance.aggregate([
        { $match: { ...filter, "analysisData.urgencyScore": { $exists: true } } },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $gte: ["$analysisData.urgencyScore", 80] }, then: "urgent" },
                  { case: { $gte: ["$analysisData.urgencyScore", 65] }, then: "high" },
                  { case: { $gte: ["$analysisData.urgencyScore", 35] }, then: "medium" }
                ],
                default: "low"
              }
            },
            count: { $sum: 1 },
            avgScore: { $avg: "$analysisData.urgencyScore" }
          }
        }
      ]),
      
      Grievance.aggregate([
        { $match: { ...filter, "analysisData.confidence": { $exists: true } } },
        {
          $group: {
            _id: null,
            avgConfidence: { $avg: "$analysisData.confidence" },
            highConfidence: {
              $sum: { $cond: [{ $gte: ["$analysisData.confidence", 0.8] }, 1, 0] }
            },
            total: { $sum: 1 }
          }
        }
      ])
    ])

    const summary = {
      totalAnalyzed,
      sentimentDistribution: sentimentStats,
      urgencyDistribution: urgencyStats,
      accuracy: {
        averageConfidence: categoryAccuracy[0]?.avgConfidence || 0,
        highConfidenceCount: categoryAccuracy[0]?.highConfidence || 0,
        highConfidencePercentage: categoryAccuracy[0]?.total > 0 
          ? Math.round((categoryAccuracy[0].highConfidence / categoryAccuracy[0].total) * 100)
          : 0
      }
    }

    res.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error("Analysis summary error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis summary",
      error: error.message
    })
  }
})

module.exports = router