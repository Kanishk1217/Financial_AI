import { motion } from 'motion/react'

interface Props {
  value: number
  max: number
  color?: string
  height?: number
  showLabel?: boolean
  label?: string
  delay?: number
}

export function AnimatedProgressBar({ value, max, color = 'var(--electric)', height = 8, showLabel = true, label, delay = 0 }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  const isWarning = pct >= 80
  const isCritical = pct >= 100
  const displayColor = isCritical ? 'var(--rose)' : isWarning ? 'var(--amber)' : color

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-ui)' }}>{label}</span>
          <span style={{ color: displayColor, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      )}
      <div
        className="relative overflow-hidden rounded-full"
        style={{ height, background: 'var(--parchment-deep)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${displayColor}99, ${displayColor})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* shimmer sweep */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, delay: delay + 0.8, repeat: Infinity, repeatDelay: 4 }}
          />
        </motion.div>
      </div>
    </div>
  )
}
