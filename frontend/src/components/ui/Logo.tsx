/**
 * FinanceAI custom logo mark.
 * - A stylized "F" composed of an upward growth arrow inside a rounded square.
 * - Gradient stroke (violet → cyan) with a slow drifting hue animation.
 * - Subtle inner highlight for depth.
 */
export function LogoMark({
  size = 36,
  radius = 11,
  glow = true,
  animated = true,
}: {
  size?: number
  radius?: number
  glow?: boolean
  animated?: boolean
}) {
  const id = 'logo-' + size
  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      borderRadius: radius,
      background: 'linear-gradient(135deg, #0c0c14 0%, #15151c 100%)',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: glow
        ? `0 0 24px rgba(180,140,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08)`
        : 'inset 0 1px 0 rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Aurora glow inside */}
      <div style={{
        position: 'absolute', inset: 0,
        background: animated
          ? `conic-gradient(from 0deg, rgba(180,140,255,0.30), rgba(120,200,255,0.30), rgba(140,240,170,0.20), rgba(180,140,255,0.30))`
          : `linear-gradient(135deg, rgba(180,140,255,0.18), rgba(120,200,255,0.10))`,
        opacity: 0.55,
        animation: animated ? `${id}-spin 12s linear infinite` : undefined,
        filter: 'blur(8px)',
      }} />
      {/* Inner glass surface */}
      <div style={{
        position: 'absolute', inset: 2,
        borderRadius: radius - 3,
        background: 'rgba(8,8,12,0.7)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }} />
      {/* The mark */}
      <svg
        viewBox="0 0 32 32"
        width={size * 0.62} height={size * 0.62}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <linearGradient id={id + '-stroke'} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#c4b5fd" />
            <stop offset="60%"  stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <linearGradient id={id + '-fill'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(196,181,253,0.4)" />
            <stop offset="100%" stopColor="rgba(125,211,252,0.15)" />
          </linearGradient>
        </defs>
        {/* Stylized "F" rising mark — like a stock chart growing up-right */}
        <path
          d="M 7 24 L 7 8 L 23 8 M 7 16 L 19 16 M 21 22 L 26 17"
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 0 3px rgba(180,140,255,0.55))"
        />
        {/* Arrow head */}
        <path
          d="M 26 17 L 26 13 M 26 17 L 22 17"
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small accent dot */}
        <circle cx="7" cy="24" r="1.5" fill="#fff" opacity="0.9" />
      </svg>
      <style>{`
        @keyframes ${id}-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
