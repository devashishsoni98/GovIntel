"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, MapPin, User, Building, BarChart3, Activity, UserPlus, XCircle, Target, Zap, Award, TrendingDown } from "lucide-react"
import { selectUser } from "../../redux/slices/authSlice"
import AnalyticsWidget from "../AnalyticsWidget"
import MetricCard from "../charts/MetricCard"
import ProgressBar from "../charts/ProgressBar"
import DonutChart from "../charts/DonutChart"
import BarChart from "../charts/BarChart"

const OfficerDashboard = () => {
  const user = useSelector(selectUser)
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
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
  const [officerPerformance, setOfficerPerformance] = useState(null)
  const [statusChartData, setStatusChartData] = useState([])
  const [categoryChartData, setCategoryChartData] = useState([])
  const [priorityChartData, setPriorityChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("OfficerDashboard: Fetching analytics for user:", user)

      // Fetch analytics
      const analyticsResponse = await fetch("/api/analytics/dashboard", {
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
              assigned: 0,
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
          const categoryStats = analyticsData.data.categoryStats || []
          console.log("Officer: Category stats received:", categoryStats)
          setDepartmentStats(categoryStats)

          // Set officer performance data
          if (analyticsData.data.officerPerformance) {
            setOfficerPerformance(analyticsData.data.officerPerformance)
          }

          // Prepare chart data
          const statusData = analyticsData.data.statusStats || []
          setStatusChartData(statusData.map(stat => ({
            status: stat.status.replace('_', ' '),
            count: stat.count
          })))

          setCategoryChartData(categoryStats.map(stat => ({
            category: stat.category.replace('_', ' '),
            count: stat.count
          })))

          const priorityData = analyticsData.data.priorityStats || []
          setPriorityChartData(priorityData.map(stat => ({
            priority: stat.priority,
            count: stat.count
          })))
        }
      } else {
        console.error("Analytics API error:", analyticsResponse.status)
        const errorData = await analyticsResponse.json()
        console.error("Analytics API error data:", errorData)
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
    <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-20">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Officer Dashboard
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Welcome, {user?.name} - Your Assigned Cases
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Total Cases</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">{stats.total || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-gray-500/10 animate-slide-up" style={{animationDelay: '0.05s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Assigned</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{stats.assigned || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10 animate-slide-up" style={{animationDelay: '0.1s'}}>
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

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">In Progress</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{stats.inProgress || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 animate-slide-up" style={{animationDelay: '0.3s'}}>
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

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-slate-500/10 animate-slide-up" style={{animationDelay: '0.35s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Closed</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-400 group-hover:text-slate-300 transition-colors duration-300">{stats.closed || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-slate-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Avg Resolution</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                  {stats.avgResolutionTime ? `${Math.round(stats.avgResolutionTime)}h` : "N/A"}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Officer Performance Analytics */}
          <div className="lg:col-span-3 mb-6 space-y-6">
            {/* Performance Overview Cards */}
            {officerPerformance && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  Your Performance Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Assigned"
                    value={officerPerformance.totalCases}
                    icon={<FileText className="w-5 h-5" />}
                    color="blue"
                    subtitle="Cases assigned to you"
                  />
                  
                  <MetricCard
                    title="Resolution Rate"
                    value={`${officerPerformance.resolutionRate}%`}
                    icon={<Target className="w-5 h-5" />}
                    color="green"
                    subtitle="Your success rate"
                    change={officerPerformance.resolutionRate > 70 ? "+5.2" : "-2.1"}
                    changeType={officerPerformance.resolutionRate > 70 ? "positive" : "negative"}
                  />
                  
                  <MetricCard
                    title="Avg Resolution"
                    value={`${officerPerformance.avgResolutionTime}h`}
                    icon={<Clock className="w-5 h-5" />}
                    color="purple"
                    subtitle="Your average time"
                  />
                  
                  <MetricCard
                    title="Efficiency Score"
                    value={`${officerPerformance.efficiency}%`}
                    icon={<Zap className="w-5 h-5" />}
                    color="yellow"
                    subtitle="Overall performance"
                  />
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Chart */}
              {statusChartData.length > 0 && statusChartData.some(item => item.count > 0) && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
                  <DonutChart
                    data={statusChartData}
                    title="Your Cases by Status"
                    labelKey="status"
                    valueKey="count"
                    colors={["#f59e0b", "#06b6d4", "#10b981", "#6b7280", "#ef4444"]}
                    centerText={{
                      value: stats.total,
                      label: "Total Cases"
                    }}
                  />
                </div>
              )}

              {/* Category Distribution Chart */}
              {categoryChartData.length > 0 && categoryChartData.some(item => item.count > 0) && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
                  <BarChart
                    data={categoryChartData}
                    title="Cases by Category"
                    xKey="category"
                    yKey="count"
                    color="#8b5cf6"
                  />
                </div>
              )}

              {/* Priority Analysis */}
              {priorityChartData.length > 0 && priorityChartData.some(item => item.count > 0) && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Priority Distribution
                  </h3>
                  <div className="space-y-4">
                    {priorityChartData.map((item, index) => {
                      const colors = {
                        urgent: "#ef4444",
                        high: "#f97316", 
                        medium: "#eab308",
                        low: "#22c55e"
                      }
                      return (
                        <div key={index}>
                          <ProgressBar
                            label={`${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority`}
                            value={item.count}
                            max={stats.total}
                            color={colors[item.priority] || "#6b7280"}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Show message when no chart data */}
              {(!statusChartData.length || !statusChartData.some(item => item.count > 0)) && 
               (!categoryChartData.length || !categoryChartData.some(item => item.count > 0)) && (
                <div className="lg:col-span-2 text-center py-8 bg-slate-700/20 rounded-lg border border-slate-600/30">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm mb-2">No analytics data available</p>
                  <p className="text-slate-500 text-xs">
                    Charts will appear when cases are assigned to you
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Cases */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Your Assigned Cases
                </h2>
                <Link to="/assigned-cases" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-all duration-300 hover:scale-105">
                  View All
                </Link>
              </div>

              {!assignedGrievances || assignedGrievances.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-400">No cases assigned to you yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedGrievances.slice(0, 5).map((grievance) => (
                    <div
                      key={grievance._id}
                      className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 hover:scale-[1.02] hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-medium">{grievance.title}</h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(grievance.status)}`}
                            >
                              {grievance.status.replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(grievance.priority)}`}
                            >
                              {grievance.priority}
                            </span>
                            {grievance.assignedOfficer && grievance.assignedOfficer._id === user?.id && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                                Your Case
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2 leading-relaxed">{grievance.description}</p>
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
                            {grievance.assignedOfficer && (
                              <div className="flex items-center gap-1">
                                <UserPlus className="w-3 h-3" />
                                {grievance.assignedOfficer.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/grievance/${grievance._id}`}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium ml-4 transition-all duration-300 hover:underline hover:scale-105"
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

          {/* Department Stats */}
          <div className="space-y-4 sm:space-y-6">
                  </div>
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-400">{stats.resolutionRate}%</div>
                    <div className="text-slate-400 text-xs">Your Success Rate</div>
                  </div>
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-400">{stats.inProgress || 0}</div>
                    <div className="text-slate-400 text-xs">In Progress</div>
                  </div>
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-yellow-400">{stats.resolved || 0}</div>
                    <div className="text-slate-400 text-xs">Resolved</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Your Cases by Category
              </h2>
              {!departmentStats || departmentStats.length === 0 || !departmentStats.some(cat => cat.count > 0) ? (
                <div className="text-center py-6">
                  <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No category data available yet</p>
                  <p className="text-slate-500 text-xs mt-1">Data will appear when cases are assigned to you</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {departmentStats.filter(cat => cat.count > 0).map((category, index) => (
                    <div key={category.category || index} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm capitalize">
                        {(category.category || category._id || "Unknown").replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{category.count || 0}</span>
                        <span className="text-slate-400 text-xs">({category.percentage || 0}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Performance Insights */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Your Performance
              </h2>
              {stats.total > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricCard
                    title="Total Assigned"
                    value={stats.total}
                    icon={<FileText className="w-5 h-5" />}
                    color="blue"
                    subtitle="Cases assigned to you"
                  />
                  
                  <MetricCard
                    title="In Progress"
                    value={stats.inProgress || 0}
                    icon={<UserPlus className="w-5 h-5" />}
                    color="purple"
                    subtitle="Currently working on"
                  />
                  
                  <MetricCard
                    title="Resolution Rate"
                    value={`${stats.resolutionRate || 0}%`}
                    icon={<CheckCircle className="w-5 h-5" />}
                    color="green"
                    subtitle="Your success rate"
                  />
                  
                  <MetricCard
                    title="Avg Resolution"
                    value={`${stats.avgResolutionTime || 0}h`}
                    icon={<Clock className="w-5 h-5" />}
                    color="yellow"
                    subtitle="Your average time"
                  />
                </div>
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Performance metrics will appear</p>
                  <p className="text-slate-500 text-xs mt-1">when cases are assigned to you</p>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  to="/assigned-cases"
                  className="block w-full bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-purple-300 hover:bg-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm sm:text-base">View Your Assigned Cases</span>
                  </div>
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