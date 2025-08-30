import { useMemo } from "react"

const DonutChart = ({ data, title, labelKey, valueKey, colors = [], centerText = null }) => {
  const defaultColors = [
    "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", 
    "#ef4444", "#ec4899", "#6366f1", "#84cc16"
  ]

  const { chartData, total } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item[valueKey], 0)
    let currentAngle = 0

    const processedData = data.map((item, index) => {
      const percentage = (item[valueKey] / total) * 100
      const angle = (item[valueKey] / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      
      currentAngle += angle

      return {
        ...item,
        percentage: percentage.toFixed(1),
        startAngle,
        endAngle,
        color: colors[index] || defaultColors[index % defaultColors.length]
      }
    })

    return { chartData: processedData, total }
  }, [data, valueKey, colors])

  const createPath = (centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) => {
    const startOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle)
    const endOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle)
    const startInner = polarToCartesian(centerX, centerY, innerRadius, endAngle)
    const endInner = polarToCartesian(centerX, centerY, innerRadius, startAngle)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    return [
      "M", startOuter.x, startOuter.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      "L", endInner.x, endInner.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
      "Z"
    ].join(" ")
  }

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  const outerRadius = 80
  const innerRadius = 50
  const centerX = 100
  const centerY = 100

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-white font-medium mb-4">{title}</h3>
      )}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="flex-shrink-0 relative">
          <svg width="200" height="200" className="overflow-visible">
            {chartData.map((item, index) => (
              <path
                key={index}
                d={createPath(centerX, centerY, innerRadius, outerRadius, item.startAngle, item.endAngle)}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                opacity="0.9"
              />
            ))}
          </svg>
          
          {/* Center text */}
          {centerText && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{centerText.value}</div>
                <div className="text-sm text-slate-400">{centerText.label}</div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-slate-300 capitalize">
                  {typeof item[labelKey] === 'string' 
                    ? item[labelKey].replace('_', ' ')
                    : item[labelKey]
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{item[valueKey]}</span>
                <span className="text-slate-400 text-sm">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DonutChart