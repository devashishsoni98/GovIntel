"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Users, FileText, Building, Clock, CheckCircle, BarChart3, Calendar, Shield } from "lucide-react"
import { selectUser } from "../../redux/slices/authSlice"

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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch grievance analytics
      const analyticsResponse = await fetch("/api/grievances/analytics/dashboard", {
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
          // Fix: Use categoryStats instead of categoryDistribution
          setDepartmentStats(analyticsData.data.categoryStats || [])
        }
      } else {
        console.error("Analytics API error:", analyticsResponse.status)
      }

      // Fetch user stats (this endpoint might not exist, so we'll handle the error)
      try {
        const usersResponse = await fetch("/api/users/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          if (usersData.success && usersData.data) {
            setStats((prev) => ({
              ...prev,
              totalUsers: usersData.data.totalUsers || 0,
              totalOfficers: usersData.data.totalOfficers || 0,
              totalCitizens: usersData.data.totalCitizens || 0,
            }))
          }
        } else {
          console.log("User stats API not available, using default values")
          // Set some default values if the endpoint doesn't exist
          setStats((prev) => ({
            ...prev,
            totalUsers: 0,
            totalOfficers: 0,
            totalCitizens: 0,
          }))
        }
      } catch (userStatsError) {
        console.log("User stats endpoint not available:", userStatsError)
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

        // Fix: Access grievancesData.data directly
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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
                <Link to="/analytics" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View Analytics
                </Link>
              </div>

              {!recentActivity || recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((grievance) => (
                    <div key={grievance._id} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
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
                        <Link
                          to={`/grievance/${grievance._id}`}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium ml-4"
                        >
                          View Details
                        </Link>
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
                  to="/reports/system"
                  className="block w-full bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-300 hover:bg-green-500/30 transition-all"
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
      </div>
    </div>
  )
}

export default AdminDashboard
