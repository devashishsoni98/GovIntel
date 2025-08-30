"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  Eye,
  Edit,
  Star,
  MessageSquare,
  Brain,
  UserPlus,
  Loader,
  Phone,
  Mail,
  Tag,
  Activity,
  Target,
  Paperclip
} from "lucide-react"
import { selectUser, USER_ROLES } from "../redux/slices/authSlice"
import StatusUpdateModal from "../components/StatusUpdateModal"
import FeedbackModal from "../components/FeedbackModal"
import FilePreview from "../components/FilePreview"
import AIInsightsPanel from "../components/AIInsightsPanel"
import AdminAssignModal from "../components/AdminAssignModal"
import AdminReassignModal from "../components/AdminReassignModal"

const GrievanceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  const [grievance, setGrievance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchGrievance()
    }
  }, [id])

  const fetchGrievance = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/grievances/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Grievance data:", data)
        setGrievance(data.data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to fetch grievance details")
      }
    } catch (error) {
      console.error("Fetch grievance error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = () => {
    setShowStatusModal(false)
    fetchGrievance() // Refresh data
  }

  const handleFeedbackSubmit = () => {
    setShowFeedbackModal(false)
    fetchGrievance() // Refresh data
  }

  const handleFilePreview = (attachment) => {
    setPreviewFile(attachment)
    setShowFilePreview(true)
  }

  const handleAssignSuccess = () => {
    setShowAssignModal(false)
    fetchGrievance() // Refresh data
  }

  const handleReassignSuccess = () => {
    setShowReassignModal(false)
    fetchGrievance() // Refresh data
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "assigned":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20"
      case "in_progress":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20"
      case "resolved":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      case "closed":
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
      case "rejected":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "assigned":
        return <UserPlus className="w-4 h-4" />
      case "in_progress":
        return <AlertTriangle className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
      case "closed":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) return <Eye className="w-4 h-4 text-blue-400" />
    if (mimetype.startsWith("video/")) return <Eye className="w-4 h-4 text-purple-400" />
    if (mimetype.startsWith("audio/")) return <Eye className="w-4 h-4 text-green-400" />
    return <Download className="w-4 h-4 text-slate-400" />
  }

  const canUpdateStatus = () => {
    return user?.role === USER_ROLES.OFFICER || user?.role === USER_ROLES.ADMIN
  }

  const canProvideFeedback = () => {
    return (
      user?.role === USER_ROLES.CITIZEN &&
      grievance?.citizen?._id === user?.id &&
      grievance?.status === "resolved" &&
      !grievance?.feedback?.rating
    )
  }

  const canViewAIInsights = () => {
    return user?.role === USER_ROLES.OFFICER || user?.role === USER_ROLES.ADMIN
  }

  const canAssignGrievance = () => {
    return user?.role === USER_ROLES.ADMIN
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="h-64 bg-slate-700 rounded-xl"></div>
            <div className="h-32 bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Grievance</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={fetchGrievance}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!grievance) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Grievance Not Found</h2>
            <p className="text-slate-400 mb-6">The requested grievance could not be found.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-purple-500 rounded-lg text-white font-medium hover:bg-purple-600 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto pt-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Grievance Details</h1>
              <p className="text-slate-400">
                {grievance.grievanceId && `ID: ${grievance.grievanceId} • `}
                Submitted {formatDate(grievance.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {canViewAIInsights() && (
              <button
                onClick={() => setShowAIInsights(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all hover:scale-105"
              >
                <Brain className="w-4 h-4" />
                AI Insights
              </button>
            )}

            {canAssignGrievance() && !grievance.assignedOfficer && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                Assign Officer
              </button>
            )}

            {canAssignGrievance() && grievance.assignedOfficer && (
              <button
                onClick={() => setShowReassignModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 hover:bg-orange-500/30 transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                Reassign
              </button>
            )}

            {canUpdateStatus() && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all hover:scale-105"
              >
                <Edit className="w-4 h-4" />
                Update Status
              </button>
            )}

            {canProvideFeedback() && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all hover:scale-105"
              >
                <Star className="w-4 h-4" />
                Rate & Review
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Grievance Overview */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{grievance.title}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(grievance.status)}`}
                    >
                      {getStatusIcon(grievance.status)}
                      {grievance.status.replace("_", " ")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(grievance.priority)}`}
                    >
                      <Target className="w-3 h-3" />
                      {grievance.priority} priority
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                      <Building className="w-3 h-3" />
                      {grievance.department}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{grievance.description}</p>
              </div>

              {/* Location */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Location
                </h3>
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <p className="text-slate-300 mb-2">{grievance.location.address}</p>
                  {grievance.location.landmark && (
                    <p className="text-slate-400 text-sm">
                      <span className="font-medium">Landmark:</span> {grievance.location.landmark}
                    </p>
                  )}
                  {grievance.location.coordinates && (
                    <p className="text-slate-400 text-sm">
                      <span className="font-medium">Coordinates:</span>{" "}
                      {grievance.location.coordinates.latitude}, {grievance.location.coordinates.longitude}
                    </p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {grievance.attachments && grievance.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-green-400" />
                    Attachments ({grievance.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {grievance.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => handleFilePreview(attachment)}
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(attachment.mimetype)}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{attachment.originalName}</p>
                            <p className="text-slate-400 text-sm">
                              {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {attachment.mimetype}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {grievance.aiAnalysis && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    AI Analysis
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Sentiment</p>
                      <p className={`font-medium capitalize ${
                        grievance.aiAnalysis.sentiment === 'positive' ? 'text-green-400' :
                        grievance.aiAnalysis.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {grievance.aiAnalysis.sentiment}
                      </p>
                    </div>
                    <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Urgency Score</p>
                      <p className="text-white font-medium">{grievance.aiAnalysis.urgencyScore}/100</p>
                    </div>
                    {grievance.aiAnalysis.keywords && grievance.aiAnalysis.keywords.length > 0 && (
                      <div className="sm:col-span-2 bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-2">Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {grievance.aiAnalysis.keywords.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Updates Timeline */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Timeline & Updates
              </h3>

              {grievance.updates && grievance.updates.length > 0 ? (
                <div className="space-y-4">
                  {grievance.updates
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((update, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            {getStatusIcon(update.status)}
                          </div>
                        </div>
                        <div className="flex-1 bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">{update.message}</p>
                            <span className="text-slate-400 text-sm">{formatDateShort(update.timestamp)}</span>
                          </div>
                          {update.updatedBy && (
                            <p className="text-slate-400 text-sm">
                              Updated by: {update.updatedBy.name || "System"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No updates yet</p>
                </div>
              )}
            </div>

            {/* Feedback Section */}
            {grievance.feedback?.rating && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Citizen Feedback
                </h3>
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < grievance.feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium">
                      {grievance.feedback.rating}/5 stars
                    </span>
                  </div>
                  {grievance.feedback.comment && (
                    <p className="text-slate-300">{grievance.feedback.comment}</p>
                  )}
                  <p className="text-slate-400 text-sm mt-2">
                    Submitted on {formatDate(grievance.feedback.submittedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Grievance Info */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <h3 className="text-lg font-bold text-white mb-4">Grievance Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Category</p>
                  <p className="text-white font-medium capitalize flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    {grievance.category.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-1">Department</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-400" />
                    {grievance.department}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-1">Priority</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(grievance.priority)}`}
                  >
                    <Target className="w-3 h-3" />
                    {grievance.priority}
                  </span>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-1">Submitted</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    {formatDate(grievance.createdAt)}
                  </p>
                </div>

                {grievance.expectedResolutionDate && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Expected Resolution</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      {formatDate(grievance.expectedResolutionDate)}
                    </p>
                  </div>
                )}

                {grievance.actualResolutionDate && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Actual Resolution</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {formatDate(grievance.actualResolutionDate)}
                    </p>
                  </div>
                )}

                {grievance.resolutionTime && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Resolution Time</p>
                    <p className="text-white font-medium">{grievance.resolutionTime} hours</p>
                  </div>
                )}
              </div>
            </div>

            {/* Citizen Information */}
            {!grievance.isAnonymous && grievance.citizen && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <h3 className="text-lg font-bold text-white mb-4">Citizen Information</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{grievance.citizen.name}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <Mail className="w-3 h-3" />
                      {grievance.citizen.email}
                    </div>
                    {grievance.citizen.phone && (
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Phone className="w-3 h-3" />
                        {grievance.citizen.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Officer */}
            {grievance.assignedOfficer && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.5s'}}>
                <h3 className="text-lg font-bold text-white mb-4">Assigned Officer</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{grievance.assignedOfficer.name}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <Mail className="w-3 h-3" />
                      {grievance.assignedOfficer.email}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <Building className="w-3 h-3" />
                      {grievance.assignedOfficer.department} Department
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Anonymous Notice */}
            {grievance.isAnonymous && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
                <h3 className="text-lg font-bold text-white mb-4">Anonymous Submission</h3>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    This grievance was submitted anonymously. Citizen details are not available.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showStatusModal && (
          <StatusUpdateModal
            grievance={grievance}
            onClose={() => setShowStatusModal(false)}
            onSuccess={handleStatusUpdate}
          />
        )}

        {showFeedbackModal && (
          <FeedbackModal
            grievance={grievance}
            onClose={() => setShowFeedbackModal(false)}
            onSuccess={handleFeedbackSubmit}
          />
        )}

        {showFilePreview && previewFile && (
          <FilePreview
            attachment={previewFile}
            onClose={() => {
              setShowFilePreview(false)
              setPreviewFile(null)
            }}
          />
        )}

        {showAIInsights && (
          <AIInsightsPanel
            grievance={grievance}
            onClose={() => setShowAIInsights(false)}
          />
        )}

        {showAssignModal && (
          <AdminAssignModal
            grievance={grievance}
            onClose={() => setShowAssignModal(false)}
            onSuccess={handleAssignSuccess}
          />
        )}

        {showReassignModal && (
          <AdminReassignModal
            grievance={grievance}
            onClose={() => setShowReassignModal(false)}
            onSuccess={handleReassignSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default GrievanceDetail