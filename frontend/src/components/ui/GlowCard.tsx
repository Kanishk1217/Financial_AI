import { type ReactNode, type CSSProperties } from 'react'

/**
 * Clean warm-surface card. No blur, no glass — just white with
 * a warm tinted shadow and a subtle border that strengthens on hover.
 * Backward-compatible drop-in for the old glassmorphic GlowCard.
 */
export function FinCard({
  children,
  className = '',
  style,
  innerStyle,
  padding = 20,
  radius = 16,
  glowColor,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  innerStyle?: CSSProperties
  padding?: number
  radius?: number
  /** Optional tinted glow; pass a hex/rgb color to add a soft colored shadow. */
  glowColor?: string
}) {
  return (
    <div
      className={`fin-card ${className}`}
      style={{
        borderRadius: radius,
        ...(glowColor ? { boxShadow: `0 8px 32px ${glowColor}22` } : {}),
        ...style,
      }}
    >
      <div style={{ padding, ...innerStyle }}>
        {children}
      </div>
    </div>
  )
}

/** Dark variant — for elements that live inside the night/cinema landing surface */
export function NightCard({
  children,
  className = '',
  style,
  padding = 20,
  radius = 16,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  padding?: number
  radius?: number
}) {
  return (
    <div
      className={`night-card ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      <div style={{ padding }}>
        {children}
      </div>
    </div>
  )
}

/** Backward-compatible alias so existing imports don't break */
export const GlowCard = FinCard
