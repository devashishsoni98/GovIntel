import { useState, useEffect } from "react"
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  Lightbulb,
  Target,
  Activity,
  Zap,
  RefreshCw,
  Eye,
  X
} from "lucide-react"

const AIInsightsPanel = ({ grievance, onClose }) => {
  const [insights, setInsights] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("recommendations")

  useEffect(() => {
    if (grievance) {
      fetchAIInsights()
    }
  }, [grievance])

  const fetchAIInsights = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch AI recommendations
      const recommendationsResponse = await fetch("/api/ai/smart-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ grievanceId: grievance._id }),
      })

      if (recommendationsResponse.ok) {
        const recommendationsData = await recommendationsResponse.json()
        setRecommendations(recommendationsData.data.recommendations)
      }

      // Fetch resolution time prediction
      const predictionResponse = await fetch("/api/ai/predict-resolution-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ grievanceId: grievance._id }),
      })

      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json()
        setPrediction(predictionData.data.prediction)
      }

    } catch (error) {
      console.error("AI insights error:", error)
      setError("Failed to load AI insights")
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "text-red-400 bg-red-400/10 border-red-400/20"
      case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/20"
      case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "low": return "text-green-400 bg-green-400/10 border-green-400/20"
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-400"
    if (confidence >= 0.6) return "text-yellow-400"
    return "text-orange-400"
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
            <p className="text-white">AI is analyzing the grievance...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Insights & Recommendations</h2>
              <p className="text-slate-400 text-sm">Powered by advanced machine learning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "recommendations"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Smart Recommendations
          </button>
          <button
            onClick={() => setActiveTab("prediction")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "prediction"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Time Prediction
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "analysis"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            AI Analysis
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchAIInsights}
                className="mt-2 text-red-300 hover:text-red-200 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && recommendations && (
            <div className="space-y-6">
              {/* Priority Recommendation */}
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Recommended Priority</h3>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(recommendations.priority)}`}>
                  {recommendations.priority.toUpperCase()}
                </span>
              </div>

              {/* Suggested Actions */}
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Suggested Actions</h3>
                </div>
                <div className="space-y-2">
                  {recommendations.suggestedActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <span className="text-slate-300 text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Cases */}
              {recommendations.similarCases.length > 0 && (
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Similar Resolved Cases</h3>
                  </div>
                  <div className="space-y-2">
                    {recommendations.similarCases.map((similarCase, index) => (
                      <div key={index} className="bg-slate-600/30 rounded p-3">
                        <p className="text-slate-300 text-sm font-medium">{similarCase.title}</p>
                        <p className="text-slate-400 text-xs">Resolved in {similarCase.resolutionTime}h</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {recommendations.riskFactors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="text-red-400 font-semibold">Risk Factors</h3>
                  </div>
                  <div className="space-y-2">
                    {recommendations.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <span className="text-red-300 text-sm">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Factors */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="text-green-400 font-semibold">Success Factors</h3>
                </div>
                <div className="space-y-2">
                  {recommendations.successFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <span className="text-green-300 text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Prediction Tab */}
          {activeTab === "prediction" && prediction && (
            <div className="space-y-6">
              {/* Time Prediction */}
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <h3 className="text-white font-semibold text-lg">Estimated Resolution Time</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-blue-400">{prediction.estimatedHours}h</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Confidence:</span>
                    <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Prediction Factors */}
              {prediction.factors.length > 0 && (
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Prediction Factors</h3>
                  </div>
                  <div className="space-y-2">
                    {prediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5" />
                        <span className="text-slate-300 text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prediction Recommendations */}
              {prediction.recommendations.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <h3 className="text-blue-400 font-semibold">Time-Based Recommendations</h3>
                  </div>
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
                        <span className="text-blue-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === "analysis" && grievance.aiAnalysis && (
            <div className="space-y-6">
              {/* Sentiment Analysis */}
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold">Sentiment Analysis</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Detected Sentiment:</span>
                    <p className={`font-medium ${
                      grievance.aiAnalysis.sentiment === 'positive' ? 'text-green-400' :
                      grievance.aiAnalysis.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {grievance.aiAnalysis.sentiment.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Urgency Score:</span>
                    <p className="font-medium text-white">{grievance.aiAnalysis.urgencyScore}/100</p>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              {grievance.aiAnalysis.keywords && grievance.aiAnalysis.keywords.length > 0 && (
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Extracted Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {grievance.aiAnalysis.keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Department Suggestion */}
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-orange-400" />
                  <h3 className="text-white font-semibold">AI Department Suggestion</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Suggested Department:</span>
                    <p className="font-medium text-orange-400 capitalize">
                      {grievance.aiAnalysis.suggestedDepartment}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Confidence Level:</span>
                    <p className="font-medium text-white">
                      {Math.round(grievance.aiAnalysis.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 sticky bottom-0 bg-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Brain className="w-4 h-4" />
            <span>Powered by GovIntel AI Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAIInsights}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Analysis
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsightsPanel