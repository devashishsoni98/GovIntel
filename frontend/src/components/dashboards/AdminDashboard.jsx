"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import {
  Users,
  FileText,
  Building,
  Clock,
  CheckCircle,
  BarChart3,
  Calendar,
  Shield,
  Trash2,
  Eye,
  UserPlus,
  TrendingUp,
  Activity,
} from "lucide-react"
import { selectUser } from "../../redux/slices/authSlice"
import DeleteConfirmationModal from "../DeleteConfirmationModal"
import AdminAssignModal from "../AdminAssignModal"
import AdminReassignModal from "../AdminReassignModal"
import AnalyticsWidget from "../AnalyticsWidget"
import MetricCard from "../charts/MetricCard"
import api from "../../api"

const AdminDashboard = () => {
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
    totalUsers: 0,
    totalOfficers: 0,
    totalCitizens: 0,
  })

  const [departmentStats, setDepartmentStats] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedGrievances, setSelectedGrievances] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingGrievance, setDeletingGrievance] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningGrievance, setAssigningGrievance] = useState(null)

  const [showReassignModal, setShowReassignModal] = useState(false)
  const [reassigningGrievance, setReassigningGrievance] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      const analyticsResponse = await api.get("/analytics/dashboard")
      const analyticsData = analyticsResponse.data

      if (analyticsData.success && analyticsData.data) {
        setStats((prev) => ({
          ...prev,
          ...analyticsData.data.summary,
        }))

        setDepartmentStats(analyticsData.data.categoryStats || [])

        if (analyticsData.data.userStats) {
          setStats((prev) => ({
            ...prev,
            totalUsers: analyticsData.data.userStats.total || 0,
            totalOfficers: analyticsData.data.userStats.officers || 0,
            totalCitizens: analyticsData.data.userStats.citizens || 0,
          }))
        }
      }

      const grievancesResponse = await api.get(
        "/grievances?limit=5&sortBy=createdAt&sortOrder=desc"
      )

      const grievancesData = grievancesResponse.data

      if (grievancesData.success && grievancesData.data) {
        setRecentActivity(
          Array.isArray(grievancesData.data) ? grievancesData.data : []
        )
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGrievance = (grievanceId) => {
    setSelectedGrievances((prev) =>
      prev.includes(grievanceId)
        ? prev.filter((id) => id !== grievanceId)
        : [...prev, grievanceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedGrievances.length === recentActivity.length) {
      setSelectedGrievances([])
    } else {
      setSelectedGrievances(recentActivity.map((g) => g._id))
    }
  }

  const handleDeleteSingle = (grievance) => {
    setDeletingGrievance(grievance)
    setShowDeleteModal(true)
  }

  const handleDeleteBulk = () => {
    if (selectedGrievances.length > 0) {
      setDeletingGrievance(null)
      setShowDeleteModal(true)
    }
  }

  const handleAssignSingle = (grievance) => {
    setAssigningGrievance(grievance)
    setShowAssignModal(true)
  }

  const handleReassignSingle = (grievance) => {
    setReassigningGrievance(grievance)
    setShowReassignModal(true)
  }

  const handleAutoAssignSingle = async (grievance) => {
    try {
      setError("")
      await api.post(`/grievances/${grievance._id}/auto-assign`)
      fetchDashboardData()
    } catch (err) {
      console.error("Auto-assign error:", err)
      setError("Failed to auto-assign grievance")
    }
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)

      if (deletingGrievance) {
        await api.delete(`/admin/grievances/${deletingGrievance._id}`, {
          data: { reason: "Admin deletion from dashboard" },
        })

        setRecentActivity((prev) =>
          prev.filter((g) => g._id !== deletingGrievance._id)
        )
        setStats((prev) => ({ ...prev, total: prev.total - 1 }))
      } else {
        const response = await api.delete("/admin/grievances/bulk", {
          data: {
            grievanceIds: selectedGrievances,
            reason: "Bulk admin deletion from dashboard",
          },
        })

        setRecentActivity((prev) =>
          prev.filter((g) => !selectedGrievances.includes(g._id))
        )
        setSelectedGrievances([])
        setStats((prev) => ({
          ...prev,
          total: prev.total - (response.data.deletedCount || 0),
        }))
      }

      setShowDeleteModal(false)
      setDeletingGrievance(null)
    } catch (err) {
      console.error("Delete error:", err)
      setError("Failed to delete grievance(s)")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-18">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">System overview and management - Welcome, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Total Users</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">{stats.totalUsers || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Citizens</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">{stats.totalCitizens || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Officers</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">{stats.totalOfficers || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Total Grievances</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300">{stats.total || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Pending</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">{stats.pending || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Resolved</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">{stats.resolved || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Analytics Widget */}
          <div className="lg:col-span-3 mb-6">
            <AnalyticsWidget 
              title="System Analytics Overview"
              showCharts={true}
              compact={false}
              userRole="admin"
            />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Recent Activity
                </h2>
                <div className="flex items-center gap-3">
                  {selectedGrievances.length > 0 && (
                    <button
                      onClick={handleDeleteBulk}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all duration-300 text-sm hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete ({selectedGrievances.length})
                    </button>
                  )}
                  <Link to="/analytics" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-all duration-300 hover:scale-105">
                    View Analytics
                  </Link>
                </div>
              </div>

              {!recentActivity || recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select All Checkbox */}
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-700/50">
                    <input
                      type="checkbox"
                      checked={selectedGrievances.length === recentActivity.length && recentActivity.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-slate-400 text-sm">
                      Select All ({selectedGrievances.length}/{recentActivity.length})
                    </span>
                  </div>

                  {recentActivity.map((grievance) => (
                    <div key={grievance._id} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 hover:scale-[1.02] hover:-translate-y-1">
                      <div className="flex items-start gap-3">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedGrievances.includes(grievance._id)}
                          onChange={() => handleSelectGrievance(grievance._id)}
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-medium">{grievance.title}</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400">
                              {grievance.department}
                            </span>
                            {grievance.assignedOfficer && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                                Assigned to {grievance.assignedOfficer.name}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm mb-2">
                            Submitted by: {grievance.citizen?.name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(grievance.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {grievance.category.replace("_", " ")}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {!grievance.assignedOfficer && (
                            <>
                              <button
                                onClick={() => handleAutoAssignSingle(grievance)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all duration-300 text-sm hover:shadow-lg hover:shadow-green-500/25 hover:scale-105"
                              >
                                <UserPlus className="w-3 h-3" />
                                Auto Assign
                              </button>
                              <button
                                onClick={() => handleAssignSingle(grievance)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all duration-300 text-sm hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                              >
                                <UserPlus className="w-3 h-3" />
                                Assign
                              </button>
                            </>
                          )}
                          {grievance.assignedOfficer && (
                            <button
                              onClick={() => handleReassignSingle(grievance)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 hover:bg-orange-500/30 transition-all duration-300 text-sm hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105"
                            >
                              <UserPlus className="w-3 h-3" />
                              Reassign
                            </button>
                          )}
                          <Link
                            to={`/grievance/${grievance._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all duration-300 text-sm hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteSingle(grievance)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all duration-300 text-sm hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  to="/user-management"
                  className="block w-full bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-blue-300 hover:bg-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Manage Users</span>
                  </div>
                </Link>
                <Link
                  to="/analytics"
                  className="block w-full bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-purple-300 hover:bg-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm sm:text-base">View Analytics</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Department Distribution
              </h2>
              <div className="space-y-3">
                {!departmentStats || departmentStats.length === 0 ? (
                  <p className="text-slate-400 text-sm">No department data available</p>
                ) : (
                  departmentStats.map((category, index) => (
                    <div key={category.category || category._id || index} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm capitalize">
                        {(category.category || category._id || "Unknown").replace("_", " ")}
                      </span>
                      <span className="text-white font-medium">{category.count || 0}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                System Performance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  title="Efficiency Score"
                  value={`${Math.round((stats.resolved / (stats.total || 1)) * 100)}%`}
                  icon={<Activity className="w-5 h-5" />}
                  color="green"
                  subtitle="Based on resolution rate"
                />
                
                <MetricCard
                  title="Response Time"
                  value={`${stats.avgResolutionTime || 0}h`}
                  icon={<Clock className="w-5 h-5" />}
                  color="blue"
                  subtitle="Average resolution time"
                />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                System Health
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Average Resolution Time</span>
                  <span className="text-green-400 font-medium">
                    {stats.avgResolutionTime ? `${Math.round(stats.avgResolutionTime)}h` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Resolution Rate</span>
                  <span className="text-green-400 font-medium">
                    {stats.resolutionRate ? `${stats.resolutionRate}%` : "0%"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">System Status</span>
                  <span className="text-green-400 font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingGrievance(null)
          }}
          onConfirm={confirmDelete}
          title={deletingGrievance ? "Delete Grievance" : "Delete Multiple Grievances"}
          message={deletingGrievance 
            ? "This grievance will be permanently deleted from the system."
            : `${selectedGrievances.length} grievances will be permanently deleted.`
          }
          grievance={deletingGrievance}
          isBulk={!deletingGrievance}
          selectedCount={selectedGrievances.length}
          isLoading={isDeleting}
        />

        {/* Assignment Modal */}
        {showAssignModal && (
          <AdminAssignModal
            grievance={assigningGrievance}
            onClose={() => {
              setShowAssignModal(false)
              setAssigningGrievance(null)
            }}
            onSuccess={() => {
              setShowAssignModal(false)
              setAssigningGrievance(null)
              fetchDashboardData()
            }}
          />
        )}

        {/* Reassignment Modal */}
        {showReassignModal && (
          <AdminReassignModal
            grievance={reassigningGrievance}
            onClose={() => {
              setShowReassignModal(false)
              setReassigningGrievance(null)
            }}
            onSuccess={() => {
              setShowReassignModal(false)
              setReassigningGrievance(null)
              fetchDashboardData()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
