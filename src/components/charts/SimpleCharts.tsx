import React from 'react'

export interface ChartDatum {
  label: string
  value: number
}

interface BarChartProps {
  data: ChartDatum[]
  height?: number
  barColor?: string
  formatValue?: (v: number) => string
}

/** Lightweight dependency-free SVG bar chart (responsive, no distortion). */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 160,
  barColor = '#0504AA',
  formatValue,
}) => {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 group min-w-0">
            <span className="text-[10px] font-semibold text-evermont-muted opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-200 group-hover:brightness-110"
              style={{
                height: `${Math.max((d.value / max) * (height - 24), 3)}px`,
                backgroundColor: barColor,
              }}
              title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-evermont-muted truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

interface LineChartProps {
  data: ChartDatum[]
  height?: number
  strokeColor?: string
  formatValue?: (v: number) => string
}

/** Lightweight dependency-free SVG area/line chart with gradient fill. */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 180,
  strokeColor = '#0504AA',
  formatValue,
}) => {
  const W = 100
  const H = 40
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = data.map((d, i) => ({
    x: data.length === 1 ? W / 2 : (i / (data.length - 1)) * W,
    y: H - ((d.value - min) / range) * (H - 6) - 3,
  }))
  const line = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  const area = `0,${H} ${line} ${W},${H}`
  const last = pts[pts.length - 1]

  return (
    <div>
      <div style={{ height }} className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label="Performance chart"
        >
          <defs>
            <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#lc-fill)" />
          <polyline
            points={line}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={last.x} cy={last.y} r="1.6" fill={strokeColor} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute top-0 right-0 text-xs font-bold text-evermont-blue">
          {formatValue ? formatValue(max) : max}
        </span>
      </div>
      <div className="flex justify-between mt-1">
        {data
          .filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2))
          .map((d, i) => (
            <span key={`${d.label}-${i}`} className="text-[10px] text-evermont-muted">
              {d.label}
            </span>
          ))}
      </div>
    </div>
  )
}
