// @ts-nocheck
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react'
import { LogoMark } from '@/components/ui/Logo'
import { BackgroundShader } from '@/components/BackgroundShader'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { C } from '@/lib/landingTheme'

export function LandingBackground() {
  return (
    <>
      <BackgroundShader />
      <div className="landing-grain" />
    </>
  )
}

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/faq', label: 'FAQ' },
]

export function MarketingNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        background: 'rgba(12,11,10,0.78)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${C.lineFaint}`,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
        <LogoMark size={26} radius={7} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text, letterSpacing: '-0.025em', fontFamily: 'var(--font-ui)' }}>FinanceAI</span>
      </Link>

      <nav style={{ display: 'flex', gap: 30 }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            fontSize: 13, color: isActive ? C.gold : C.faint, textDecoration: 'none',
            fontFamily: 'var(--font-ui)', fontWeight: 500, transition: 'color 0.2s',
          })}
            onMouseEnter={e => { if (e.currentTarget.style.color !== 'rgb(201, 162, 75)') e.currentTarget.style.color = C.text }}
            onMouseLeave={e => {
              const active = e.currentTarget.getAttribute('aria-current') === 'page'
              e.currentTarget.style.color = active ? C.gold : C.faint
            }}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/login" style={{ fontSize: 13, color: C.faint, textDecoration: 'none', padding: '7px 14px', fontFamily: 'var(--font-ui)', fontWeight: 500, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>Sign in</Link>
        <MagneticButton href="/login" className="btn-gold" style={{ fontSize: 13, padding: '9px 18px' }}>
          Get started <ArrowRight size={12} weight="bold" />
        </MagneticButton>
      </div>
    </motion.header>
  )
}

export function MarketingFooter() {
  return (
    <footer style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 80px 48px', borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LogoMark size={18} radius={5} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.faint, fontFamily: 'var(--font-ui)', letterSpacing: '-0.02em' }}>FinanceAI</span>
      </div>
      <nav style={{ display: 'flex', gap: 24 }}>
        {NAV_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} style={{ fontSize: 12, color: C.faint, textDecoration: 'none', fontFamily: 'var(--font-ui)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>{label}</Link>
        ))}
      </nav>
      <span style={{ fontSize: 11, color: C.ghost, fontFamily: 'var(--font-ui)' }}>FastAPI + React · Open source · MIT</span>
      <MagneticButton href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.faint, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', padding: 0 }}>
        Sign in <ArrowUpRight size={10} />
      </MagneticButton>
    </footer>
  )
}

/** Wraps a marketing page in the shared dark surface + background + nav + footer. */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: 'var(--font-ui)', overflowX: 'hidden', position: 'relative', isolation: 'isolate' }}>
      <LandingBackground />
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  )
}

/* ─────────────────── Reusable page header ─────────────────── */
export function PageHero({ eyebrow, title, titleDim, sub }: { eyebrow?: string; title: string; titleDim?: string; sub: string }) {
  return (
    <section style={{ maxWidth: 1320, margin: '0 auto', padding: '180px 80px 72px' }}>
      {eyebrow && (
        <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'inline-block', marginBottom: 22, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.gold, fontFamily: 'var(--font-ui)' }}>
          {eyebrow}
        </motion.span>
      )}
      <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ margin: 0, fontSize: 'clamp(48px, 6.4vw, 92px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.92, fontFamily: 'var(--font-display)', color: C.text, maxWidth: 900 }}>
        {title}{titleDim && <><br /><span style={{ color: C.taupe }}>{titleDim}</span></>}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}
        style={{ marginTop: 28, fontSize: 17, lineHeight: 1.7, color: C.dim, maxWidth: 560, fontFamily: 'var(--font-ui)' }}>
        {sub}
      </motion.p>
    </section>
  )
}

/* ─────────────────── Reusable closing CTA band ─────────────────── */
export function CtaBand({ title = 'Your money, finally clear.', sub = 'Free, open source, and built with the tools you already trust.' }: { title?: string; sub?: string }) {
  return (
    <section style={{ borderTop: `1px solid ${C.lineFaint}`, padding: '120px 80px', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,162,75,0.06) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95, color: C.text, margin: 0, fontFamily: 'var(--font-display)' }}>{title}</h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.dim, maxWidth: 440, margin: '24px auto 36px', fontFamily: 'var(--font-ui)' }}>{sub}</p>
        <MagneticButton href="/login" className="btn-gold glow-gold" style={{ fontSize: 14.5, padding: '15px 34px' }}>
          Start for free <ArrowRight size={15} weight="bold" />
        </MagneticButton>
      </div>
    </section>
  )
}
