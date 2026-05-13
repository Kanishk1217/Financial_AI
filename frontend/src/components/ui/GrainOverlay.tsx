/**
 * Fine SVG noise overlay to prevent banding on gradients and add tactile texture.
 * Pinned to the viewport, behind content, near-invisible (~5% opacity).
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        opacity: 0.07, mixBlendMode: 'overlay',
        backgroundImage:
          `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: '200px 200px',
      }}
    />
  )
}
