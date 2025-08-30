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
      revenue: "revenue",
      transportation: "transport",
      healthcare: "health",
      education: "education",
      police: "police",
      other: "municipal"
    }

    const departmentCode = categoryDepartmentMap[category] || "municipal"
    
    return await Department.findOne({ 
      code: departmentCode.toUpperCase(), 
      isActive: true 
    }).populate("officers")
  }

  /**
   * Get available officers in department
   */
  static async getAvailableOfficers(departmentCode) {
    const officers = await User.find({
      role: "officer",
      department: departmentCode,
      isActive: true
    })
    
    console.log(`Found ${officers.length} officers in department ${departmentCode}:`, 
      officers.map(o => ({ name: o.name, email: o.email })))
    
    return officers
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
    factors.experience = Math.min(experience / 50, 1) * 20 // Reduced threshold for better distribution
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
      status: { $in: ["pending", "assigned", "in_progress"] }
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

    if (performanceData.length === 0) return 0.8 // Default good rating for new officers

    const avgRating = performanceData[0].avgRating
    return Math.min(avgRating / 5, 1) // Normalize to 0-1 scale
  }

  /**
   * Check if officer is currently available
   */
  static async checkOfficerAvailability(officerId) {
    // For now, consider all active officers as available
    // In a real system, this could check:
    // - Working hours
    // - Officer's current status
    // - Leave/vacation status
    // - Current workload capacity
    
    const officer = await User.findById(officerId)
    return officer && officer.isActive
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
    if (totalResolved === 0) return 0.8 // Higher default for new officers to encourage assignment

    const categoryCount = categoryExperience.find(cat => cat._id === category)?.count || 0
    const specialization = categoryCount / totalResolved
    
    // Boost specialization if officer has handled this category before
    return categoryCount > 0 ? Math.min(specialization + 0.3, 1) : Math.max(specialization, 0.5)
  }

  /**
   * Select the best officer from scored list
   */
  static selectBestOfficer(officerScores) {
    if (officerScores.length === 0) {
      throw new Error("No officers available for assignment")
    }

    // Log all officer scores for debugging
    console.log("Officer scores:", officerScores.map(os => ({
      name: os.officer.name,
      score: os.score,
      reasoning: os.reasoning
    })))

    // Return the highest scoring officer
    const bestOfficer = officerScores[0] // Already sorted by score (highest first)
    console.log("Selected best officer:", bestOfficer.officer.name, "with score:", bestOfficer.score)
    
    return bestOfficer
  }

  /**
   * Auto-assign grievance using smart routing
   */
  static async autoAssignGrievance(grievanceId) {
    try {
      console.log("AutoAssignGrievance called with ID:", grievanceId)
      
      const grievance = await Grievance.findById(grievanceId)
      if (!grievance) {
        console.log("Grievance not found:", grievanceId)
        return {
          success: false,
          error: "Grievance not found"
        }
      }

      if (grievance.assignedOfficer) {
        console.log("Grievance already assigned to:", grievance.assignedOfficer)
        return {
          success: false,
          error: "Grievance already assigned",
          grievance
        }
      }

      console.log("Starting routing for grievance category:", grievance.category)
      const routingResult = await this.routeGrievance(grievance)
      
      if (routingResult.success) {
        console.log("Routing successful, updating grievance...")
        // Update grievance with assigned officer
        grievance.assignedOfficer = routingResult.assignedOfficer._id
        
        // Ensure department is set correctly
        grievance.department = routingResult.department.code
        
        // Update status to assigned
        if (grievance.status === "pending") {
          grievance.status = "assigned"
        }
        
        // Add routing information to updates
        grievance.updates.push({
          message: `Auto-assigned to ${routingResult.assignedOfficer.name} (${routingResult.department.name}) - Confidence: ${Math.round(routingResult.confidence)}%`,
          updatedBy: routingResult.assignedOfficer._id, // Assigned officer
          status: "assigned",
          timestamp: new Date()
        })

        console.log("Saving grievance with assignment...")
        await grievance.save()
        console.log("Grievance saved successfully")

        return {
          success: true,
          grievance,
          routing: routingResult
        }
      } else {
        console.log("Routing failed:", routingResult.error)
        return {
          success: false,
          error: routingResult.error || "Failed to find suitable officer",
          grievance
        }
      }

    } catch (error) {
      console.error("Auto-assignment error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Reassign grievance to different officer
   */
  static async reassignGrievance(grievanceId, newOfficerId, reassignedBy) {
    try {
      console.log("SmartRouting: Starting reassignment", { grievanceId, newOfficerId, reassignedBy })
      
      const grievance = await Grievance.findById(grievanceId)
      if (!grievance) {
        console.log("SmartRouting: Grievance not found")
        return {
          success: false,
          error: "Grievance not found"
        }
      }

      const newOfficer = await User.findById(newOfficerId)
      if (!newOfficer || newOfficer.role !== "officer") {
        console.log("SmartRouting: Invalid officer", { newOfficerId, officer: newOfficer })
        return {
          success: false,
          error: "Invalid officer for reassignment"
        }
      }

      // Get old officer name for logging
      const oldOfficerName = grievance.assignedOfficer ? 
        (await User.findById(grievance.assignedOfficer))?.name || 'previous officer' : 
        'unassigned'
      
      console.log("SmartRouting: Reassigning from", oldOfficerName, "to", newOfficer.name)
      
      // Update assignment
      grievance.assignedOfficer = newOfficerId
      
      // Update status to assigned if it was pending
      if (grievance.status === "pending") {
        grievance.status = "assigned"
      }

      // Add reassignment note
      grievance.updates.push({
        message: `Reassigned from ${oldOfficerName} to ${newOfficer.name}`,
        updatedBy: reassignedBy,
        status: "assigned",
        timestamp: new Date()
      })

      console.log("SmartRouting: Saving grievance...")
      await grievance.save()
      console.log("SmartRouting: Grievance saved successfully")

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

  /**
   * Get available officers for assignment
   */
  static async getAvailableOfficersForAssignment(departmentCode = null) {
    try {
      const filter = {
        role: "officer",
        isActive: true
      }
      
      if (departmentCode) {
        filter.department = departmentCode
      }
      
      const officers = await User.find(filter).select("name email department")
      // Get workload for each officer
      const officersWithWorkload = await Promise.all(
        officers.map(async (officer) => {
          const workload = await Grievance.countDocuments({
            assignedOfficer: officer._id,
            status: { $in: ["pending", "assigned", "in_progress"] }
          })
          
          return {
            ...officer.toObject(),
            currentWorkload: workload
          }
        })
      )
      
      // Sort by workload (ascending)
      officersWithWorkload.sort((a, b) => a.currentWorkload - b.currentWorkload)
      
      return {
        success: true,
        officers: officersWithWorkload
      }
    } catch (error) {
      console.error("Get available officers error:", error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

module.exports = SmartRoutingEngine