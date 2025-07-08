"use client"

import { useState, useEffect } from "react"
import { X, User, Building, AlertTriangle, CheckCircle, Loader } from "lucide-react"

const AdminReassignModal = ({ grievance, onClose, onSuccess }) => {
  const [officers, setOfficers] = useState([])
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingOfficers, setFetchingOfficers] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOfficers()
  }, [])

  const fetchOfficers = async () => {
    try {
      setFetchingOfficers(true)
      
      // Fetch all departments with officers
      const response = await fetch("/api/departments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Extract all officers from all departments
        const allOfficers = []
        data.data.forEach(department => {
          if (department.officers && department.officers.length > 0) {
            department.officers.forEach(officer => {
              allOfficers.push({
                ...officer,
                departmentName: department.name,
                departmentCode: department.code
              })
            })
          }
        })
        
        setOfficers(allOfficers)
      } else {
        setError("Failed to fetch officers")
      }
    } catch (error) {
      console.error("Fetch officers error:", error)
      setError("Network error while fetching officers")
    } finally {
      setFetchingOfficers(false)
    }
  }

  const handleReassign = async () => {
    if (!selectedOfficer) {
      setError("Please select an officer")
      return
    }

    if (!reason.trim()) {
      setError("Please provide a reason for reassignment")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/grievances/${grievance._id}/reassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          officerId: selectedOfficer,
          reason: reason.trim()
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to reassign grievance")
      }
    } catch (error) {
      console.error("Reassign error:", error)
      setError("Network error during reassignment")
    } finally {
      setLoading(false)
    }
  }

  const getSelectedOfficerInfo = () => {
    return officers.find(officer => officer._id === selectedOfficer)
  }

  const groupedOfficers = officers.reduce((groups, officer) => {
    const dept = officer.departmentName || "Unassigned"
    if (!groups[dept]) {
      groups[dept] = []
    }
    groups[dept].push(officer)
    return groups
  }, {})

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Reassign Grievance</h2>
            <p className="text-slate-400 text-sm mt-1">
              Assign this grievance to a different officer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Assignment */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Current Assignment</h3>
            {grievance.assignedOfficer ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{grievance.assignedOfficer.name}</p>
                  <p className="text-slate-400 text-sm">{grievance.assignedOfficer.email}</p>
                  <p className="text-slate-400 text-sm capitalize">{grievance.assignedOfficer.department} Department</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No officer currently assigned</p>
            )}
          </div>

          {/* Officer Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select New Officer *
            </label>
            
            {fetchingOfficers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                <span className="ml-2 text-slate-400">Loading officers...</span>
              </div>
            ) : officers.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-slate-400">No officers available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedOfficers).map(([department, deptOfficers]) => (
                  <div key={department} className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {department}
                    </h4>
                    <div className="space-y-2 ml-6">
                      {deptOfficers.map((officer) => (
                        <label
                          key={officer._id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedOfficer === officer._id
                              ? "bg-purple-500/20 border-purple-500/50"
                              : "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="officer"
                            value={officer._id}
                            checked={selectedOfficer === officer._id}
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 focus:ring-purple-500"
                          />
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{officer.name}</p>
                            <p className="text-slate-400 text-sm">{officer.email}</p>
                          </div>
                          {grievance.assignedOfficer?._id === officer._id && (
                            <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reason for Reassignment *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
              placeholder="Explain why this reassignment is necessary..."
            />
          </div>

          {/* Impact Assessment */}
          {selectedOfficer && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Reassignment Impact
              </h4>
              <div className="text-sm text-blue-200 space-y-1">
                <p>• Officer will be notified immediately</p>
                <p>• Grievance status will be updated</p>
                <p>• Assignment history will be recorded</p>
                <p>• Citizen will receive notification</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleReassign}
            disabled={loading || !selectedOfficer || !reason.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Reassigning...
              </>
            ) : (
              "Reassign Grievance"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminReassignModal