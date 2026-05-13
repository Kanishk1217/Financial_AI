import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

/**
 * Stripe / Linear / Aceternity-style hover tilt + light-glare card.
 * Wraps any content. Use as a drop-in replacement for a div.
 */
export function TiltCard({
  children,
  className,
  style,
  intensity = 8, // degrees of max tilt
  glare = true,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  intensity?: number
  glare?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 280, damping: 24, mass: 0.6 })
  const y = useSpring(rawY, { stiffness: 280, damping: 24, mass: 0.6 })

  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity])
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity])
  const glareX  = useTransform(x, [-0.5, 0.5], ['0%', '100%'])
  const glareY  = useTransform(y, [-0.5, 0.5], ['0%', '100%'])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    rawX.set((e.clientX - r.left) / r.width - 0.5)
    rawY.set((e.clientY - r.top) / r.height - 0.5)
  }
  const handleLeave = () => { rawX.set(0); rawY.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        rotateX, rotateY,
        ...style,
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      {glare && (
        <motion.div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.16), transparent 50%)',
            ['--gx' as any]: glareX, ['--gy' as any]: glareY,
            borderRadius: 'inherit',
            mixBlendMode: 'overlay',
            opacity: 0.9,
          } as React.CSSProperties}
        />
      )}
    </motion.div>
  )
}
