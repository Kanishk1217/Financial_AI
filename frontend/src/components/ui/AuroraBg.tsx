/**
 * Animated aurora mesh gradient background.
 * Three soft color blobs drifting slowly behind everything.
 * Inspired by Linear / Vercel / Stripe marketing.
 */
export function AuroraBg() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        overflow: 'hidden',
        background: '#070708',
      }}
    >
      {/* Blob A — violet, top-left */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,80,220,0.22) 0%, transparent 65%)',
        filter: 'blur(60px)',
        animation: 'auroraA 22s ease-in-out infinite alternate',
      }} />
      {/* Blob B — teal, right */}
      <div style={{
        position: 'absolute', top: '20%', right: '-15%',
        width: '55vw', height: '55vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(60,180,200,0.18) 0%, transparent 65%)',
        filter: 'blur(70px)',
        animation: 'auroraB 26s ease-in-out infinite alternate',
      }} />
      {/* Blob C — amber, bottom-center */}
      <div style={{
        position: 'absolute', bottom: '-20%', left: '20%',
        width: '70vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,170,80,0.12) 0%, transparent 65%)',
        filter: 'blur(80px)',
        animation: 'auroraC 30s ease-in-out infinite alternate',
      }} />
      {/* Vignette to keep edges dark */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.55) 95%)',
      }} />
      <style>{`
        @keyframes auroraA {
          0%   { transform: translate(0, 0)        scale(1);   }
          100% { transform: translate(8vw, 12vh)   scale(1.08); }
        }
        @keyframes auroraB {
          0%   { transform: translate(0, 0)        scale(1);    }
          100% { transform: translate(-10vw, 8vh)  scale(1.12); }
        }
        @keyframes auroraC {
          0%   { transform: translate(0, 0)        scale(1);   }
          100% { transform: translate(6vw, -10vh)  scale(1.1); }
        }
      `}</style>
    </div>
  )
}
