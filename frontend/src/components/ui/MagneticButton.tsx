import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Cursor-pulling button used on landing CTAs.
 * Inspired by Awwwards / Linear / Vercel marketing pages.
 */
export function MagneticButton({
  children,
  onClick,
  href,
  pull = 0.25,
  style,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  pull?: number
  style?: React.CSSProperties
  className?: string
}) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.5 })
  const scale = useTransform([x, y], (vals) => {
    const [vx, vy] = vals as [number, number]
    const d = Math.min(Math.hypot(vx, vy) / 30, 1)
    return 1 + d * 0.05
  })

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    rawX.set((e.clientX - cx) * pull)
    rawY.set((e.clientY - cy) * pull)
  }
  const onLeave = () => { rawX.set(0); rawY.set(0) }

  const Component: any = motion.button
  return (
    <Component
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => href ? (window.location.href = href) : onClick?.()}
      style={{ x, y, scale, ...style }}
      className={className}
    >
      {children}
    </Component>
  )
}
