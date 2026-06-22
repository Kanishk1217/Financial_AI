import { useRef, useEffect } from 'react'

/**
 * Flowing data-field background.
 *
 * A curl-noise flow field: hundreds of particles advected by a smooth
 * trigonometric vector field, each drawing a fine fading strand. Reads as
 * "financial data / intelligence quietly in motion." Monochrome bone strands
 * with rare gold strands; the cursor adds a gentle swirl. Trails fade each
 * frame so the field stays elegant and never competes with the typography.
 *
 * Palette: espresso-black #0C0B0A, bone #EDE9E1, gold #C9A24B.
 */

const BG   = '#0C0B0A'
const BONE = '237, 233, 225'
const GOLD = '201, 162, 75'

export function BackgroundShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: -9999, y: -9999, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    let W = 0, H = 0
    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas!.width  = Math.floor(W * dpr)
      canvas!.height = Math.floor(H * dpr)
      canvas!.style.width  = W + 'px'
      canvas!.style.height = H + 'px'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.fillStyle = BG
      ctx!.fillRect(0, 0, W, H)
    }
    resize()
    window.addEventListener('resize', resize)

    // Smooth flowing vector field — layered trig "curl" noise
    function fieldAngle(x: number, y: number, t: number) {
      const a =
        Math.sin(x * 0.0022 + t * 0.18) +
        Math.cos(y * 0.0026 - t * 0.13) +
        Math.sin((x + y) * 0.0014 + t * 0.09)
      return a * 1.15
    }

    type P = { x: number; y: number; life: number; max: number; gold: boolean; w: number }
    const COUNT = Math.min(760, Math.floor((W * H) / 2400))
    const SPEED = 0.65

    function spawn(p: P) {
      p.x = Math.random() * W
      p.y = Math.random() * H
      p.max = 220 + Math.random() * 340
      p.life = Math.random() * p.max
      p.gold = Math.random() < 0.07
      p.w = p.gold ? 0.9 + Math.random() * 0.5 : 0.5 + Math.random() * 0.6
    }

    const ps: P[] = Array.from({ length: COUNT }, () => {
      const p = { x: 0, y: 0, life: 0, max: 0, gold: false, w: 1 }
      spawn(p)
      return p
    })

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
    }
    const onLeave = () => { mouseRef.current.active = false }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)

    let raf = 0
    let t = 0

    function frame() {
      t += 0.016

      // Fade previous frame — controls strand length / trail
      ctx!.fillStyle = 'rgba(12, 11, 10, 0.052)'
      ctx!.fillRect(0, 0, W, H)

      const m = mouseRef.current

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        const ox = p.x, oy = p.y

        let ang = fieldAngle(p.x, p.y, t)
        let vx = Math.cos(ang) * SPEED
        let vy = Math.sin(ang) * SPEED

        // Cursor swirl — gentle perpendicular push within a radius
        if (m.active) {
          const dx = p.x - m.x, dy = p.y - m.y
          const d2 = dx * dx + dy * dy
          const R = 200
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / R) * 1.6
            vx += (-dy / d) * f
            vy += ( dx / d) * f
          }
        }

        p.x += vx
        p.y += vy
        p.life++

        // Edge depth — strands dim toward screen edges (vignette)
        const edge =
          Math.min(p.x, W - p.x, p.y, H - p.y) < 120
            ? Math.max(0, Math.min(p.x, W - p.x, p.y, H - p.y) / 120)
            : 1

        const base = p.gold ? GOLD : BONE
        const alpha = (p.gold ? 0.13 : 0.085) * edge
        ctx!.strokeStyle = `rgba(${base}, ${alpha})`
        ctx!.lineWidth = p.w
        ctx!.beginPath()
        ctx!.moveTo(ox, oy)
        ctx!.lineTo(p.x, p.y)
        ctx!.stroke()

        if (
          p.life > p.max ||
          p.x < -20 || p.x > W + 20 ||
          p.y < -20 || p.y > H + 20
        ) {
          spawn(p)
        }
      }

      raf = requestAnimationFrame(frame)
    }

    if (reduced) {
      // Static: one calm pass, no animation
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, W, H)
      for (let pass = 0; pass < 90; pass++) {
        for (const p of ps) {
          const ox = p.x, oy = p.y
          const ang = fieldAngle(p.x, p.y, 0)
          p.x += Math.cos(ang) * SPEED
          p.y += Math.sin(ang) * SPEED
          ctx.strokeStyle = `rgba(${p.gold ? GOLD : BONE}, ${p.gold ? 0.1 : 0.05})`
          ctx.lineWidth = p.w
          ctx.beginPath()
          ctx.moveTo(ox, oy)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        }
      }
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}
