const User = require("../models/User")
const Department = require("../models/Department")
const Grievance = require("../models/Grievance")

/**
 * Smart routing algorithm to assign grievances to appropriate officers
 */
class SmartRoutingEngine {
  
  /**
   * Route grievance to the best available officer
   * @param {Object} grievance - The grievance object
   * @returns {Object} - Routing result with assigned officer
   */
  static async routeGrievance(grievance) {
    try {
      console.log("Starting smart routing for grievance:", grievance._id)
      
      // Step 1: Find department based on category
      const department = await this.findDepartmentByCategory(grievance.category)
      if (!department) {
        throw new Error(`No department found for category: ${grievance.category}`)
      }

      console.log("Department found:", department.name)

      // Step 2: Get available officers in the department
      const availableOfficers = await this.getAvailableOfficers(department.code)
      if (availableOfficers.length === 0) {
        throw new Error(`No available officers in department: ${department.name}`)
      }

      console.log("Available officers:", availableOfficers.length)

      // Step 3: Calculate officer scores based on multiple factors
      const officerScores = await this.calculateOfficerScores(
        availableOfficers,
        grievance
      )

      // Step 4: Select the best officer
      const bestOfficer = this.selectBestOfficer(officerScores)

      console.log("Best officer selected:", bestOfficer.officer.name)

      return {
        success: true,
        assignedOfficer: bestOfficer.officer,
        department: department,
        confidence: bestOfficer.score,
        reasoning: bestOfficer.reasoning
      }

    } catch (error) {
      console.error("Smart routing error:", error)
      return {
        success: false,
        error: error.message,
        fallbackDepartment: "municipal" // Default fallback
      }
    }
  }

  /**
   * Find department by category
   */
  static async findDepartmentByCategory(category) {
    // Category to department mapping
    const categoryDepartmentMap = {
      infrastructure: "municipal",
      sanitation: "municipal", 
      water_supply: "municipal",
      electricity: "municipal",
      transportation: "transport",
      healthcare: "health",
      education: "education",
      police: "police",
      revenue: "revenue",
      other: "municipal"
    }

    const departmentCode = (categoryDepartmentMap[category] || "municipal").toUpperCase()
    
    return await Department.findOne({ 
      code: departmentCode, 
      isActive: true 
    }).populate("officers")
  }

  /**
   * Get available officers in department
   */
  static async getAvailableOfficers(departmentCode) {
    return await User.find({
      role: "officer",
      department: departmentCode,
      isActive: true
    })
  }

  /**
   * Calculate scores for each officer based on multiple factors
   */
  static async calculateOfficerScores(officers, grievance) {
    const scores = []

    for (const officer of officers) {
      const score = await this.calculateIndividualScore(officer, grievance)
      scores.push({
        officer,
        score: score.totalScore,
        reasoning: score.reasoning,
        factors: score.factors
      })
    }

    return scores.sort((a, b) => b.score - a.score)
  }

  /**
   * Calculate individual officer score
   */
  static async calculateIndividualScore(officer, grievance) {
    const factors = {
      workload: 0,
      experience: 0,
      performance: 0,
      availability: 0,
      specialization: 0
    }

    const reasoning = []

    // Factor 1: Current workload (40% weight)
    const currentWorkload = await this.getOfficerWorkload(officer._id)
    factors.workload = Math.max(0, (10 - currentWorkload) / 10) * 40
    reasoning.push(`Workload: ${currentWorkload} active cases`)

    // Factor 2: Experience (20% weight)
    const experience = await this.getOfficerExperience(officer._id)
    factors.experience = Math.min(experience / 100, 1) * 20
    reasoning.push(`Experience: ${experience} resolved cases`)

    // Factor 3: Performance (25% weight)
    const performance = await this.getOfficerPerformance(officer._id)
    factors.performance = performance * 25
    reasoning.push(`Performance: ${Math.round(performance * 100)}% avg rating`)

    // Factor 4: Availability (10% weight)
    const availability = await this.checkOfficerAvailability(officer._id)
    factors.availability = availability ? 10 : 0
    reasoning.push(`Available: ${availability ? 'Yes' : 'No'}`)

    // Factor 5: Category specialization (5% weight)
    const specialization = await this.getCategorySpecialization(officer._id, grievance.category)
    factors.specialization = specialization * 5
    reasoning.push(`Category expertise: ${Math.round(specialization * 100)}%`)

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0)

