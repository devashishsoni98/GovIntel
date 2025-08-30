const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  color = "blue",
  subtitle = null,
  trend = null
}) => {
  const getColorClasses = (colorName) => {
    const colors = {
      blue: "from-blue-500 to-cyan-500 text-blue-400 bg-blue-500/10",
      purple: "from-purple-500 to-pink-500 text-purple-400 bg-purple-500/10",
      green: "from-green-500 to-emerald-500 text-green-400 bg-green-500/10",
      yellow: "from-yellow-500 to-orange-500 text-yellow-400 bg-yellow-500/10",
      red: "from-red-500 to-pink-500 text-red-400 bg-red-500/10",
      gray: "from-gray-500 to-slate-500 text-gray-400 bg-gray-500/10"
    }
    return colors[colorName] || colors.blue
  }

  const getChangeColor = (type) => {
    switch (type) {
      case "positive": return "text-green-400"
      case "negative": return "text-red-400"
      default: return "text-slate-400"
    }
  }

  const colorClasses = getColorClasses(color)

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
            {value}
          </p>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${getChangeColor(changeType)}`}>
                {changeType === "positive" && "+"}
                {change}
                {typeof change === "number" && "%"}
              </span>
              <span className="text-slate-500 text-xs">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} ${colorClasses.split(' ')[2]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Trend</span>
            <span className={getChangeColor(trend.type)}>
              {trend.direction} {trend.value}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MetricCard