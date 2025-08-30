import { useMemo } from "react"

const LineChart = ({ data, title, xKey, yKey, color = "#8b5cf6", showGrid = true }) => {
  const { maxValue, minValue, points } = useMemo(() => {
    const values = data.map(item => item[yKey])
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    const chartWidth = 100
    const chartHeight = 160
    const padding = 20

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * (chartWidth - padding * 2) + padding
      const y = chartHeight - padding - ((item[yKey] - min) / (max - min)) * (chartHeight - padding * 2)
      return { x, y, value: item[yKey], label: item[xKey] }
    })

    return { maxValue: max, minValue: min, points }
  }, [data, xKey, yKey])

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-white font-medium mb-4">{title}</h3>
      )}
      <div className="relative">
        <svg width="100%" height="200" viewBox="0 0 100 180" className="overflow-visible">
          {/* Grid lines */}
          {showGrid && (
            <g className="opacity-20">
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="20"
                  y1={20 + (y * 1.4)}
                  x2="80"
                  y2={20 + (y * 1.4)}
                  stroke="#64748b"
                  strokeWidth="0.5"
                />
              ))}
            </g>
          )}

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Area under curve */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`}
            fill={color}
            opacity="0.1"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={color}
                className="hover:r-4 transition-all cursor-pointer"
              />
              
              {/* Hover tooltip area */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="hover:fill-white hover:fill-opacity-10"
              >
                <title>{`${point.label}: ${point.value}`}</title>
              </circle>
            </g>
          ))}

          {/* Y-axis labels */}
          <text x="15" y="25" className="fill-slate-400 text-xs" textAnchor="end">{maxValue}</text>
          <text x="15" y="95" className="fill-slate-400 text-xs" textAnchor="end">{Math.round((maxValue + minValue) / 2)}</text>
          <text x="15" y="165" className="fill-slate-400 text-xs" textAnchor="end">{minValue}</text>
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-4">
          {data.map((item, index) => (
            <span key={index} className="text-slate-400 text-xs">
              {typeof item[xKey] === 'string' && item[xKey].length > 6 
                ? item[xKey].substring(0, 6) + '...'
                : item[xKey]
              }
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LineChart