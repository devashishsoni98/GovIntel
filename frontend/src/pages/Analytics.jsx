"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { selectUser } from "../redux/slices/authSlice"
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Download,
  RefreshCw,
  LineChartIcon,
  FileText,
  Building,
  Activity,
} from "lucide-react"

import api from "../api"

// Charts
import BarChart from "../components/charts/BarChart"
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
    performance: null,
  })

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError("")

      const requests = [
        api.get("/api/analytics/dashboard"),
        api.get(`/api/analytics/trends?timeframe=${timeframe}`),
      ]

      if (user.role !== "citizen") {
        requests.push(api.get("/api/analytics/performance"))
      }

      const responses = await Promise.allSettled(requests)

      const dashboard =
        responses[0].status === "fulfilled"
          ? responses[0].value.data
          : null

      const trends =
        responses[1].status === "fulfilled"
          ? responses[1].value.data
          : null

      const performance =
        responses[2] && responses[2].status === "fulfilled"
          ? responses[2].value.data
          : null

      setAnalytics({
        dashboard: dashboard?.data || null,
        trends: trends?.data || null,
        performance: performance?.data || null,
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
      const response = await api.get(
        `/api/analytics/export?type=${type}&timeframe=${timeframe}`,
        { responseType: "blob" }
      )

      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${type}-${timeframe}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  const formatTrendDate = (dateObj) => {
    if (!dateObj) return "Unknown"
    if (timeframe === "week") {
      return `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}-${String(
        dateObj.day
      ).padStart(2, "0")}`
    }
    return `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}`
  }

  const statusChartData =
    analytics.dashboard?.statusStats?.filter(Boolean).map((stat) => ({
      status: String(stat?.status ?? "unknown").replaceAll("_", " "),
      count: Number(stat?.count ?? 0),
      percentage: Number(stat?.percentage ?? 0),
    })) || []

  const categoryChartData =
    analytics.dashboard?.categoryStats?.filter(Boolean).map((stat) => ({
      category: String(stat?.category ?? "unknown").replaceAll("_", " "),
      count: Number(stat?.count ?? 0),
      percentage: Number(stat?.percentage ?? 0),
    })) || []

  const priorityChartData =
    analytics.dashboard?.priorityStats?.filter(Boolean).map((stat) => ({
      priority: String(stat?.priority ?? "unknown"),
      count: Number(stat?.count ?? 0),
      percentage: Number(stat?.percentage ?? 0),
    })) || []

  const monthlyTrendData =
    analytics.dashboard?.monthlyTrend?.filter(Boolean).map((trend) => ({
      month: String(trend?.month ?? ""),
      count: Number(trend?.count ?? 0),
    })) || []

  const trendsData =
    analytics.trends?.trends?.filter(Boolean).map((trend) => ({
      date: formatTrendDate(trend?._id),
      total: Number(trend?.total ?? 0),
      pending: Number(trend?.pending ?? 0),
      inProgress: Number(trend?.inProgress ?? 0),
      resolved: Number(trend?.resolved ?? 0),
    })) || []

  const monthMatchesAug2025 = (label) => {
    const s = String(label ?? "").toLowerCase()
    return (
      s.includes("2025") &&
      (s.includes("aug") || s.includes("-08") || s.includes("/08") || s.includes(" 08"))
    )
  }

  let filteredMonthlyTrendData = (monthlyTrendData || []).filter((d) =>
    monthMatchesAug2025(d?.month)
  )

  if (!filteredMonthlyTrendData.length) {
    const augTrends = (trendsData || []).filter((t) => {
      const s = String(t?.date ?? "").toLowerCase()
      return s.includes("2025") && (s.includes("aug") || s.startsWith("2025-08"))
    })
    const totalCount = augTrends.reduce((sum, t) => sum + (t?.total ?? 0), 0)
    if (totalCount > 0) {
      filteredMonthlyTrendData = [{ month: "2025-08", count: totalCount }]
    }
  }

  const hasStatusData = statusChartData.some((i) => i.count > 0)
  const hasCategoryData = categoryChartData.some((i) => i.count > 0)
  const hasPriorityData = priorityChartData.some((i) => i.count > 0)
  const hasMonthlyData = filteredMonthlyTrendData.some((i) => i.count > 0)
  const hasTrendsData = trendsData.some((i) => i.total > 0)
  const hasDepartmentData =
    analytics.dashboard?.departmentStats?.some((d) => (d?.count ?? 0) > 0)

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
            <p className="text-slate-400 text-sm">
              Overview of grievance analytics across status, categories, priority and trends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 md:mt-0">
            {/* Timeframe Filter */}
            
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
        {analytics.dashboard && analytics.dashboard.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <MetricCard
              title="Total Grievances"
              value={analytics.dashboard.summary.total || 0}
              icon={<FileText className="w-6 h-6" />}
              color="blue"
              subtitle="All time"
            />

            <MetricCard
              title="Resolution Rate"
              value={`${analytics.dashboard.summary.resolutionRate || 0}%`}
              icon={<Target className="w-6 h-6" />}
              color="green"
              change={(analytics.dashboard.summary.resolutionRate || 0) > 70 ? "+5.2" : "-2.1"}
              changeType={(analytics.dashboard.summary.resolutionRate || 0) > 70 ? "positive" : "negative"}
            />

            <MetricCard
              title="Avg Resolution Time"
              value={`${Math.round(analytics.dashboard.summary.avgResolutionTime || 0)}h`}
              icon={<Clock className="w-6 h-6" />}
              color="purple"
              subtitle="Hours to resolve"
            />

            {user.role === "admin" && analytics.dashboard.userStats && (
              <MetricCard
                title="Active Users"
                value={analytics.dashboard.userStats.total || 0}
                icon={<Users className="w-6 h-6" />}
                color="yellow"
                subtitle={`${analytics.dashboard.userStats.citizens || 0} citizens, ${
                  analytics.dashboard.userStats.officers || 0
                } officers`}
              />
            )}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution Donut Chart */}
          {hasStatusData && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
              <DonutChart
                data={statusChartData}
                title="Status Distribution"
                labelKey="status"
                valueKey="count"
                colors={["#f59e0b", "#06b6d4", "#10b981", "#6b7280", "#ef4444"]}
                centerText={{
                  value: analytics.dashboard.summary.total || 0,
                  label: "Total Cases",
                }}
              />
            </div>
          )}

          {/* Category Distribution */}
          {hasCategoryData && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
              <DonutChart
                data={categoryChartData}
                title="Category Distribution"
                labelKey="category"
                valueKey="count"
                colors={["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]}
              />
            </div>
          )}

          {/* Show message when no chart data is available */}
          {!hasStatusData && !hasCategoryData && (
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 text-center animate-fade-in">
              <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Chart Data Available</h3>
              <p className="text-slate-400">Charts will appear here once grievances are submitted and processed.</p>
            </div>
          )}
        </div>

        {/* Priority Analysis and Department Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Analysis */}
          {hasPriorityData && (
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
          {user.role === "admin" && hasDepartmentData && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                Department Performance
              </h3>
              <div className="space-y-4">
                {analytics.dashboard.departmentStats.map((dept, index) => (
                  <div key={index}>
                    <ProgressBar
                      label={dept?.department || dept?._id || "Unknown"}
                      value={Number(dept?.count ?? 0)}
                      max={Number(analytics.dashboard.summary.total || 1)}
                      color={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show placeholder when no priority or department data */}
          {!hasPriorityData && !hasDepartmentData && (
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 text-center animate-fade-in">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Additional Analytics Coming Soon</h3>
              <p className="text-slate-400">
                Priority and department analytics will appear as more data becomes available.
              </p>
            </div>
          )}
        </div>

       

        {/* Detailed Trends Table */}
        {hasTrendsData && (
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

        {/* Quick Stats Summary */}
        {analytics.dashboard && analytics.dashboard.summary && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Quick Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {analytics.dashboard.summary.pending || 0}
                </div>
                <div className="text-slate-400 text-sm">Pending Cases</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.pending || 0}
                    max={analytics.dashboard.summary.total || 1}
                    color="#f59e0b"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {analytics.dashboard.summary.inProgress || 0}
                </div>
                <div className="text-slate-400 text-sm">In Progress</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.inProgress || 0}
                    max={analytics.dashboard.summary.total || 1}
                    color="#06b6d4"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {analytics.dashboard.summary.resolved || 0}
                </div>
                <div className="text-slate-400 text-sm">Resolved</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.resolved || 0}
                    max={analytics.dashboard.summary.total || 1}
                    color="#10b981"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400 mb-2">{analytics.dashboard.summary.closed || 0}</div>
                <div className="text-slate-400 text-sm">Closed</div>
                <div className="mt-2">
                  <ProgressBar
                    value={analytics.dashboard.summary.closed || 0}
                    max={analytics.dashboard.summary.total || 1}
                    color="#6b7280"
                    height="h-1"
                    showPercentage={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!analytics.dashboard && !loading && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 text-center animate-fade-in">
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Analytics Data Available</h3>
            <p className="text-slate-400 mb-6">
              Analytics will be available once grievances are submitted and processed in the system.
            </p>
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
