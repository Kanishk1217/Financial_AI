import { motion } from 'motion/react'

/**
 * Minimal animated sparkline used inside stat cards.
 * Draws a smooth path with a soft gradient fill and animates the line in.
 */
export function Sparkline({
  data,
  width = 120,
  height = 40,
  stroke = 'rgba(255,255,255,0.85)',
  fillFrom = 'rgba(255,255,255,0.18)',
  fillTo = 'rgba(255,255,255,0)',
}: {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fillFrom?: string
  fillTo?: string
}) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pad = 2
  const w = width - pad * 2
  const h = height - pad * 2

  const points = data.map((v, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * w
    const y = pad + h - ((v - min) / range) * h
    return [x, y] as const
  })

  // Build smooth path with simple Catmull-Rom-ish bezier
  const path = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`
    const [px, py] = points[i - 1]
    const cx = (px + x) / 2
    return `${acc} C ${cx.toFixed(1)} ${py.toFixed(1)}, ${cx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`
  }, '')

  const areaPath = `${path} L ${pad + w} ${pad + h} L ${pad} ${pad + h} Z`

  const gradId = 'spark-grad-' + Math.random().toString(36).slice(2, 8)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor={fillFrom} />
          <stop offset="100%" stopColor={fillTo} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath} fill={`url(#${gradId})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
      />
      <motion.path
        d={path} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {/* Endpoint dot */}
      {points.length > 0 && (
        <motion.circle
          cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={2.5}
          fill={stroke}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, duration: 0.3 }}
        />
      )}
    </svg>
  )
}
