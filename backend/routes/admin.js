const express = require("express")
const Grievance = require("../models/Grievance")
const User = require("../models/User")
const Department = require("../models/Department")
const auth = require("../middleware/auth")

const router = express.Router()

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

// @route   DELETE /api/admin/grievances/:id
// @desc    Delete a single grievance (Admin only)
// @access  Private (Admin)
router.delete("/grievances/:id", auth, requireAdmin, async (req, res) => {
  try {
    const grievanceId = req.params.id
    const adminId = req.user.id

    // Find the grievance first to get details for audit
    const grievance = await Grievance.findById(grievanceId)
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email")

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      })
    }

    // Store grievance details for audit log
    const auditData = {
      grievanceId: grievance._id,
      title: grievance.title,
      citizenEmail: grievance.citizen?.email,
      assignedOfficer: grievance.assignedOfficer?.email,
      status: grievance.status,
      deletedBy: adminId,
      deletedAt: new Date(),
      reason: req.body.reason || "Admin deletion"
    }

    // Delete the grievance
    await Grievance.findByIdAndDelete(grievanceId)

    // Update officer workload if assigned
    if (grievance.assignedOfficer) {
      // You could implement workload tracking here
      console.log(`Updating workload for officer: ${grievance.assignedOfficer._id}`)
    }

    // Log the deletion (you could store this in a separate audit collection)
    console.log("Grievance deleted:", auditData)

    res.json({
      success: true,
      message: "Grievance deleted successfully",
      auditData
    })

  } catch (error) {
    console.error("Delete grievance error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete grievance"
    })
  }
})

// @route   DELETE /api/admin/grievances/bulk
// @desc    Delete multiple grievances (Admin only)
// @access  Private (Admin)
router.delete("/grievances/bulk", auth, requireAdmin, async (req, res) => {
  try {
    const { grievanceIds, reason } = req.body
    const adminId = req.user.id

    if (!grievanceIds || !Array.isArray(grievanceIds) || grievanceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Grievance IDs array is required"
      })
    }

    // Find all grievances to be deleted for audit
    const grievances = await Grievance.find({ _id: { $in: grievanceIds } })
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email")

    if (grievances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No grievances found with provided IDs"
      })
    }

    // Create audit data
    const auditData = grievances.map(grievance => ({
      grievanceId: grievance._id,
      title: grievance.title,
      citizenEmail: grievance.citizen?.email,
      assignedOfficer: grievance.assignedOfficer?.email,
      status: grievance.status,
      deletedBy: adminId,
      deletedAt: new Date(),
      reason: reason || "Bulk admin deletion"
    }))

    // Delete all grievances
    const deleteResult = await Grievance.deleteMany({ _id: { $in: grievanceIds } })

    // Log the bulk deletion
    console.log("Bulk grievances deleted:", auditData)

    res.json({
      success: true,
      message: `${deleteResult.deletedCount} grievances deleted successfully`,
      deletedCount: deleteResult.deletedCount,
      auditData
    })

  } catch (error) {
    console.error("Bulk delete grievances error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete grievances"
    })
  }
})

// @route   GET /api/admin/audit/deletions
// @desc    Get deletion audit trail (Admin only)
// @access  Private (Admin)
router.get("/audit/deletions", auth, requireAdmin, async (req, res) => {
  try {
    // This would typically come from a dedicated audit collection
    // For now, return a placeholder response
    res.json({
      success: true,
      message: "Audit trail feature - implement with dedicated audit collection",
      data: []
    })
  } catch (error) {
    console.error("Get audit trail error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit trail"
    })
  }
})

module.exports = router