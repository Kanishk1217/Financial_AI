import { useRef, type ReactNode, type CSSProperties } from 'react'

/**
 * Glassmorphic card with an aurora-style border that follows the mouse.
 * Inspired by Vercel / Linear / Aceternity glow-border patterns.
 *
 * Implementation:
 *   - inner content sits on a dark glass surface
 *   - parent has a conic-gradient ::before that we move via --x/--y vars
 *   - on hover the border glow becomes visible
 */
export function GlowCard({
  children,
  className,
  style,
  innerStyle,
  padding = 20,
  radius = 18,
  glowColor = 'rgba(255,255,255,0.18)',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  innerStyle?: CSSProperties
  padding?: number
  radius?: number
  glowColor?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--gx', `${e.clientX - r.left}px`)
    el.style.setProperty('--gy', `${e.clientY - r.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={className}
      style={{
        position: 'relative',
        borderRadius: radius,
        background: 'rgba(20,20,22,0.5)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, border-color 0.25s ease',
        // Aura that follows cursor (visible only on hover via ::before-ish)
        ['--gx' as any]: '50%',
        ['--gy' as any]: '50%',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Cursor-following glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, borderRadius: radius,
          background: `radial-gradient(260px circle at var(--gx) var(--gy), ${glowColor}, transparent 60%)`,
          opacity: 0, transition: 'opacity 0.25s ease',
          pointerEvents: 'none',
        }}
        className="glowcard-aura"
      />
      <style>{`
        .glowcard-aura { opacity: 0; }
        :is(*):hover > .glowcard-aura { opacity: 1; }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, padding, ...innerStyle }}>
        {children}
      </div>
    </div>
  )
}
