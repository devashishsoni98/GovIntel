"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, MapPin, User, Building } from "lucide-react"
import { selectUser } from "../../redux/slices/authSlice"

const OfficerDashboard = () => {
  const user = useSelector(selectUser)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    rejected: 0,
    resolutionRate: 0,
    avgResolutionTime: 0,
  })
  const [assignedGrievances, setAssignedGrievances] = useState([])
  const [departmentStats, setDepartmentStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch analytics
      const analyticsResponse = await fetch("/api/grievances/analytics/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        console.log("Officer Analytics data:", analyticsData)

        if (analyticsData.success && analyticsData.data) {
          // Set stats from summary
          setStats(
            analyticsData.data.summary || {
              total: 0,
              pending: 0,
              inProgress: 0,
              resolved: 0,
              closed: 0,
              rejected: 0,
              resolutionRate: 0,
              avgResolutionTime: 0,
            },
          )

          // Set department stats from categoryStats
          setDepartmentStats(analyticsData.data.categoryStats || [])
        }
      } else {
        console.error("Analytics API error:", analyticsResponse.status)
      }

      // Fetch assigned grievances
      const grievancesResponse = await fetch("/api/grievances?limit=10&sortBy=createdAt&sortOrder=desc", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (grievancesResponse.ok) {
        const grievancesData = await grievancesResponse.json()
        console.log("Officer Grievances data:", grievancesData)

        // Fix: Access grievancesData.data directly, not grievancesData.data.grievances
        if (grievancesData.success && grievancesData.data) {
          setAssignedGrievances(Array.isArray(grievancesData.data) ? grievancesData.data : [])
        }
      } else {
        console.error("Grievances API error:", grievancesResponse.status)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/10"
      case "in_progress":
        return "text-blue-400 bg-blue-400/10"
      case "resolved":
        return "text-green-400 bg-green-400/10"
      case "closed":
        return "text-gray-400 bg-gray-400/10"
      case "rejected":
        return "text-red-400 bg-red-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-400/10"
      case "high":
        return "text-orange-400 bg-orange-400/10"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10"
      case "low":
        return "text-green-400 bg-green-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchDashboardData} className="mt-2 text-red-300 hover:text-red-200 underline">
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Officer Dashboard</h1>
          <p className="text-slate-400">
            Welcome, {user?.name} - {user?.department} Department
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
                <AlertTriangle className="w-6 h-6 text-blue-400" />
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Cases */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Cases</h2>
                <Link to="/assigned-cases" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View All
                </Link>
              </div>

              {!assignedGrievances || assignedGrievances.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No cases assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedGrievances.slice(0, 5).map((grievance) => (
                    <div
                      key={grievance._id}
                      className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-medium">{grievance.title}</h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}
                            >
                              {grievance.status.replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(grievance.priority)}`}
                            >
                              {grievance.priority}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2">{grievance.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {grievance.citizen?.name || "Anonymous"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(grievance.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {grievance.category.replace("_", " ")}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/grievance/${grievance._id}`}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium ml-4"
                        >
                          Handle Case
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Department Stats */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Department Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{user?.department} Department</p>
                    <p className="text-slate-400 text-sm">Your assigned department</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Category Distribution</h2>
              <div className="space-y-3">
                {!departmentStats || departmentStats.length === 0 ? (
                  <p className="text-slate-400 text-sm">No category data available</p>
                ) : (
                  departmentStats.map((category, index) => (
                    <div key={category.category || index} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm capitalize">
                        {(category.category || category._id || "Unknown").replace("_", " ")}
                      </span>
                      <span className="text-white font-medium">{category.count || 0}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/assigned-cases"
                  className="block w-full bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-purple-300 hover:bg-purple-500/30 transition-all"
                >
                  View All Cases
                </Link>
                <Link
                  to="/reports/department"
                  className="block w-full bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-blue-300 hover:bg-blue-500/30 transition-all"
                >
                  Generate Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficerDashboard
