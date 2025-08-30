const ProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  color = "#8b5cf6", 
  showPercentage = true,
  height = "h-3"
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className="text-slate-400 text-sm">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-700/50 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
      {!showPercentage && (
        <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar