"use client"

import { useState } from "react"
import { X, Star, Loader } from "lucide-react"

const FeedbackModal = ({ grievance, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please provide a rating")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/grievances/${grievance._id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || ""
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Feedback submitted successfully:", data)
        onSuccess()
      } else {
        const errorData = await response.json()
        console.error("Feedback submission failed:", errorData)
        setError(errorData.message || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Feedback submission error:", error)
      setError("Network error during feedback submission")
    } finally {
      setLoading(false)
    }
  }

  const ratingLabels = {
    1: "Very Poor",
    2: "Poor", 
    3: "Average",
    4: "Good",
    5: "Excellent"
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Rate & Review</h2>
            <p className="text-slate-400 text-sm mt-1">
              How satisfied are you with the resolution?
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Grievance Summary */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 sm:p-4">
            <h3 className="text-white font-medium mb-2">{grievance.title}</h3>
            <p className="text-slate-400 text-sm">
              Resolved by {grievance.assignedOfficer?.name || "Officer"}
            </p>
            {grievance.resolutionTime && (
              <p className="text-slate-500 text-xs mt-1">
                Resolution time: {grievance.resolutionTime} hours
              </p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <p className="text-sm text-slate-400">
                {ratingLabels[hoveredRating || rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
              placeholder="Share your experience or suggestions for improvement..."
            />
          </div>

          {/* Feedback Impact */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-300 font-medium mb-2">Your Feedback Helps</h4>
            <div className="text-sm text-green-200 space-y-1">
              <p>• Improve service quality for future cases</p>
              <p>• Recognize outstanding officer performance</p>
              <p>• Identify areas for system improvement</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-700 sticky bottom-0 bg-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal