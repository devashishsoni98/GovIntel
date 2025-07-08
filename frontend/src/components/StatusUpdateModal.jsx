"use client"

import { useState } from "react"
import { X, AlertTriangle, CheckCircle, Clock, XCircle, Loader } from "lucide-react"

const StatusUpdateModal = ({ grievance, onClose, onSuccess }) => {
  const [status, setStatus] = useState(grievance.status)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const statusOptions = [
    { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-400" },
    { value: "in_progress", label: "In Progress", icon: AlertTriangle, color: "text-blue-400" },
    { value: "resolved", label: "Resolved", icon: CheckCircle, color: "text-green-400" },
    { value: "closed", label: "Closed", icon: CheckCircle, color: "text-gray-400" },
    { value: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400" },
  ]

  const handleUpdate = async () => {
    if (!comment.trim()) {
      setError("Please provide a comment for this status update")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/grievances/${grievance._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          status,
          comment: comment.trim()
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Status update error:", error)
      setError("Network error during status update")
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (statusValue) => {
    return statusOptions.find(option => option.value === statusValue)
  }

  const currentStatusInfo = getStatusInfo(grievance.status)
  const newStatusInfo = getStatusInfo(status)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Update Status</h2>
            <p className="text-slate-400 text-sm mt-1">
              Change the status of this grievance
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
          {/* Current Status */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Current Status</h3>
            <div className="flex items-center gap-2">
              {currentStatusInfo && (
                <>
                  <currentStatusInfo.icon className={`w-5 h-5 ${currentStatusInfo.color}`} />
                  <span className={`font-medium ${currentStatusInfo.color}`}>
                    {currentStatusInfo.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              New Status *
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    status === option.value
                      ? "bg-purple-500/20 border-purple-500/50"
                      : "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 focus:ring-purple-500"
                  />
                  <option.icon className={`w-5 h-5 ${option.color}`} />
                  <span className="text-white font-medium">{option.label}</span>
                  {option.value === grievance.status && (
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded ml-auto">
                      Current
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Update Comment *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
              placeholder="Provide details about this status update..."
            />
            <p className="text-slate-500 text-xs mt-1">
              This comment will be visible to the citizen and added to the grievance timeline.
            </p>
          </div>

          {/* Status Change Impact */}
          {status !== grievance.status && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Status Change Impact</h4>
              <div className="text-sm text-blue-200 space-y-1">
                <p>• Citizen will be notified of this update</p>
                <p>• Timeline will be updated with your comment</p>
                {status === "resolved" && (
                  <p>• Citizen will be able to provide feedback</p>
                )}
                {status === "closed" && (
                  <p>• Grievance will be marked as completed</p>
                )}
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
            onClick={handleUpdate}
            disabled={loading || !comment.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StatusUpdateModal