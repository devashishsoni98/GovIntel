"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Building,
  PieChart,
  LineChart,
  Target,
  Activity,
  RefreshCw,
  ArrowLeft,
  Eye,
  Star
} from "lucide-react"
import { selectUser, USER_ROLES } from "../redux/slices/authSlice"

const Reports = () => {
  const { reportType } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reportData, setReportData] = useState(null)
  const [filters, setFilters] = useState({
    timeframe: "month",
    department: "",
    status: "",
    category: ""
  })

  const reportTypes = {
    system: {
      title: "System Reports",
      description: "Overall system performance and usage statistics",
      adminOnly: true
    },
    department: {
      title: "Department Reports", 
      description: "Department-specific performance metrics",
      adminOnly: false
    },
    monthly: {
      title: "Monthly Reports",
      description: "Monthly performance and resolution statistics", 
      adminOnly: false
    },
    performance: {
      title: "Performance Reports",
      description: "Officer and department performance analysis",
      adminOnly: false
    },
    custom: {
      title: "Custom Reports",
      description: "Create custom reports with specific parameters",
      adminOnly: true
    },
    export: {
      title: "Export Data",
      description: "Export system data in various formats",
      adminOnly: true
    }
  }

  useEffect(() => {
    if (reportType && reportTypes[reportType]) {
      // Check permissions
      if (reportTypes[reportType].adminOnly && user?.role !== USER_ROLES.ADMIN) {
        navigate("/unauthorized")
        return
      }
      fetchReportData()
    } else {
      setLoading(false)
    }
  }, [reportType, filters])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError("")

      const queryParams = new URLSearchParams({
        type: reportType,
        ...filters
      })

      const response = await fetch(`/api/reports/${reportType}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data.data)
      } else {
        // For now, generate mock data since backend endpoints don't exist
        setReportData(generateMockData(reportType))
      }
    } catch (error) {
      console.error("Fetch report error:", error)
      // Generate mock data as fallback
      setReportData(generateMockData(reportType))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (type) => {
    const baseStats = {
      totalGrievances: 1247,
      resolvedGrievances: 892,
      pendingGrievances: 234,
      inProgressGrievances: 121,
      resolutionRate: 71.5,
      avgResolutionTime: 48,
      departments: [
        { name: "Municipal", total: 456, resolved: 324, rate: 71 },
        { name: "Health", total: 234, resolved: 189, rate: 81 },
        { name: "Education", total: 189, resolved: 145, rate: 77 },
        { name: "Transport", total: 156, resolved: 98, rate: 63 },
        { name: "Police", total: 212, resolved: 136, rate: 64 }
      ],
      monthlyTrend: [
        { month: "Jan", total: 98, resolved: 67 },
        { month: "Feb", total: 112, resolved: 89 },
        { month: "Mar", total: 134, resolved: 98 },
        { month: "Apr", total: 156, resolved: 123 },
        { month: "May", total: 189, resolved: 145 },
        { month: "Jun", total: 167, resolved: 134 }
      ]
    }

    switch (type) {
      case "system":
        return {
          ...baseStats,
          systemHealth: {
            uptime: 99.8,
            responseTime: 245,
            errorRate: 0.2,
            activeUsers: 1456
          },
          topCategories: [
            { category: "Infrastructure", count: 345, percentage: 27.7 },
            { category: "Sanitation", count: 289, percentage: 23.2 },
            { category: "Water Supply", count: 234, percentage: 18.8 },
            { category: "Electricity", count: 189, percentage: 15.2 },
            { category: "Transportation", count: 190, percentage: 15.1 }
          ]
        }
      case "department":
        return {
          departmentName: user?.department || "Municipal",
          ...baseStats,
          officers: [
            { name: "John Smith", assigned: 45, resolved: 38, rate: 84.4 },
            { name: "Sarah Johnson", assigned: 52, resolved: 41, rate: 78.8 },
            { name: "Mike Wilson", assigned: 38, resolved: 29, rate: 76.3 },
            { name: "Emily Davis", assigned: 41, resolved: 30, rate: 73.2 }
          ]
        }
      case "monthly":
        return {
          currentMonth: "June 2024",
          ...baseStats,
          weeklyBreakdown: [
            { week: "Week 1", total: 42, resolved: 31 },
            { week: "Week 2", total: 38, resolved: 29 },
            { week: "Week 3", total: 45, resolved: 38 },
            { week: "Week 4", total: 42, resolved: 36 }
          ]
        }
      case "performance":
        return {
          ...baseStats,
          topPerformers: [
            { name: "Sarah Johnson", department: "Health", resolved: 89, rate: 94.7, avgTime: 24 },
            { name: "Mike Chen", department: "Municipal", resolved: 76, rate: 91.6, avgTime: 28 },
            { name: "Emily Rodriguez", department: "Education", resolved: 67, rate: 89.3, avgTime: 32 }
          ],
          departmentRankings: [
            { department: "Health", rate: 81, avgTime: 36 },
            { department: "Education", rate: 77, avgTime: 42 },
            { department: "Municipal", rate: 71, avgTime: 48 },
            { department: "Police", rate: 64, avgTime: 56 },
            { department: "Transport", rate: 63, avgTime: 58 }
          ]
        }
      default:
        return baseStats
    }
  }

  const exportReport = async (format) => {
    try {
      const response = await fetch(`/api/reports/${reportType}/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}-report.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  const ReportOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {Object.entries(reportTypes).map(([key, report]) => {
        if (report.adminOnly && user?.role !== USER_ROLES.ADMIN) return null
        
        return (
          <div
            key={key}
            onClick={() => navigate(`/reports/${key}`)}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {report.title}
                </h3>
                <p className="text-slate-400 text-sm">{report.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-sm font-medium">View Report</span>
              <Eye className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )
      })}
    </div>
  )

  const SystemReport = () => (
    <div className="space-y-8">
      {/* System Health */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{reportData.systemHealth.uptime}%</div>
            <div className="text-slate-400 text-sm">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{reportData.systemHealth.responseTime}ms</div>
            <div className="text-slate-400 text-sm">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{reportData.systemHealth.errorRate}%</div>
            <div className="text-slate-400 text-sm">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{reportData.systemHealth.activeUsers}</div>
            <div className="text-slate-400 text-sm">Active Users</div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Top Categories</h3>
        <div className="space-y-4">
          {reportData.topCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-300">{category.category}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-12 text-right">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const DepartmentReport = () => (
    <div className="space-y-8">
      {/* Department Overview */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          {reportData.departmentName} Department Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{reportData.totalGrievances}</div>
            <div className="text-slate-400 text-sm">Total Cases</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{reportData.resolvedGrievances}</div>
            <div className="text-slate-400 text-sm">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{reportData.pendingGrievances}</div>
            <div className="text-slate-400 text-sm">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{reportData.resolutionRate}%</div>
            <div className="text-slate-400 text-sm">Resolution Rate</div>
          </div>
        </div>
      </div>

      {/* Officer Performance */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Officer Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 pb-3">Officer</th>
                <th className="text-left text-slate-400 pb-3">Assigned</th>
                <th className="text-left text-slate-400 pb-3">Resolved</th>
                <th className="text-left text-slate-400 pb-3">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {reportData.officers.map((officer, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-3 text-white">{officer.name}</td>
                  <td className="py-3 text-slate-300">{officer.assigned}</td>
                  <td className="py-3 text-green-400">{officer.resolved}</td>
                  <td className="py-3">
                    <span className="text-purple-400 font-medium">{officer.rate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const MonthlyReport = () => (
    <div className="space-y-8">
      {/* Monthly Overview */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">{reportData.currentMonth} Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{reportData.totalGrievances}</div>
            <div className="text-slate-400 text-sm">Total This Month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{reportData.resolvedGrievances}</div>
            <div className="text-slate-400 text-sm">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{reportData.resolutionRate}%</div>
            <div className="text-slate-400 text-sm">Resolution Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">{reportData.avgResolutionTime}h</div>
            <div className="text-slate-400 text-sm">Avg Resolution Time</div>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Weekly Breakdown</h3>
        <div className="space-y-4">
          {reportData.weeklyBreakdown.map((week, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-300 w-20">{week.week}</span>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" 
                    style={{ width: `${(week.resolved / week.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-16 text-right">
                  {week.resolved}/{week.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const PerformanceReport = () => (
    <div className="space-y-8">
      {/* Top Performers */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Top Performers</h3>
        <div className="space-y-4">
          {reportData.topPerformers.map((performer, index) => (
            <div key={index} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{performer.name}</h4>
                    <p className="text-slate-400 text-sm">{performer.department} Department</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">{performer.rate}%</div>
                  <div className="text-slate-400 text-sm">Success Rate</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Resolved: </span>
                  <span className="text-white">{performer.resolved}</span>
                </div>
                <div>
                  <span className="text-slate-400">Avg Time: </span>
                  <span className="text-white">{performer.avgTime}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Rankings */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Department Rankings</h3>
        <div className="space-y-4">
          {reportData.departmentRankings.map((dept, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>
                <span className="text-slate-300">{dept.department}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-green-400 font-medium">{dept.rate}%</div>
                  <div className="text-slate-400 text-xs">Success Rate</div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-medium">{dept.avgTime}h</div>
                  <div className="text-slate-400 text-xs">Avg Time</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {reportType && (
              <button
                onClick={() => navigate("/reports")}
                className="p-2 bg-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {reportType ? reportTypes[reportType]?.title : "Reports"}
              </h1>
              <p className="text-slate-400">
                {reportType ? reportTypes[reportType]?.description : "Generate and view comprehensive reports"}
              </p>
            </div>
          </div>
          
          {reportType && reportData && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Filters */}
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>

              {/* Export Options */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportReport('pdf')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => exportReport('csv')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>

              <button
                onClick={fetchReportData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {!reportType ? (
          <ReportOverview />
        ) : reportData ? (
          <div>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Grievances</p>
                    <p className="text-2xl font-bold text-white">{reportData.totalGrievances}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Resolved</p>
                    <p className="text-2xl font-bold text-green-400">{reportData.resolvedGrievances}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Resolution Rate</p>
                    <p className="text-2xl font-bold text-purple-400">{reportData.resolutionRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Avg Resolution Time</p>
                    <p className="text-2xl font-bold text-orange-400">{reportData.avgResolutionTime}h</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Report-specific content */}
            {reportType === "system" && <SystemReport />}
            {reportType === "department" && <DepartmentReport />}
            {reportType === "monthly" && <MonthlyReport />}
            {reportType === "performance" && <PerformanceReport />}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Report Data</h3>
            <p className="text-slate-400">Unable to load report data at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports