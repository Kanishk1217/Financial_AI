import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Premium momentum scroll (Stripe / Linear marketing-style).
 * Mount once on a page to enable smooth scrolling for as long as the page is open.
 */
export function useLenis(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    let raf = 0
    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [enabled])
}
