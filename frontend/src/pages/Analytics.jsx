"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { selectUser, USER_ROLES } from "../redux/slices/authSlice"
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PieChart,
  LineChart
} from "lucide-react"

const Analytics = () => {
  const user = useSelector(selectUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeframe, setTimeframe] = useState("month")
  const [analytics, setAnalytics] = useState({
    dashboard: null,
    trends: null,
    performance: null
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError("")

      const [dashboardRes, trendsRes, performanceRes] = await Promise.all([
        fetch("/api/analytics/dashboard", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch(`/api/analytics/trends?timeframe=${timeframe}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        user.role !== "citizen" ? fetch("/api/analytics/performance", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }) : Promise.resolve({ ok: false })
      ])

      const [dashboard, trends, performance] = await Promise.all([
        dashboardRes.ok ? dashboardRes.json() : null,
        trendsRes.ok ? trendsRes.json() : null,
        performanceRes.ok ? performanceRes.json() : null
      ])

      setAnalytics({
        dashboard: dashboard?.data,
        trends: trends?.data,
        performance: performance?.data
      })

    } catch (error) {
      console.error("Analytics fetch error:", error)
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (type) => {
    try {
      const response = await fetch(`/api/analytics/export?type=${type}&timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${type}-${timeframe}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-400 bg-yellow-400/10"
      case "in_progress": return "text-blue-400 bg-blue-400/10"
      case "resolved": return "text-green-400 bg-green-400/10"
      case "closed": return "text-gray-400 bg-gray-400/10"
      case "rejected": return "text-red-400 bg-red-400/10"
      default: return "text-gray-400 bg-gray-400/10"
    }
  }

  const formatTrendDate = (dateObj) => {
    if (timeframe === "week") {
      return `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`
    }
    return `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}`
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

  return (
    <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">Comprehensive insights and performance metrics</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 md:mt-0">
            {/* Timeframe Selector */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-slate-700/70 transition-all text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>

            {/* Export Button */}
            <button
              onClick={() => exportData('all')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all hover:scale-105 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all hover:scale-105 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-bounce-in">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        {analytics.dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Grievances</p>
                  <p className="text-2xl font-bold text-white">{analytics.dashboard.summary.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Resolution Rate</p>
                  <p className="text-2xl font-bold text-green-400">{analytics.dashboard.summary.resolutionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Resolution Time</p>
                  <p className="text-2xl font-bold text-purple-400">{analytics.dashboard.summary.avgResolutionTime}h</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            {user.role === "admin" && analytics.dashboard.userStats && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-orange-400">{analytics.dashboard.userStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Status Distribution */}
          {analytics.dashboard?.statusStats && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6">Status Distribution</h2>
              <div className="space-y-4">
                {analytics.dashboard.statusStats.map((stat) => (
                  <div key={stat.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stat.status)}`}>
                        {stat.status.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300">{stat.count} cases</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-400 text-sm w-10">{stat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {analytics.dashboard?.categoryStats && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h2 className="text-xl font-bold text-white mb-6">Category Breakdown</h2>
              <div className="space-y-4">
                {analytics.dashboard.categoryStats.map((stat) => (
                  <div key={stat.category} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize">{stat.category.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8">{stat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trends Chart */}
        {analytics.trends?.trends && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Trends Analysis</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <LineChart className="w-4 h-4" />
                {timeframe} view
              </div>
            </div>
            
            <div className="space-y-4">
              {analytics.trends.trends.map((trend, index) => (
                <div key={index} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">
                      {formatTrendDate(trend._id)}
                    </span>
                    <span className="text-white font-bold">{trend.total} total</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-slate-400">Pending: {trend.pending}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-slate-400">In Progress: {trend.inProgress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-slate-400">Resolved: {trend.resolved}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics (Officer/Admin only) */}
        {user.role !== "citizen" && analytics.performance && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-xl font-bold text-white mb-6">Performance Metrics</h2>
            <div className="space-y-4">
              {analytics.performance.map((perf, index) => (
                <div key={index} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {perf.officer?.[0]?.name || "Unassigned"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {perf._id.status}: {perf.count} cases
                      </p>
                    </div>
                    {perf.avgResolutionTime && (
                      <div className="text-right">
                        <p className="text-purple-400 font-medium">
                          {Math.round(perf.avgResolutionTime)}h
                        </p>
                        <p className="text-slate-400 text-sm">avg resolution</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics