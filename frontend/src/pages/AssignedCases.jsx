"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Eye, 
  Edit,
  User,
  Building,
  TrendingUp,
  FileText,
  Star,
  MessageSquare
} from 'lucide-react'
import { selectUser } from "../redux/slices/authSlice"

const AssignedCases = () => {
  const user = useSelector(selectUser)
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    search: "",
    dateRange: "all"
  })
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: 0
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" }
  ]

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ]

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "sanitation", label: "Sanitation" },
    { value: "water_supply", label: "Water Supply" },
    { value: "electricity", label: "Electricity" },
    { value: "transportation", label: "Transportation" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "police", label: "Police" },
    { value: "other", label: "Other" }
  ]

  useEffect(() => {
    fetchCases()
    fetchStats()
  }, [filters, pagination.current])

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError("")

      const queryParams = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const response = await fetch(`/api/grievances?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCases(data.data || [])
        setPagination(data.pagination || { current: 1, pages: 1, total: 0 })
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to fetch cases")
      }
    } catch (error) {
      console.error("Fetch cases error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setStats(data.data.summary || {})
        }
      }
    } catch (error) {
      console.error("Fetch stats error:", error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }))
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
        return <AlertCircle className="w-4 h-4" />
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
        return "text-red-400"
      case "high":
        return "text-orange-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysSince = (dateString) => {
    const days = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24))
    return days === 0 ? "Today" : `${days} day${days > 1 ? "s" : ""} ago`
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Assigned Cases</h1>
          <p className="text-slate-400">
            Manage and track your assigned grievances - {user?.department} Department
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Cases</p>
                <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{stats.inProgress || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats.resolved || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Resolution</p>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.avgResolutionTime ? `${Math.round(stats.avgResolutionTime)}h` : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          /* Empty State */
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">No Cases Found</h3>
            <p className="text-slate-400 mb-8">
              {Object.values(filters).some((f) => f)
                ? "No cases match your current filters. Try adjusting your search criteria."
                : "You don't have any assigned cases yet."}
            </p>
            {Object.values(filters).some((f) => f) && (
              <button
                onClick={() => setFilters({ status: "", priority: "", category: "", search: "", dateRange: "all" })}
                className="px-6 py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Cases List */
          <div className="space-y-6">
            {cases.map((grievance) => (
              <div
                key={grievance._id}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-white">{grievance.title}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(grievance.status)}`}
                      >
                        {getStatusIcon(grievance.status)}
                        {grievance.status.replace("_", " ")}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(grievance.priority)}`}>
                        {grievance.priority} priority
                      </span>
                      {grievance.grievanceId && (
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                          ID: {grievance.grievanceId}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 mb-4 line-clamp-2">{grievance.description}</p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{grievance.citizen?.name || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted {formatDate(grievance.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{getDaysSince(grievance.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="capitalize">{grievance.category.replace("_", " ")}</span>
                      </div>
                    </div>

                    {/* Updates Count */}
                    {grievance.updates && grievance.updates.length > 0 && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 text-sm text-blue-400">
                          <MessageSquare className="w-4 h-4" />
                          {grievance.updates.length} update{grievance.updates.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* Feedback */}
                    {grievance.status === "resolved" && grievance.feedback?.rating && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-slate-400">Citizen rating:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < grievance.feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                    <Link
                      to={`/grievance/${grievance._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all text-center justify-center"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>

                    {grievance.status !== "resolved" && grievance.status !== "closed" && (
                      <Link
                        to={`/grievance/${grievance._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all text-center justify-center"
                      >
                        <Edit className="w-4 h-4" />
                        Update Status
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress Bar for In Progress Items */}
                {grievance.status === "in_progress" && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>In Progress</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm">
                  Showing {(pagination.current - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} cases
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.current - 1 && page <= pagination.current + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-all ${
                            page === pagination.current
                              ? "bg-purple-500 text-white"
                              : "border border-slate-600 text-slate-300 hover:bg-slate-700/50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === pagination.current - 2 || page === pagination.current + 2) {
                      return (
                        <span key={page} className="text-slate-500">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="px-3 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignedCases