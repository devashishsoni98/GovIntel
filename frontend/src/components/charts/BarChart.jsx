import { useMemo } from "react"

const BarChart = ({ data, title, xKey, yKey, color = "#8b5cf6" }) => {
  // Don't render if no data
  if (!data || data.length === 0 || !data.some(item => item[yKey] > 0)) {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-white font-medium mb-4">{title}</h3>
        )}
        <div className="text-center py-8 bg-slate-700/20 rounded-lg border border-slate-600/30">
          <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-slate-500 text-xl">📊</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">No data available</p>
          <p className="text-slate-500 text-xs">Chart will appear when data is processed</p>
        </div>
      </div>
    )
  }

  const maxValue = useMemo(() => {
    return Math.max(...data.map(item => item[yKey]))
  }, [data, yKey])

  const chartHeight = 200

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-white font-medium mb-4">{title}</h3>
      )}
      <div className="relative">
        <svg width="100%" height={chartHeight} className="overflow-visible">
          {data.map((item, index) => {
            const barHeight = (item[yKey] / maxValue) * (chartHeight - 40)
            const barWidth = (100 / data.length) - 2
            const x = (index * (100 / data.length)) + 1
            const y = chartHeight - barHeight - 20

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${barWidth}%`}
                  height={barHeight}
                  fill={color}
                  opacity="0.8"
                  className="hover:opacity-100 transition-all duration-300 cursor-pointer hover:brightness-110"
                  rx="4"
                />
                
                {/* Value label */}
                <text
                  x={`${x + barWidth/2}%`}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-slate-300 text-xs"
                >
                  {item[yKey]}
                </text>
                
                {/* X-axis label */}
                <text
                  x={`${x + barWidth/2}%`}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="fill-slate-400 text-xs"
                >
                  {typeof item[xKey] === 'string' && item[xKey].length > 8 
                    ? item[xKey].substring(0, 8) + '...'
                    : item[xKey]
                  }
                </text>
              </g>
            )
          })}
        </svg>
        
        {/* Chart Summary */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Total Items: {data.length}</span>
            <span className="text-slate-400">Max Value: {maxValue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarChart