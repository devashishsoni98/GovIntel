"use client"

import { useState, useEffect } from "react"
import { X, User, Building, UserPlus, Loader, CheckCircle, FileText } from "lucide-react"
import api from "../api"

const AdminAssignModal = ({ grievance, onClose, onSuccess }) => {
  const [officers, setOfficers] = useState([])
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingOfficers, setFetchingOfficers] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOfficers()
  }, [])

  const fetchOfficers = async () => {
    try {
      setFetchingOfficers(true)
      setError("")

      const response = await api.get("/departments")
      const data = response.data

      if (data.success && data.data) {
        const allOfficers = []

        data.data.forEach((department) => {
          if (department.officers && department.officers.length > 0) {
            department.officers.forEach((officer) => {
              allOfficers.push({
                ...officer,
                departmentName: department.name,
                departmentCode: department.code,
                currentWorkload: 0,
              })
            })
          }
        })

        setOfficers(allOfficers)
      } else {
        setError("Failed to fetch officers")
      }
    } catch (err) {
      console.error("Fetch officers error:", err)
      setError("Network error while fetching officers")
    } finally {
      setFetchingOfficers(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedOfficer) {
      setError("Please select an officer")
      return
    }

    try {
      setLoading(true)
      setError("")

      console.log("Manual assign request:", {
        grievanceId: grievance._id,
        officerId: selectedOfficer,
      })

      const response = await api.post(
        `/grievances/${grievance._id}/reassign`,
        {
          officerId: selectedOfficer,
        }
      )

      const data = response.data

      if (data.success) {
        console.log("Manual assign successful:", data)
        onSuccess()
      } else {
        setError(data.message || "Failed to assign grievance")
      }
    } catch (err) {
      console.error("Assign error:", err)
      setError(
        err.response?.data?.message ||
          "Network error during assignment"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Auto assign request for grievance:", grievance._id)

      const response = await api.post(
        `/grievances/${grievance._id}/auto-assign`
      )

      const data = response.data

      if (data.success) {
        console.log("Auto assign successful:", data)
        onSuccess()
      } else {
        setError(data.message || "Failed to auto-assign grievance")
      }
    } catch (err) {
      console.error("Auto-assign error:", err)
      setError(
        err.response?.data?.message ||
          "Network error during auto-assignment"
      )
    } finally {
      setLoading(false)
    }
  }

  const getSelectedOfficerInfo = () => {
    return officers.find((officer) => officer._id === selectedOfficer)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Assign Grievance</h2>
            <p className="text-slate-400 text-sm mt-1">
              Assign this grievance to an officer
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Grievance Info */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Grievance Details</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-400">Title:</span> {grievance.title}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Department:</span> {grievance.department}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Category:</span> {grievance.category.replace('_', ' ')}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Priority:</span> {grievance.priority}
              </p>
            </div>
          </div>

          {/* Auto Assignment Option */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Quick Auto Assignment
            </h3>
            <p className="text-blue-200 text-sm mb-4">
              Let AI automatically select the best officer based on workload, experience, and availability.
            </p>
            <button
              onClick={handleAutoAssign}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Auto Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Auto Assign Officer
                </>
              )}
            </button>
          </div>

          {/* Manual Assignment */}
          <div>
            <h3 className="text-white font-medium mb-3">Manual Assignment</h3>
            
            {fetchingOfficers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                <span className="ml-2 text-slate-400">Loading officers...</span>
              </div>
            ) : officers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No officers available in {grievance.department} department</p>
              </div>
            ) : (
              <div className="space-y-3">
                {officers.filter(officer => officer.departmentCode === grievance.department || officer.department === grievance.department).map((officer) => (
                  <label
                    key={officer._id}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
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
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{officer.name}</p>
                      <p className="text-slate-400 text-sm">{officer.email}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {officer.departmentName || officer.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {officer.currentWorkload} active cases
                        </span>
                      </div>
                    </div>
                    {officer.currentWorkload === 0 && (
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                        Available
                      </span>
                    )}
                  </label>
                ))}
                
                {/* Show message if no officers in department */}
                {officers.filter(officer => officer.departmentCode === grievance.department || officer.department === grievance.department).length === 0 && (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No officers available in {grievance.department} department</p>
                    <p className="text-slate-500 text-sm mt-2">Try auto-assignment to find officers from other departments</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assignment Impact */}
          {selectedOfficer && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Assignment Impact
              </h4>
              <div className="text-sm text-green-200 space-y-1">
                <p>• Officer will be notified immediately</p>
                <p>• Grievance status will be updated to "assigned"</p>
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 sticky bottom-0 bg-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedOfficer}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Assign Grievance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminAssignModal