"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Users, FileText, Building, Clock, CheckCircle, BarChart3, Calendar, Shield, Trash2, Eye } from "lucide-react"
import { selectUser } from "../../redux/slices/authSlice"
import DeleteConfirmationModal from "../DeleteConfirmationModal"

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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch grievance analytics
      const analyticsResponse = await fetch("/api/analytics/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        console.log("Admin Analytics data:", analyticsData)

        if (analyticsData.success && analyticsData.data) {
          setStats((prev) => ({
            ...prev,
            ...analyticsData.data.summary,
          }))
          
          // Set department and category stats
          setDepartmentStats(analyticsData.data.categoryStats || [])
          
          // Set user stats if available
          if (analyticsData.data.userStats) {
            setStats((prev) => ({
              ...prev,
              totalUsers: analyticsData.data.userStats.total || 0,
              totalOfficers: analyticsData.data.userStats.officers || 0,
              totalCitizens: analyticsData.data.userStats.citizens || 0,
            }))
          }
        }
      } else {
        console.error("Analytics API error:", analyticsResponse.status)
      }

      // Fetch recent grievances for activity
      const grievancesResponse = await fetch("/api/grievances?limit=5&sortBy=createdAt&sortOrder=desc", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (grievancesResponse.ok) {
        const grievancesData = await grievancesResponse.json()
        console.log("Admin Grievances data:", grievancesData)

        if (grievancesData.success && grievancesData.data) {
          setRecentActivity(Array.isArray(grievancesData.data) ? grievancesData.data : [])
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

  const handleSelectGrievance = (grievanceId) => {
    setSelectedGrievances(prev => 
      prev.includes(grievanceId) 
        ? prev.filter(id => id !== grievanceId)
        : [...prev, grievanceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedGrievances.length === recentActivity.length) {
      setSelectedGrievances([])
    } else {
      setSelectedGrievances(recentActivity.map(g => g._id))
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

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      
      if (deletingGrievance) {
        // Single delete
        const response = await fetch(`/api/admin/grievances/${deletingGrievance._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            reason: "Admin deletion from dashboard"
          })
        })

        if (response.ok) {
          setRecentActivity(prev => prev.filter(g => g._id !== deletingGrievance._id))
          setStats(prev => ({ ...prev, total: prev.total - 1 }))
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to delete grievance")
        }
      } else {
        // Bulk delete
        console.log("Starting bulk delete for IDs:", selectedGrievances)
        
        const response = await fetch("/api/admin/grievances/bulk", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            grievanceIds: selectedGrievances,
            reason: "Bulk admin deletion from dashboard"
          })
        })

        console.log("Bulk delete response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Bulk delete response data:", data)
          
          setRecentActivity(prev => prev.filter(g => !selectedGrievances.includes(g._id)))
          setSelectedGrievances([])
          setStats(prev => ({ ...prev, total: prev.total - data.deletedCount }))
          
          // Show success message
          setError("")
        } else {
          const errorData = await response.json()
          console.error("Bulk delete error:", errorData)
          setError(errorData.message || "Failed to delete grievances")
        }
      }

      setShowDeleteModal(false)
      setDeletingGrievance(null)
    } catch (error) {
      console.error("Delete error:", error)
      setError("Network error during deletion")
    } finally {
      setIsDeleting(false)
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
              {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">System overview and management - Welcome, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Citizens</p>
                <p className="text-2xl font-bold text-green-400">{stats.totalCitizens || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Officers</p>
                <p className="text-2xl font-bold text-purple-400">{stats.totalOfficers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Grievances</p>
                <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-400" />
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
                <p className="text-slate-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats.resolved || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <div className="flex items-center gap-3">
                  {selectedGrievances.length > 0 && (
                    <button
                      onClick={handleDeleteBulk}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete ({selectedGrievances.length})
                    </button>
                  )}
                  <Link to="/analytics" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    View Analytics
                  </Link>
                </div>
              </div>

              {!recentActivity || recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
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
                    <div key={grievance._id} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
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
                          <Link
                            to={`/grievance/${grievance._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all text-sm"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteSingle(grievance)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all text-sm"
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
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/user-management"
                  className="block w-full bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-blue-300 hover:bg-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    Manage Users
                  </div>
                </Link>
                <Link
                  to="/analytics"
                  className="block w-full bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-purple-300 hover:bg-purple-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" />
                    View Analytics
                  </div>
                </Link>
                <Link
                  to="/reports"
                  className="block w-full bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-300 hover:bg-green-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    All Reports
                  </div>
                </Link>
                <Link
                  to="/reports/system"
                  className="block w-full bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-orange-300 hover:bg-orange-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    System Reports
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Department Distribution</h2>
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

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">System Health</h2>
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
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
      </div>
    </div>
  )
}

export default AdminDashboard