    return {
      totalScore,
      factors,
      reasoning
    }
  }

  /**
   * Get officer's current workload
   */
  static async getOfficerWorkload(officerId) {
    return await Grievance.countDocuments({
      assignedOfficer: officerId,
      status: { $in: ["pending", "in_progress"] }
    })
  }

  /**
   * Get officer's experience (total resolved cases)
   */
  static async getOfficerExperience(officerId) {
    return await Grievance.countDocuments({
      assignedOfficer: officerId,
      status: "resolved"
    })
  }

  /**
   * Get officer's performance rating
   */
  static async getOfficerPerformance(officerId) {
    const performanceData = await Grievance.aggregate([
      {
        $match: {
          assignedOfficer: officerId,
          status: "resolved",
          "feedback.rating": { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$feedback.rating" },
          totalRated: { $sum: 1 }
        }
      }
    ])

    if (performanceData.length === 0) return 0.7 // Default neutral rating

    const avgRating = performanceData[0].avgRating
    return Math.min(avgRating / 5, 1) // Normalize to 0-1 scale
  }

  /**
   * Check if officer is currently available
   */
  static async checkOfficerAvailability(officerId) {
    // Simple availability check - can be enhanced with calendar integration
    const now = new Date()
    const hour = now.getHours()
    
    // Assume working hours are 9 AM to 5 PM
    return hour >= 9 && hour < 17
  }

  /**
   * Get officer's specialization in specific category
   */
  static async getCategorySpecialization(officerId, category) {
    const categoryExperience = await Grievance.aggregate([
      {
        $match: {
          assignedOfficer: officerId,
          status: "resolved"
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ])

    const totalResolved = categoryExperience.reduce((sum, cat) => sum + cat.count, 0)
    if (totalResolved === 0) return 0.5 // Default neutral specialization

    const categoryCount = categoryExperience.find(cat => cat._id === category)?.count || 0
    return Math.min(categoryCount / totalResolved, 1)
  }

  /**
   * Select the best officer from scored list
   */
  static selectBestOfficer(officerScores) {
    if (officerScores.length === 0) {
      throw new Error("No officers available for assignment")
    }

    return officerScores[0] // Already sorted by score (highest first)
  }

  /**
   * Auto-assign grievance using smart routing
   */
  static async autoAssignGrievance(grievanceId) {
    try {
      const grievance = await Grievance.findById(grievanceId)
      if (!grievance) {
        throw new Error("Grievance not found")
      }

      if (grievance.assignedOfficer) {
        return {
          success: false,
          message: "Grievance already assigned"
        }
      }

      const routingResult = await this.routeGrievance(grievance)
      
      if (routingResult.success) {
        // Update grievance with assigned officer
        grievance.assignedOfficer = routingResult.assignedOfficer._id
        grievance.department = routingResult.department.code
        grievance.status = "assigned"
        
        // Add routing information to updates
        grievance.updates.push({
          message: `Auto-assigned to ${routingResult.assignedOfficer.name} (${routingResult.department.name}) - Confidence: ${Math.round(routingResult.confidence)}%`,
          updatedBy: null, // System assignment
          status: "in_progress",
          timestamp: new Date()
        })

        await grievance.save()

        return {
          success: true,
          grievance,
          routing: routingResult
        }
      } else {
        return routingResult
      }

    } catch (error) {
      console.error("Auto-assignment error:", error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Reassign grievance to different officer
   */
  static async reassignGrievance(grievanceId, newOfficerId, reassignedBy) {
    try {
      const grievance = await Grievance.findById(grievanceId)
      if (!grievance) {
        throw new Error("Grievance not found")
      }

      const newOfficer = await User.findById(newOfficerId)
      if (!newOfficer || newOfficer.role !== "officer") {
        throw new Error("Invalid officer for reassignment")
      }

      const oldOfficer = grievance.assignedOfficer
      grievance.assignedOfficer = newOfficerId

      // Add reassignment note
      grievance.updates.push({
        message: `Reassigned from ${oldOfficer ? 'previous officer' : 'unassigned'} to ${newOfficer.name}`,
        updatedBy: reassignedBy,
        status: grievance.status,
        timestamp: new Date()
      })

      await grievance.save()

      return {
        success: true,
        grievance,
        message: "Grievance reassigned successfully"
      }

    } catch (error) {
      console.error("Reassignment error:", error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

module.exports = SmartRoutingEngine