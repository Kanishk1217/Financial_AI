import { useEffect, useRef } from 'react'

/**
 * Aceternity-style cursor spotlight overlay.
 * Drop inside any container with position:relative. It tracks the mouse and
 * paints a soft radial gradient that follows the pointer.
 */
export function Spotlight({
  color = 'rgba(255,255,255,0.10)',
  size = 600,
  className,
}: {
  color?: string
  size?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parent = el.parentElement
    if (!parent) return

    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
      el.style.opacity = '1'
    }
    const onLeave = () => { el.style.opacity = '0' }

    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 200ms ease',
        background: `radial-gradient(${size}px circle at var(--mx, 50%) var(--my, 50%), ${color}, transparent 60%)`,
        zIndex: 1,
      }}
    />
  )
}
