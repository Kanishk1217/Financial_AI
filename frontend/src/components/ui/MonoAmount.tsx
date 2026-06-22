import { type CSSProperties } from 'react'

type Props = {
  value: number
  currency?: string
  decimals?: number
  size?: CSSProperties['fontSize']
  weight?: CSSProperties['fontWeight']
  /** 'auto' colours green/red based on sign; 'ink' always uses --ink */
  color?: 'auto' | 'ink' | 'amber' | 'muted'
  className?: string
  style?: CSSProperties
  showSign?: boolean
}

const colorMap = {
  auto:  undefined,
  ink:   'var(--ink)',
  amber: 'var(--amber)',
  muted: 'var(--ink-secondary)',
}

export function MonoAmount({
  value,
  currency = '$',
  decimals = 2,
  size = '1em',
  weight = 500,
  color = 'auto',
  className = '',
  style,
  showSign = false,
}: Props) {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const sign = value < 0 ? '-' : showSign && value > 0 ? '+' : ''

  const autoColor =
    color === 'auto'
      ? value > 0
        ? 'var(--emerald)'
        : value < 0
        ? 'var(--rose)'
        : 'var(--ink)'
      : colorMap[color]

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: size,
        fontWeight: weight,
        letterSpacing: '-0.01em',
        color: autoColor,
        ...style,
      }}
    >
      {sign}{currency}{formatted}
    </span>
  )
}
