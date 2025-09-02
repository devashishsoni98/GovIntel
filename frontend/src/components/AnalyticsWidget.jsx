import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, PieChart, Activity, RefreshCw } from "lucide-react"
import BarChart from "./charts/BarChart"
import DonutChart from "./charts/DonutChart"
import MetricCard from "./charts/MetricCard"

const AnalyticsWidget = ({ 
  title = "Analytics Overview", 
  showCharts = true, 
  compact = false,
  userRole = "citizen" 
}) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/analytics/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("AnalyticsWidget: Received data:", data)
        setAnalytics(data.data)
      } else {
        setError("Failed to load analytics")
      }
    } catch (error) {
      console.error("Analytics widget error:", error)
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const statusChartData = analytics.statusStats?.map(stat => ({
    status: stat.status.replace('_', ' '),
    count: stat.count
  })) || []

  const categoryChartData = analytics.categoryStats?.map(stat => ({
    category: stat.category.replace('_', ' '),
    count: stat.count
  })) || []

  // Check if we have meaningful data
  const hasStatusData = statusChartData.length > 0 && statusChartData.some(item => item.count > 0)
  const hasCategoryData = categoryChartData.length > 0 && categoryChartData.some(item => item.count > 0)
  const hasRecentActivity = analytics.recentGrievances && analytics.recentGrievances.length > 0

  console.log("AnalyticsWidget: Chart data check:", {
    statusChartData,
    categoryChartData,
    hasStatusData,
    hasCategoryData,
    hasRecentActivity,
    totalGrievances: analytics.summary?.total
  })

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" />
          {title}
        </h2>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4 mb-6`}>
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{analytics.summary.total}</div>
          <div className="text-slate-400 text-sm">Total Cases</div>
        </div>
        
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">{analytics.summary.resolutionRate}%</div>
          <div className="text-slate-400 text-sm">Resolution Rate</div>
        </div>
        
        {!compact && (
          <>
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{analytics.summary.pending}</div>
              <div className="text-slate-400 text-sm">Pending</div>
            </div>
            
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{analytics.summary.avgResolutionTime}h</div>
              <div className="text-slate-400 text-sm">Avg Resolution</div>
            </div>
          </>
        )}
      </div>

      {/* Charts */}
      {showCharts && (
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
          {/* Status Distribution */}
          {hasStatusData && (
            <div>
              <DonutChart
                data={statusChartData}
                title="Status Distribution"
                labelKey="status"
                valueKey="count"
                colors={["#f59e0b", "#06b6d4", "#10b981", "#6b7280", "#ef4444"]}
                centerText={{
                  value: analytics.summary.total,
                  label: "Total"
                }}
              />
            </div>
          )}

          {/* Category Breakdown */}
          {hasCategoryData && !compact && (
            <div>
              <BarChart
                data={categoryChartData.slice(0, 6)} // Show top 6 categories
                title="Top Categories"
                xKey="category"
                yKey="count"
                color="#8b5cf6"
              />
            </div>
          )}

          {/* Show message when no chart data */}
          {!hasStatusData && !hasCategoryData && (
            <div className={`${compact ? 'col-span-1' : 'lg:col-span-2'} text-center py-8 bg-slate-700/20 rounded-lg border border-slate-600/30`}>
              <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-2">No chart data available</p>
              <p className="text-slate-500 text-xs">
                {userRole === "officer" 
                  ? "Charts will appear when cases are assigned to you or your department"
                  : "Charts will appear when data is available"
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Summary */}
      {hasRecentActivity && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <h3 className="text-white font-medium mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {analytics.recentGrievances.slice(0, compact ? 3 : 5).map((grievance, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 truncate">{grievance.title}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  grievance.status === 'resolved' ? 'bg-green-400/10 text-green-400' :
                  grievance.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                  'bg-blue-400/10 text-blue-400'
                }`}>
                  {grievance.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show message when no data is available */}
      {!hasStatusData && !hasCategoryData && !hasRecentActivity && (
        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center bg-slate-700/20 rounded-lg p-6">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-2">No analytics data available</p>
          <p className="text-slate-500 text-xs">
            {userRole === "officer" 
              ? "Analytics will appear when cases are processed in your department"
              : userRole === "citizen"
              ? "Analytics will appear when you submit grievances"
              : "Analytics will appear when data is available"
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default AnalyticsWidget