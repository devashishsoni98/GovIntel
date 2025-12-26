"use client"

import { useState, useEffect } from "react"
import {
  X,
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  Clock,
} from "lucide-react"
import api from "../api"

const AIInsightsPanel = ({ grievance, onClose }) => {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reanalyzing, setReanalyzing] = useState(false)

  useEffect(() => {
    if (grievance) {
      loadInsights()
    }
  }, [grievance])

  const loadInsights = () => {
    try {
      setLoading(true)
      setError("")

      const analysisData = grievance.analysisData || {}
      const grievanceInsights = {
        sentiment: {
          value: analysisData.sentiment || "neutral",
          score: analysisData.sentimentScore || 0,
          confidence: analysisData.confidence || 0.5,
        },
        urgency: {
          score: analysisData.urgencyScore || 50,
          level: getUrgencyLevel(analysisData.urgencyScore || 50),
        },
        keywords: analysisData.keywords || [],
        suggestedDepartment:
          analysisData.suggestedDepartment || "municipal",
        classification: {
          category: grievance.category,
          confidence: analysisData.categoryConfidence || 0.8,
        },
        recommendations: generateRecommendations(
          grievance,
          analysisData
        ),
        riskFactors: identifyRiskFactors(grievance, analysisData),
      }

      setInsights(grievanceInsights)
    } catch (err) {
      console.error("Error loading insights:", err)
      setError("Failed to load AI insights")
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyLevel = (score) => {
    if (score >= 80) return "urgent"
    if (score >= 65) return "high"
    if (score >= 35) return "medium"
    return "low"
  }

  const generateRecommendations = (grievance, analysisData) => {
    const recommendations = []

    if (analysisData.urgencyScore >= 80) {
      recommendations.push({
        type: "urgent",
        title: "Immediate Action Required",
        description:
          "High urgency score indicates this case needs immediate attention",
        icon: <AlertTriangle className="w-4 h-4" />,
        color: "text-red-400",
      })
    }

    if (analysisData.sentiment === "negative") {
      recommendations.push({
        type: "sentiment",
        title: "Negative Sentiment Detected",
        description:
          "Citizen appears frustrated. Consider prioritizing communication",
        icon: <TrendingUp className="w-4 h-4" />,
        color: "text-orange-400",
      })
    }

    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(grievance.createdAt)) /
        (1000 * 60 * 60 * 24)
    )

    if (daysSinceCreation > 7 && grievance.status === "pending") {
      recommendations.push({
        type: "timeline",
        title: "Long Pending Duration",
        description: `Case has been pending for ${daysSinceCreation} days. Consider immediate assignment`,
        icon: <Clock className="w-4 h-4" />,
        color: "text-yellow-400",
      })
    }

    if (
      grievance.category === "healthcare" ||
      grievance.category === "police"
    ) {
      recommendations.push({
        type: "category",
        title: "Critical Service Category",
        description:
          "This category typically requires faster response times",
        icon: <Target className="w-4 h-4" />,
        color: "text-blue-400",
      })
    }

    return recommendations
  }

  const identifyRiskFactors = (grievance, analysisData) => {
    const risks = []

    if (
      analysisData.urgencyScore >= 70 &&
      analysisData.sentiment === "negative"
    ) {
      risks.push({
        level: "high",
        factor: "Escalation Risk",
        description:
          "High urgency combined with negative sentiment may lead to public escalation",
      })
    }

    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(grievance.createdAt)) /
        (1000 * 60 * 60 * 24)
    )

    if (daysSinceCreation > 14) {
      risks.push({
        level: "medium",
        factor: "Delayed Response",
        description:
          "Extended pending time may impact citizen satisfaction",
      })
    }

    if (
      grievance.updates &&
      grievance.updates.length > 5 &&
      grievance.status !== "resolved"
    ) {
      risks.push({
        level: "medium",
        factor: "Resolution Complexity",
        description:
          "Multiple updates suggest this case may require additional resources",
      })
    }

    return risks
  }

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true)
      setError("")

      const response = await api.post(
        `/grievances/${grievance._id}/analyze`
      )

      const data = response.data

      if (data.success) {
        console.log("Reanalysis successful:", data)
        loadInsights()
      } else {
        setError(data.message || "Failed to reanalyze grievance")
      }
    } catch (err) {
      console.error("Reanalysis error:", err)
      setError(
        err.response?.data?.message ||
          "Network error during reanalysis"
      )
    } finally {
      setReanalyzing(false)
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400 bg-green-400/10"
      case "negative":
        return "text-red-400 bg-red-400/10"
      default:
        return "text-yellow-400 bg-yellow-400/10"
    }
  }

  const getUrgencyColor = (level) => {
    switch (level) {
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

  const getRiskColor = (level) => {
    switch (level) {
      case "high":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "medium":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20"
      case "low":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Analysis Insights</h2>
              <p className="text-slate-400 text-sm">Advanced analytics for grievance: {grievance?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all hover:scale-110 disabled:opacity-50"
              title="Reanalyze with latest AI models"
            >
              <RefreshCw className={`w-5 h-5 ${reanalyzing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Analyzing grievance data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={loadInsights}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : insights ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sentiment Analysis */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-white font-medium">Sentiment</h3>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(insights.sentiment.value)}`}>
                    {insights.sentiment.value.charAt(0).toUpperCase() + insights.sentiment.value.slice(1)}
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    Confidence: {Math.round(insights.sentiment.confidence * 100)}%
                  </p>
                </div>

                {/* Urgency Score */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                    <h3 className="text-white font-medium">Urgency</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-white">{insights.urgency.score}</div>
                    <div className="text-slate-400 text-sm">/100</div>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-2 ${getUrgencyColor(insights.urgency.level)}`}>
                    {insights.urgency.level.toUpperCase()}
                  </div>
                </div>

                {/* Classification */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-white font-medium">Classification</h3>
                  </div>
                  <div className="text-white font-medium capitalize mb-1">
                    {insights.classification.category.replace('_', ' ')}
                  </div>
                  <p className="text-slate-400 text-xs">
                    Confidence: {Math.round(insights.classification.confidence * 100)}%
                  </p>
                </div>
              </div>

              {/* Keywords */}
              {insights.keywords && insights.keywords.length > 0 && (
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-400" />
                    Key Terms Identified
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${rec.color === 'text-red-400' ? 'bg-red-400/20' : rec.color === 'text-orange-400' ? 'bg-orange-400/20' : rec.color === 'text-yellow-400' ? 'bg-yellow-400/20' : 'bg-blue-400/20'}`}>
                          {rec.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${rec.color} mb-1`}>{rec.title}</h4>
                          <p className="text-slate-300 text-sm">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {insights.riskFactors && insights.riskFactors.length > 0 && (
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Risk Assessment
                  </h3>
                  <div className="space-y-3">
                    {insights.riskFactors.map((risk, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${getRiskColor(risk.level)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{risk.factor}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.level)}`}>
                            {risk.level.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Suggested Next Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grievance.status === 'pending' && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <h4 className="text-blue-300 font-medium mb-1">Immediate</h4>
                      <p className="text-slate-300 text-sm">Assign to appropriate officer and update status</p>
                    </div>
                  )}
                  
                  {grievance.status === 'assigned' && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <h4 className="text-yellow-300 font-medium mb-1">Next Step</h4>
                      <p className="text-slate-300 text-sm">Begin investigation and update to "In Progress"</p>
                    </div>
                  )}
                  
                  {insights.urgency.score >= 70 && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <h4 className="text-red-300 font-medium mb-1">Priority</h4>
                      <p className="text-slate-300 text-sm">High urgency - consider expedited handling</p>
                    </div>
                  )}
                  
                  {insights.sentiment.value === 'negative' && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <h4 className="text-orange-300 font-medium mb-1">Communication</h4>
                      <p className="text-slate-300 text-sm">Proactive communication recommended due to negative sentiment</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Metadata */}
              <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                  Analysis Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Suggested Dept.</p>
                    <p className="text-white font-medium capitalize">{insights.suggestedDepartment}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Analysis Date</p>
                    <p className="text-white font-medium">
                      {new Date(grievance.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Text Length</p>
                    <p className="text-white font-medium">
                      {(grievance.title + ' ' + grievance.description).length} chars
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Overall Confidence</p>
                    <p className="text-white font-medium">
                      {Math.round(insights.sentiment.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Analysis Data</h3>
              <p className="text-slate-400 mb-6">AI analysis data is not available for this grievance.</p>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-50"
              >
                {reanalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Run Analysis
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIInsightsPanel