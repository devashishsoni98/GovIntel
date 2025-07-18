"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  MessageSquare,
  Star,
  Edit,
  RefreshCw,
  UserCheck,
  Shield,
  Eye,
  Phone,
  Mail,
  Tag,
  Activity,
  Brain
} from "lucide-react"
import { selectUser, USER_ROLES } from "../redux/slices/authSlice"
import AdminReassignModal from "../components/AdminReassignModal"
import StatusUpdateModal from "../components/StatusUpdateModal"
import FeedbackModal from "../components/FeedbackModal"
import AIInsightsPanel from "../components/AIInsightsPanel"

const GrievanceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  
  const [grievance, setGrievance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  
  // Modal states
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(false)

  useEffect(() => {
    fetchGrievanceDetail()
  }, [id])

  const fetchGrievanceDetail = async () => {
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
        setGrievance(data.data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to fetch grievance details")
      }
    } catch (error) {
      console.error("Fetch grievance detail error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/grievances/${id}/auto-assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        await fetchGrievanceDetail()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to auto-assign grievance")
      }
    } catch (error) {
      console.error("Auto-assign error:", error)
      setError("Failed to auto-assign grievance")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReanalyze = async () => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/grievances/${id}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        await fetchGrievanceDetail()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to reanalyze grievance")
      }
    } catch (error) {
      console.error("Reanalyze error:", error)
      setError("Failed to reanalyze grievance")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
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

  const canUpdateStatus = () => {
    return user?.role === "officer" || user?.role === "admin"
  }

  const canReassign = () => {
    return user?.role === "admin"
  }

  const canProvideFeedback = () => {
    return user?.role === "citizen" && 
           grievance?.citizen?._id === user?.id && 
           grievance?.status === "resolved" && 
           !grievance?.feedback?.rating
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-700 rounded-xl"></div>
                <div className="h-48 bg-slate-700 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-slate-700 rounded-xl"></div>
                <div className="h-48 bg-slate-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !grievance) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Grievance</h2>
            <p className="text-red-400 mb-6">{error || "Grievance not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto pt-16">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4 sm:mb-6 animate-fade-in">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link 
            to={user?.role === "citizen" ? "/my-grievances" : "/assigned-cases"} 
            className="hover:text-white transition-colors"
          >
            {user?.role === "citizen" ? "My Grievances" : "Assigned Cases"}
          </Link>
          <span>/</span>
          <span className="text-white">Grievance Details</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 sm:mb-8 animate-slide-up">
          <div className="flex items-start gap-4 mb-4 md:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{grievance.title}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(grievance.status)}`}
                >
                  {getStatusIcon(grievance.status)}
                  {grievance.status.replace("_", " ")}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(grievance.priority)}`}
                >
                  {grievance.priority}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {grievance.grievanceId || `GRV-${grievance._id.slice(-8).toUpperCase()}`}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(grievance.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {grievance.category.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {canUpdateStatus() && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all hover:scale-105 text-sm"
              >
                <Edit className="w-4 h-4" />
                Update Status
              </button>
            )}

            {canReassign() && (
              <button
                onClick={() => setShowReassignModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all hover:scale-105 text-sm"
              >
                <UserCheck className="w-4 h-4" />
                Reassign
              </button>
            )}

            {canProvideFeedback() && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all hover:scale-105 text-sm"
              >
                <Star className="w-4 h-4" />
                Rate & Review
              </button>
            )}

            {(user?.role === "officer" || user?.role === "admin") && !grievance.assignedOfficer && (
              <button
                onClick={handleAutoAssign}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 hover:bg-orange-500/30 transition-all disabled:opacity-50 hover:scale-105 text-sm"
              >
                <UserCheck className="w-4 h-4" />
                Auto Assign
              </button>
            )}

            {(user?.role === "officer" || user?.role === "admin") && (
              <button
                onClick={() => setShowAIInsights(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105 text-sm"
              >
                <Brain className="w-4 h-4" />
                AI Insights
              </button>
            )}

            {(user?.role === "officer" || user?.role === "admin") && (
              <button
                onClick={handleReanalyze}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-50 hover:scale-105 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                Reanalyze
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Grievance Content */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{grievance.description}</p>
              
              {/* Location */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Location</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-300">{grievance.location.address}</p>
                    {grievance.location.landmark && (
                      <p className="text-slate-400 text-sm mt-1">Near: {grievance.location.landmark}</p>
                    )}
                    {grievance.location.coordinates && (
                      <p className="text-slate-500 text-xs mt-1">
                        Coordinates: {grievance.location.coordinates.latitude}, {grievance.location.coordinates.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {grievance.attachments && grievance.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3">Attachments</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {grievance.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300 hover:scale-105">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-300 text-sm font-medium truncate">{attachment.originalName}</p>
                          <p className="text-slate-500 text-xs">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <a
                          href={`/uploads/${attachment.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-white transition-all hover:scale-110"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis (Officer/Admin only) */}
            {(user?.role === "officer" || user?.role === "admin") && grievance.aiAnalysis && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <h2 className="text-xl font-bold text-white mb-4">AI Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Sentiment</label>
                      <p className={`text-sm font-medium ${
                        grievance.aiAnalysis.sentiment === 'positive' ? 'text-green-400' :
                        grievance.aiAnalysis.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {grievance.aiAnalysis.sentiment}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Urgency Score</label>
                      <p className="text-sm font-medium text-white">{grievance.aiAnalysis.urgencyScore}/100</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Suggested Department</label>
                      <p className="text-sm font-medium text-white capitalize">{grievance.aiAnalysis.suggestedDepartment}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Confidence</label>
                      <p className="text-sm font-medium text-white">{Math.round(grievance.aiAnalysis.confidence * 100)}%</p>
                    </div>
                  </div>
                </div>
                {grievance.aiAnalysis.keywords && grievance.aiAnalysis.keywords.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm text-slate-400">Keywords</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {grievance.aiAnalysis.keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-xl font-bold text-white mb-6">Timeline</h2>
              <div className="space-y-4">
                {/* Creation */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">Grievance Submitted</p>
                      <span className="text-xs text-slate-500">{formatDate(grievance.createdAt)}</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Submitted by {grievance.isAnonymous ? "Anonymous" : grievance.citizen?.name}
                    </p>
                  </div>
                </div>

                {/* Updates */}
                {grievance.updates && grievance.updates.map((update, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">Status Update</p>
                        <span className="text-xs text-slate-500">{formatDate(update.timestamp)}</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-1">{update.message}</p>
                      {update.updatedBy && (
                        <p className="text-slate-400 text-xs">
                          Updated by {update.updatedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Resolution */}
                {grievance.status === "resolved" && grievance.actualResolutionDate && (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">Grievance Resolved</p>
                        <span className="text-xs text-slate-500">{formatDate(grievance.actualResolutionDate)}</span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Resolution time: {grievance.resolutionTime}h
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback */}
            {grievance.feedback?.rating && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
                <h2 className="text-xl font-bold text-white mb-4">Citizen Feedback</h2>
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < grievance.feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                      }`}
                    />
                  ))}
                  <span className="text-white font-medium ml-2">{grievance.feedback.rating}/5</span>
                </div>
                {grievance.feedback.comment && (
                  <p className="text-slate-300">{grievance.feedback.comment}</p>
                )}
                <p className="text-slate-500 text-sm mt-2">
                  Submitted on {formatDate(grievance.feedback.submittedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Assignment Info */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-in-right">
              <h3 className="text-lg font-bold text-white mb-4">Assignment</h3>
              
              {grievance.assignedOfficer ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{grievance.assignedOfficer.name}</p>
                      <p className="text-slate-400 text-sm">Assigned Officer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{grievance.assignedOfficer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 capitalize">{grievance.assignedOfficer.department} Department</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No officer assigned</p>
                  {(user?.role === "officer" || user?.role === "admin") && (
                    <button
                      onClick={handleAutoAssign}
                      disabled={actionLoading}
                      className="mt-3 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all text-sm disabled:opacity-50 hover:scale-105"
                    >
                      Auto Assign
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Citizen Info (Officer/Admin only) */}
            {(user?.role === "officer" || user?.role === "admin") && !grievance.isAnonymous && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-in-right" style={{animationDelay: '0.1s'}}>
                <h3 className="text-lg font-bold text-white mb-4">Citizen Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{grievance.citizen?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{grievance.citizen?.email}</span>
                  </div>
                  {grievance.citizen?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{grievance.citizen.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department</span>
                  <span className="text-white capitalize">{grievance.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Priority</span>
                  <span className={`capitalize ${getPriorityColor(grievance.priority).split(' ')[0]}`}>
                    {grievance.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Days Open</span>
                  <span className="text-white">{grievance.daysSinceCreation || 0}</span>
                </div>
                {grievance.expectedResolutionDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Resolution</span>
                    <span className="text-white text-sm">
                      {new Date(grievance.expectedResolutionDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showReassignModal && (
          <AdminReassignModal
            grievance={grievance}
            onClose={() => setShowReassignModal(false)}
            onSuccess={() => {
              setShowReassignModal(false)
              fetchGrievanceDetail()
            }}
          />
        )}

        {showStatusModal && (
          <StatusUpdateModal
            grievance={grievance}
            onClose={() => setShowStatusModal(false)}
            onSuccess={() => {
              setShowStatusModal(false)
              fetchGrievanceDetail()
            }}
          />
        )}

        {showFeedbackModal && (
          <FeedbackModal
            grievance={grievance}
            onClose={() => setShowFeedbackModal(false)}
            onSuccess={() => {
              setShowFeedbackModal(false)
              fetchGrievanceDetail()
            }}
          />
        )}

        {showAIInsights && (
          <AIInsightsPanel
            grievance={grievance}
            onClose={() => setShowAIInsights(false)}
          />
        )}
      </div>
    </div>
  )
}

export default GrievanceDetail