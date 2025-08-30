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
  LineChart as LineChartIcon,
  FileText,
  Building,
  Activity,
  Zap
} from "lucide-react"

// Import chart components
import BarChart from "../components/charts/BarChart"
import PieChart from "../components/charts/PieChart"
import LineChart from "../components/charts/LineChart"
import DonutChart from "../components/charts/DonutChart"
import MetricCard from "../components/charts/MetricCard"
import ProgressBar from "../components/charts/ProgressBar"

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

  const formatTrendDate = (dateObj) => {
    if (timeframe === "week") {
      return `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`
    }
    return `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}`
  }

  // Prepare chart data
  const statusChartData = analytics.dashboard?.statusStats?.map(stat => ({
    status: stat.status.replace('_', ' '),
    count: stat.count,
    percentage: stat.percentage || 0
  })) || []

  const categoryChartData = analytics.dashboard?.categoryStats?.map(stat => ({
    category: stat.category.replace('_', ' '),
    count: stat.count,
    percentage: stat.percentage || 0
  })) || []

  const priorityChartData = analytics.dashboard?.priorityStats?.map(stat => ({
    priority: stat.priority,
    count: stat.count,
    percentage: stat.percentage || 0
  })) || []

  const monthlyTrendData = analytics.dashboard?.monthlyTrend?.map(trend => ({
    month: trend.month,
    count: trend.count
  })) || []

  const trendsData = analytics.trends?.trends?.map(trend => ({
    date: formatTrendDate(trend._id),
    total: trend.total,
    pending: trend.pending,
    inProgress: trend.inProgress,
    resolved: trend.resolved
  })) || []

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
            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <MetricCard
              title="Total Grievances"
              value={analytics.dashboard.summary.total}
              icon={<FileText className="w-6 h-6" />}
              color="blue"
              subtitle="All time"
            />
            
            <MetricCard
              title="Resolution Rate"
              value={`${analytics.dashboard.summary.resolutionRate}%`}
              icon={<Target className="w-6 h-6" />}
              color="green"
              change={analytics.dashboard.summary.resolutionRate > 70 ? "+5.2" : "-2.1"}
              changeType={analytics.dashboard.summary.resolutionRate > 70 ? "positive" : "negative"}
            />
            
            <MetricCard
              title="Avg Resolution Time"
              value={`${analytics.dashboard.summary.avgResolutionTime}h`}
              icon={<Clock className="w-6 h-6" />}
              color="purple"
              subtitle="Hours to resolve"
            />

            {user.role === "admin" && analytics.dashboard.userStats && (
              <MetricCard
                title="Active Users"
                value={analytics.dashboard.userStats.total}
                icon={<Users className="w-6 h-6" />}
                color="yellow"
                subtitle={`${analytics.dashboard.userStats.citizens} citizens, ${analytics.dashboard.userStats.officers} officers`}
              />
            )}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution Donut Chart */}
          {statusChartData.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
              <DonutChart
                data={statusChartData}
                title="Status Distribution"
                labelKey="status"
                valueKey="count"
                colors={["#f59e0b", "#06b6d4", "#10b981", "#6b7280", "#ef4444"]}
                centerText={{
                  value: analytics.dashboard.summary.total,
                  label: "Total Cases"
                }}
              />
            </div>
          )}

          {/* Category Breakdown Pie Chart */}
          {categoryChartData.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
              <PieChart
                data={categoryChartData}
                title="Category Breakdown"
                labelKey="category"
                valueKey="count"
                colors={["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#84cc16"]}
              />
            </div>
          )}
        </div>

        {/* Priority Analysis and Department Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Analysis */}
          {priorityChartData.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
              <BarChart
                data={priorityChartData}
                title="Priority Distribution"
                xKey="priority"
                yKey="count"
                color="#f59e0b"
              />
            </div>
          )}

          {/* Department Performance (Admin only) */}
          {user.role === "admin" && analytics.dashboard?.departmentStats && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                Department Performance
              </h3>
              <div className="space-y-4">
                {analytics.dashboard.departmentStats.map((dept, index) => (
                  <div key={index}>
                    <ProgressBar
                      label={dept.department}
                      value={dept.count}
                      max={analytics.dashboard.summary.total}
                      color={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trends Analysis */}
        {monthlyTrendData.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Monthly Trends
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <LineChartIcon className="w-4 h-4" />
                Last 6 months
              </div>
            </div>
            
            <LineChart
              data={monthlyTrendData}
              xKey="month"
              yKey="count"
              color="#8b5cf6"
            />
          </div>
        )}

        {/* Detailed Trends Table */}
        {trendsData.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Detailed Trends Analysis
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <BarChart3 className="w-4 h-4" />
                {timeframe} view
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Period</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Pending</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">In Progress</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Resolved</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {trendsData.map((trend, index) => {
                    const resolutionRate = trend.total > 0 ? ((trend.resolved / trend.total) * 100).toFixed(1) : 0
                    
                    return (
                      <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-all">
                        <td className="py-3 px-4 text-white font-medium">{trend.date}</td>
                        <td className="py-3 px-4 text-white">{trend.total}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-yellow-400">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            {trend.pending}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-blue-400">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {trend.inProgress}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            {trend.resolved}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{resolutionRate}%</span>
                            <div className="w-16 bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${resolutionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Metrics (Officer/Admin only) */}
        {user.role !== "citizen" && analytics.performance && analytics.performance.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.performance.map((perf, index) => (
                <div key={index} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
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
                  
                  {/* Performance bar */}
                  <ProgressBar
                    value={perf.count}
                    max={Math.max(...analytics.performance.map(p => p.count))}
                    color="#8b5cf6"
                    height="h-2"
                    showPercentage={false}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Summary */}
        {analytics.dashboard && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Quick Statistics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {analytics.dashboard.summary.pending}
                </div>
                <div className="text-slate-400 text-sm">Pending Cases</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.pending}
                    max={analytics.dashboard.summary.total}
                    color="#f59e0b"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {analytics.dashboard.summary.inProgress}
                </div>
                <div className="text-slate-400 text-sm">In Progress</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.inProgress}
                    max={analytics.dashboard.summary.total}
                    color="#06b6d4"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {analytics.dashboard.summary.resolved}
                </div>
                <div className="text-slate-400 text-sm">Resolved</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.resolved}
                    max={analytics.dashboard.summary.total}
                    color="#10b981"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400 mb-2">
                  {analytics.dashboard.summary.closed}
                </div>
                <div className="text-slate-400 text-sm">Closed</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.closed}
                    max={analytics.dashboard.summary.total}
                    color="#6b7280"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics