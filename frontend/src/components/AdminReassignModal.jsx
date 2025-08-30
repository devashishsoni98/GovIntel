import { useState, useEffect } from "react"
import { X, User, Building, UserPlus, Loader, CheckCircle, AlertTriangle } from "lucide-react"

const AdminReassignModal = ({ grievance, onClose, onSuccess }) => {
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
                departmentCode: department.code,
                currentWorkload: 0 // Will be calculated if needed
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

    // Prevent reassigning to the same officer
    if (selectedOfficer === grievance.assignedOfficer?._id) {
      setError("Cannot reassign to the same officer")
      return
    }

    try {
      setLoading(true)
      setError("")

      console.log("Reassign request:", { grievanceId: grievance._id, officerId: selectedOfficer })
      const response = await fetch(`/api/grievances/${grievance._id}/reassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          officerId: selectedOfficer,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Reassign successful:", data)
        onSuccess()
      } else {
        const errorData = await response.json()
        console.error("Reassign failed:", errorData)
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

  const isCurrentlyAssigned = (officerId) => {
    return officerId === grievance.assignedOfficer?._id
  }

  // Group officers by department for better organization
  const groupedOfficers = officers.reduce((groups, officer) => {
    const dept = officer.departmentName || officer.department || 'Unknown'
    if (!groups[dept]) {
      groups[dept] = []
    }
    groups[dept].push(officer)
    return groups
  }, {})

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Reassign Grievance</h2>
            <p className="text-slate-400 text-sm mt-1">
              Change the assigned officer for this grievance
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

          {/* Current Assignment */}
          {grievance.assignedOfficer && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Currently Assigned To
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{grievance.assignedOfficer.name}</p>
                  <p className="text-blue-200 text-sm">{grievance.assignedOfficer.email}</p>
                  <p className="text-blue-300 text-xs">{grievance.assignedOfficer.department} Department</p>
                </div>
              </div>
            </div>
          )}

          {/* Officer Selection */}
          <div>
            <h3 className="text-white font-medium mb-3">Select New Officer</h3>
            
            {fetchingOfficers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                <span className="ml-2 text-slate-400">Loading officers...</span>
              </div>
            ) : officers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No officers available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedOfficers).map(([departmentName, deptOfficers]) => (
                  <div key={departmentName}>
                    <h4 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {departmentName}
                    </h4>
                    <div className="space-y-2 ml-6">
                      {deptOfficers.map((officer) => {
                        const isCurrentlyAssignedOfficer = isCurrentlyAssigned(officer._id)
                        
                        return (
                          <label
                            key={officer._id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              isCurrentlyAssignedOfficer
                                ? "bg-blue-500/10 border-blue-500/30 opacity-60 cursor-not-allowed"
                                : selectedOfficer === officer._id
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
                              disabled={isCurrentlyAssignedOfficer}
                              className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 focus:ring-purple-500 disabled:opacity-50"
                            />
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">{officer.name}</p>
                                {isCurrentlyAssignedOfficer && (
                                  <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                    Currently Assigned
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 text-sm">{officer.email}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {officer.departmentName || officer.department}
                                </span>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reassignment Impact */}
          {selectedOfficer && !isCurrentlyAssigned(selectedOfficer) && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Reassignment Impact
              </h4>
              <div className="text-sm text-green-200 space-y-1">
                <p>• New officer will be notified immediately</p>
                <p>• Previous officer will be removed from assignment</p>
                <p>• Reassignment history will be recorded</p>
                <p>• Citizen will receive notification of change</p>
              </div>
            </div>
          )}

          {/* Warning for same officer */}
          {selectedOfficer && isCurrentlyAssigned(selectedOfficer) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-300 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Same Officer Selected
              </h4>
              <p className="text-yellow-200 text-sm">
                This officer is already assigned to this grievance. Please select a different officer.
              </p>
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
            onClick={handleReassign}
            disabled={loading || !selectedOfficer || isCurrentlyAssigned(selectedOfficer)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Reassigning...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Reassign Grievance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminReassignModal