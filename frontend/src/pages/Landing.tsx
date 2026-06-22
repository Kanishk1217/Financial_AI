// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, useMotionValue, useSpring, useTransform, useInView,
} from 'motion/react'
import {
  ArrowRight, ArrowUpRight,
  ShieldCheck, ChartLineUp, Brain, Sparkle, Database,
  Star, CheckCircle, Lightning,
} from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { LogoMark } from '@/components/ui/Logo'
import { BackgroundShader } from '@/components/BackgroundShader'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { TiltCard } from '@/components/ui/TiltCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Accordion, AccordionContent,
  AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────── Palette: quiet luxe + gold ─────────────────── */
const C = {
  bg:      '#0C0B0A',
  text:    '#EDE9E1',
  dim:     'rgba(237,233,225,0.55)',
  faint:   'rgba(237,233,225,0.34)',
  ghost:   'rgba(237,233,225,0.2)',
  gold:    '#C9A24B',
  goldSoft:'rgba(201,162,75,0.7)',
  goldFaint:'rgba(201,162,75,0.12)',
  goldLine:'rgba(201,162,75,0.22)',
  taupe:   '#6E675B',
  line:    'rgba(237,233,225,0.09)',
  lineFaint:'rgba(237,233,225,0.05)',
  surface: 'rgba(237,233,225,0.022)',
  surfaceBorder: 'rgba(237,233,225,0.08)',
  pos:     '#8A9A5B',  /* muted olive — positive */
  neg:     '#B5563F',  /* warm brick — alert / negative */
}

/* ─────────────────── Background ─────────────────── */
function LandingBackground() {
  return (
    <>
      <BackgroundShader />
      <div className="landing-grain" />
    </>
  )
}

/* ─────────────────── App Preview (hero right) ─────────────────── */
function AppPreview() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-120, 120], [5, -5]), { stiffness: 150, damping: 28 })
  const ry = useSpring(useTransform(mx, [-120, 120], [-10, 4]), { stiffness: 150, damping: 28 })

  const bars = [55, 72, 60, 88, 100, 68, 74]
  const txs = [
    { name: 'Whole Foods', cat: 'Groceries', amt: '-$86.40', up: false },
    { name: 'Salary Deposit', cat: 'Income', amt: '+$4,200', up: true },
    { name: 'Netflix', cat: 'Streaming', amt: '-$15.99', up: false },
  ]

  return (
    <div
      style={{ perspective: 1200 }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left - r.width / 2)
        my.set(e.clientY - r.top - r.height / 2)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
    >
      <motion.div
        style={{
          rotateX: rx, rotateY: ry,
          borderRadius: 18, overflow: 'hidden',
          border: `1px solid ${C.surfaceBorder}`,
          background: 'rgba(14,13,11,0.96)',
          boxShadow: `
            0 0 0 1px rgba(237,233,225,0.03),
            0 4px 8px rgba(0,0,0,0.45),
            0 24px 64px rgba(0,0,0,0.55),
            0 56px 120px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(237,233,225,0.05)
          `,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '144px 1fr' }}>
          {/* Sidebar */}
          <div style={{
            borderRight: `1px solid ${C.lineFaint}`,
            padding: '14px 10px',
            display: 'flex', flexDirection: 'column', gap: 2,
            background: 'rgba(237,233,225,0.012)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16, padding: '0 2px' }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: 1.5, background: 'rgba(26,20,7,0.9)' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(237,233,225,0.7)', fontFamily: 'var(--font-ui)', letterSpacing: '-0.01em' }}>FinanceAI</span>
            </div>
            {[
              { label: 'Dashboard', active: true },
              { label: 'Transactions', active: false },
              { label: 'Budget', active: false },
              { label: 'Reports', active: false },
              { label: 'Smart AI', active: false },
            ].map(({ label, active }) => (
              <div key={label} style={{
                padding: '5px 8px', borderRadius: 5, fontSize: 9.5,
                background: active ? C.goldFaint : 'transparent',
                borderLeft: active ? `2px solid ${C.gold}` : '2px solid transparent',
                color: active ? C.gold : 'rgba(237,233,225,0.24)',
                fontWeight: active ? 600 : 400, fontFamily: 'var(--font-ui)',
              }}>{label}</div>
            ))}
          </div>

          {/* Main panel */}
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 7.5, color: 'rgba(237,233,225,0.32)', marginBottom: 2, fontFamily: 'var(--font-ui)' }}>Net worth</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: C.text, letterSpacing: '-0.04em', fontFamily: 'var(--font-mono)' }}>$48,231.70</div>
              <span style={{
                display: 'inline-block', fontSize: 8.5, fontFamily: 'var(--font-mono)',
                color: C.pos, background: 'rgba(138,154,90,0.12)',
                border: '1px solid rgba(138,154,90,0.22)',
                borderRadius: 4, padding: '1px 6px', marginTop: 4,
              }}>+$1,402 this month</span>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.lineFaint}`, borderRadius: 9, padding: '9px 11px' }}>
              <div style={{ fontSize: 7.5, color: 'rgba(237,233,225,0.38)', marginBottom: 7, fontFamily: 'var(--font-ui)' }}>Weekly spending</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{
                    flex: 1, borderRadius: '2px 2px 0 0',
                    background: i === 4 ? C.gold : 'rgba(237,233,225,0.07)',
                    height: `${h}%`,
                  }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 7.5, color: 'rgba(237,233,225,0.35)', fontFamily: 'var(--font-ui)', marginBottom: 2 }}>Recent</div>
              {txs.map((t) => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(237,233,225,0.68)', fontWeight: 500, fontFamily: 'var(--font-ui)' }}>{t.name}</div>
                    <div style={{ fontSize: 7.5, color: 'rgba(237,233,225,0.28)', fontFamily: 'var(--font-ui)' }}>{t.cat}</div>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)',
                    color: t.up ? C.pos : 'rgba(237,233,225,0.5)',
                  }}>{t.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────────────── Logo ticker ─────────────────── */
const LOGOS = ['Plaid', 'GitHub', 'Vercel', 'Linear', 'Stripe', 'Figma', 'Notion']

function LogoTicker() {
  const doubled = [...LOGOS, ...LOGOS, ...LOGOS]
  return (
    <div style={{ borderTop: `1px solid ${C.lineFaint}`, borderBottom: `1px solid ${C.lineFaint}`, padding: '22px 0', overflow: 'hidden' }}>
      <div style={{ marginBottom: 12, textAlign: 'center' }}>
        <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ghost, fontFamily: 'var(--font-ui)' }}>
          Integrates with the tools you trust
        </span>
      </div>
      <div className="marquee-track" style={{ display: 'flex', alignItems: 'center' }}>
        {doubled.map((name, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', padding: '0 34px', whiteSpace: 'nowrap', fontSize: 13.5, fontWeight: 700, color: 'rgba(237,233,225,0.18)', fontFamily: 'var(--font-ui)', letterSpacing: '-0.02em' }}>
            {name}
            <span style={{ margin: '0 0 0 34px', width: 4, height: 4, borderRadius: '50%', background: C.goldLine, display: 'inline-block' }} />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── GSAP Pin 1: Scale ─────────────────── */
function ScalePin() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)

  const stats = [
    { num: 12000, suffix: '+', label: 'financial institutions', sub: 'Chase, Bank of America, Wells Fargo, and everywhere else.' },
    { num: 50, suffix: '+', label: 'smart spending categories', sub: 'Every transaction sorted automatically. Zero manual work.' },
    { num: 100, suffix: '%', label: 'your data, always', sub: 'Self-hosted. No telemetry. MIT licensed. Own everything.' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = sectionRef.current!
      const items = gsap.utils.toArray<Element>('.scale-item', scope)
      const line = scope.querySelector('.scale-progress-line')

      gsap.set(items, { opacity: 0, y: 80, scale: 0.94, filter: 'blur(6px)' })
      gsap.set(line, { scaleX: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top', end: '+=200%',
          pin: true, pinSpacing: true, scrub: 1.2,
          onEnter: () => setInView(true),
        },
      })
      items.forEach((item, i) => {
        tl.to(item, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', ease: 'power3.out', duration: 0.5 }, i * 0.26)
      })
      tl.to(line, { scaleX: 1, ease: 'none', duration: 0.9 }, 0)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{
      height: '100dvh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '0 80px', position: 'relative',
      borderTop: `1px solid ${C.lineFaint}`,
    }}>
      <div style={{ marginBottom: 72 }}>
        <h2 style={{
          fontSize: 'clamp(44px, 6vw, 72px)',
          fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95,
          color: C.text, margin: 0, fontFamily: 'var(--font-display)',
        }}>
          Built different.<br />
          <span style={{ color: C.taupe }}>By design.</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
        {stats.map((s, i) => (
          <div key={i} className="scale-item" style={{
            paddingRight: i < 2 ? 48 : 0, paddingLeft: i > 0 ? 48 : 0,
            borderRight: i < 2 ? `1px solid ${C.line}` : 'none',
          }}>
            <div style={{
              fontSize: 'clamp(52px, 6.5vw, 88px)',
              fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1,
              color: C.gold, fontFamily: 'var(--font-display)', marginBottom: 14,
              display: 'flex', alignItems: 'baseline',
            }}>
              {inView ? (
                <AnimatedNumber value={s.num} suffix={s.suffix} style={{ fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit', color: 'inherit', fontFamily: 'inherit' }} />
              ) : (
                <span>{s.num}{s.suffix}</span>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: 'var(--font-ui)', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.2 }}>{s.label}</div>
            <div style={{ fontSize: 13, color: C.faint, lineHeight: 1.65, fontFamily: 'var(--font-ui)', maxWidth: 280 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 48, left: 80, right: 80, height: 1, background: C.line }}>
        <div className="scale-progress-line" style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${C.gold}, ${C.goldLine})`, transformOrigin: 'left' }} />
      </div>
    </section>
  )
}

/* ─────────────────── Feature visuals ─────────────────── */
const FEATURES = [
  { num: '01', title: 'Anomaly Detection', desc: 'Every transaction is compared against your historical patterns. Unusual spikes get flagged instantly, before they become problems.' },
  { num: '02', title: 'Smart Budgets', desc: 'Category budgets with live tracking. Get a 20% warning before you overspend, not a surprise at month end.' },
  { num: '03', title: 'Monthly Reports', desc: 'Beautiful, exportable reports generated automatically. Income, expenses, savings rate. Every number you need.' },
  { num: '04', title: 'AI Financial Chat', desc: 'Ask questions about your money in plain English. "Where did I overspend last month?" gets a real, data-backed answer.' },
]

function AnomalyVisual() {
  const bars = [30, 28, 42, 35, 100, 38, 42]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: C.faint, fontFamily: 'var(--font-ui)' }}>Spending this week</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600, color: C.neg, background: 'rgba(181,86,63,0.12)', border: '1px solid rgba(181,86,63,0.25)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>SPIKE DETECTED</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
        {bars.map((h, i) => {
          const isSpike = i === 4
          return (
            <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', background: isSpike ? 'rgba(181,86,63,0.8)' : 'rgba(237,233,225,0.08)', height: `${h}%`, position: 'relative' }}>
              {isSpike && (
                <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', fontSize: 8, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EDE9E1', background: 'rgba(181,86,63,0.92)', padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap' }}>3.2x avg</div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
          <span key={d} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: i === 4 ? 'rgba(181,86,63,0.7)' : 'rgba(237,233,225,0.22)', fontFamily: 'var(--font-ui)' }}>{d}</span>
        ))}
      </div>
    </div>
  )
}

function BudgetVisual() {
  const cats = [
    { label: 'Groceries', pct: 78, spent: '$234', of: '$300' },
    { label: 'Dining out', pct: 45, spent: '$90', of: '$200' },
    { label: 'Transport', pct: 92, spent: '$138', of: '$150' },
    { label: 'Entertainment', pct: 34, spent: '$51', of: '$150' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {cats.map((c) => (
        <div key={c.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: C.dim, fontFamily: 'var(--font-ui)' }}>{c.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: c.pct >= 85 ? 'rgba(181,86,63,0.8)' : 'rgba(237,233,225,0.55)' }}>{c.spent} / {c.of}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(237,233,225,0.07)' }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${c.pct}%`, background: c.pct >= 85 ? C.neg : c.pct >= 70 ? C.gold : C.taupe, opacity: 0.85 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportsVisual() {
  const rows = [
    { label: 'Income', value: '+$4,200', color: C.pos },
    { label: 'Fixed costs', value: '-$1,640', color: 'rgba(237,233,225,0.55)' },
    { label: 'Variable spend', value: '-$812', color: 'rgba(237,233,225,0.45)' },
    { label: 'Subscriptions', value: '-$346', color: 'rgba(237,233,225,0.35)' },
    { label: 'Net saved', value: '+$1,402', color: C.gold },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, color: C.faint, fontFamily: 'var(--font-ui)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>May 2025</div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: C.dim, fontFamily: 'var(--font-ui)' }}>{r.label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: r.color }}>{r.value}</span>
        </div>
      ))}
      <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 11, color: C.faint, fontFamily: 'var(--font-ui)' }}>
        33.4% savings rate · +8pp vs last month
      </div>
    </div>
  )
}

function AiVisual() {
  const msgs = [
    { role: 'user', text: 'Where did I overspend in April?' },
    { role: 'ai', text: 'Dining out was 2.1x your March average. $340 vs your $162 norm. Three restaurant visits on Apr 12-14 account for $180 of the overage.' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {msgs.map((m, i) => (
        <div key={i} style={{
          padding: '10px 14px', borderRadius: 10,
          background: m.role === 'user' ? C.goldFaint : 'rgba(237,233,225,0.04)',
          border: `1px solid ${m.role === 'user' ? C.goldLine : C.lineFaint}`,
          fontSize: 12, lineHeight: 1.6,
          color: m.role === 'user' ? 'rgba(237,233,225,0.78)' : C.dim,
          fontFamily: 'var(--font-ui)',
        }}>
          {m.role === 'ai' && (
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Brain size={10} weight="fill" /> Smart AI
            </div>
          )}
          {m.text}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────── GSAP Pin 2: Features ─────────────────── */
function FeaturesPin() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const visuals = gsap.utils.toArray<Element>('.feat-visual')
      const labels = gsap.utils.toArray<Element>('.feat-label')

      gsap.set(visuals, { opacity: 0, y: 24 })
      gsap.set(visuals[0], { opacity: 1, y: 0 })
      gsap.set(labels, { opacity: 0.32 })
      gsap.set(labels[0], { opacity: 1 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top', end: '+=300%',
          pin: true, pinSpacing: true, scrub: 1.2,
        },
      })
      for (let i = 1; i < 4; i++) {
        const pos = (i - 1) * 0.28 + 0.08
        tl.to(visuals[i - 1], { opacity: 0, y: -20, ease: 'power2.in', duration: 0.12 }, pos)
        tl.fromTo(visuals[i], { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.14 }, pos + 0.04)
        tl.to(labels[i - 1], { opacity: 0.32, duration: 0.1 }, pos)
        tl.to(labels[i], { opacity: 1, duration: 0.1 }, pos)
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const ICONS = [Lightning, ChartLineUp, Database, Brain]

  return (
    <section id="features" ref={sectionRef} style={{
      height: '100dvh',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      borderTop: `1px solid ${C.lineFaint}`,
    }}>
      {/* Left: list */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', borderRight: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FEATURES.map((f, i) => {
            const Icon = ICONS[i]
            return (
              <div key={f.num} className="feat-label" style={{
                padding: '20px 0',
                borderBottom: i < 3 ? `1px solid ${C.lineFaint}` : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 16, cursor: 'default',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: C.goldFaint, border: `1px solid ${C.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={C.gold} weight="fill" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.goldSoft, fontFamily: 'var(--font-mono)' }}>{f.num}</span>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-ui)', letterSpacing: '-0.02em' }}>{f.title}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.faint, lineHeight: 1.6, fontFamily: 'var(--font-ui)', paddingLeft: 26 }}>{f.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: visual */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,75,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'grid' }}>
          {[<AnomalyVisual />, <BudgetVisual />, <ReportsVisual />, <AiVisual />].map((Visual, i) => (
            <div key={i} className="feat-visual" style={{
              gridArea: '1 / 1', opacity: i === 0 ? 1 : 0,
              background: C.surface, border: `1px solid ${C.surfaceBorder}`,
              borderRadius: 18, padding: 28,
              boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, marginBottom: 16, fontFamily: 'var(--font-ui)' }}>
                {FEATURES[i].title}
              </div>
              {Visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── How it works ─────────────────── */
const STEPS = [
  { icon: ShieldCheck, step: '01', title: 'Connect your accounts', body: 'Link any bank, credit card, or investment account via Plaid. 12,000+ institutions supported. Setup takes under 2 minutes.', pill: 'Plaid-powered' },
  { icon: Sparkle, step: '02', title: 'AI sorts everything', body: '50+ spending categories applied automatically. No manual tagging, no rules to configure. The model learns your patterns.', pill: 'Zero manual work' },
  { icon: ChartLineUp, step: '03', title: 'See the full picture', body: 'Monthly reports, anomaly alerts, budget tracking, and plain-English answers via AI chat. All in one place.', pill: 'All features included' },
]

function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} style={{ padding: '128px 80px', borderTop: `1px solid ${C.lineFaint}`, maxWidth: 1320, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ marginBottom: 80 }}>
        <h2 style={{ fontSize: 'clamp(36px, 4.4vw, 60px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, color: C.text, margin: 0, fontFamily: 'var(--font-display)' }}>
          Up in minutes,<br />
          <span style={{ color: C.taupe }}>clear forever.</span>
        </h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 24, left: '16%', right: '16%', height: 1, background: `linear-gradient(90deg, transparent, ${C.goldLine} 20%, ${C.goldLine} 80%, transparent)`, pointerEvents: 'none' }} />
        {STEPS.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 28 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ paddingRight: i < 2 ? 48 : 0, paddingLeft: i > 0 ? 48 : 0, borderRight: i < 2 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, marginBottom: 26, background: C.goldFaint, border: `1px solid ${C.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Icon size={20} color={C.gold} weight="fill" />
                <span style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderRadius: 999, background: C.bg, border: `1px solid ${C.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: C.gold, fontFamily: 'var(--font-mono)' }}>{s.step}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: 'var(--font-ui)', letterSpacing: '-0.025em', marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 13.5, color: C.faint, lineHeight: 1.65, fontFamily: 'var(--font-ui)', marginBottom: 18 }}>{s.body}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 600, fontFamily: 'var(--font-ui)', color: C.goldSoft, background: C.goldFaint, border: `1px solid ${C.goldLine}`, borderRadius: 999, padding: '4px 11px' }}>
                <CheckCircle size={11} weight="fill" /> {s.pill}
              </span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* ─────────────────── Testimonials ─────────────────── */
const TESTIMONIALS = [
  { quote: "Caught a $240 subscription I forgot about in the first week. Already paid for itself.", name: 'Maya Rodriguez', role: 'Product Designer', initials: 'MR', tone: '#B07B3C' },
  { quote: "The anomaly detection flagged an unusual Uber charge before I even checked my phone. Genuinely impressive.", name: 'James Okafor', role: 'Software Engineer', initials: 'JO', tone: '#8A9A5B' },
  { quote: "I finally understand where my money goes. The monthly reports are clear, honest, and beautifully laid out.", name: 'Priya Sharma', role: 'Freelance Consultant', initials: 'PS', tone: '#C9A24B' },
]

function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} style={{ padding: '128px 80px', borderTop: `1px solid ${C.lineFaint}`, maxWidth: 1320, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 72 }}>
        <h2 style={{ fontSize: 'clamp(36px, 4.4vw, 60px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, color: C.text, margin: 0, fontFamily: 'var(--font-display)' }}>
          Real people,<br />
          <span style={{ color: C.taupe }}>real clarity.</span>
        </h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 32 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}>
            <TiltCard intensity={4} glare={false} style={{ background: C.surface, border: `1px solid ${C.surfaceBorder}`, borderRadius: 18, padding: 30, height: '100%', boxShadow: '0 2px 24px rgba(0,0,0,0.22)' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={13} weight="fill" color={C.gold} />
                ))}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(237,233,225,0.72)', fontFamily: 'var(--font-ui)', margin: '0 0 26px' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Avatar style={{ width: 38, height: 38 }}>
                  <AvatarFallback style={{ background: `${t.tone}22`, border: `1px solid ${t.tone}40`, color: t.tone, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-ui)', letterSpacing: '-0.01em' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, fontFamily: 'var(--font-ui)' }}>{t.role}</div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────── GSAP Pin 3: Promise ─────────────────── */
function PromisePin() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = sectionRef.current!
      const words = gsap.utils.toArray<Element>('.promise-word', scope)
      const cta = scope.querySelector('.promise-cta')
      const sub = scope.querySelector('.promise-sub')

      gsap.set(words, { opacity: 0, y: 60, filter: 'blur(14px)' })
      gsap.set(cta, { opacity: 0, y: 28 })
      gsap.set(sub, { opacity: 0, y: 16 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=180%', pin: true, pinSpacing: true, scrub: 1.1 },
      })
      words.forEach((word, i) => {
        tl.to(word, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power3.out', duration: 0.35 }, i * 0.2)
      })
      tl.to(sub, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.84)
      tl.to(cta, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.28 }, 0.96)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const words = ['Your', 'money,', 'finally', 'clear.']

  return (
    <section ref={sectionRef} style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 80px', textAlign: 'center', position: 'relative',
      borderTop: `1px solid ${C.lineFaint}`,
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,75,0.06) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{
          fontSize: 'clamp(56px, 8.5vw, 120px)',
          fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.92,
          margin: '0 0 36px', fontFamily: 'var(--font-display)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.2em',
        }}>
          {words.map((w, i) => (
            <span key={i} className="promise-word" style={{ display: 'inline-block', color: i < 2 ? C.text : C.gold }}>{w}</span>
          ))}
        </h2>
        <p className="promise-sub" style={{ fontSize: 16, lineHeight: 1.7, color: C.dim, maxWidth: 440, margin: '0 auto 40px', fontFamily: 'var(--font-ui)' }}>
          Free, open source, and built with the tools you already trust. Your data stays yours.
        </p>
        <div className="promise-cta">
          <MagneticButton href="/login" className="btn-gold glow-gold" style={{ fontSize: 14.5, padding: '15px 34px' }}>
            Start free <ArrowRight size={15} weight="bold" />
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── FAQ ─────────────────── */
const faqs = [
  { q: 'Is FinanceAI free?', a: 'Completely free and open source. Self-host it or run it locally. No subscription, no trial, no credit card.' },
  { q: 'How is my data stored?', a: 'All data lives in your own PostgreSQL database. Nothing is sent to third-party analytics. You own everything.' },
  { q: 'What banks are supported?', a: 'FinanceAI integrates with Plaid, which connects to 12,000+ financial institutions in the US, Canada, and UK.' },
  { q: 'Can I export my data?', a: 'Yes. Every monthly report can be downloaded as a CSV from the Reports page.' },
  { q: 'How does anomaly detection work?', a: 'The backend compares current-week spending by category against your historical weekly averages and flags categories that exceed 2x the norm.' },
]

function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} style={{ padding: '128px 80px', maxWidth: 760, margin: '0 auto' }}>
      <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        style={{ fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, color: C.text, margin: '0 0 48px', fontFamily: 'var(--font-display)' }}>
        Questions.
      </motion.h2>

      <Accordion type="single" collapsible>
        {faqs.map((faq, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.07 }}>
            <AccordionItem value={`item-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div style={{
      background: C.bg, color: C.text, fontFamily: 'var(--font-ui)',
      overflowX: 'hidden', position: 'relative', isolation: 'isolate',
    }}>
      <LandingBackground />

      {/* ════ NAV ════ */}
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

        <nav style={{ display: 'flex', gap: 32 }}>
          {[['#features', 'Features'], ['#faq', 'FAQ']].map(([h, l]) => (
            <a key={h} href={h} style={{ fontSize: 13, color: C.faint, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>{l}</a>
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

      {/* ════ HERO ════ */}
      <section style={{
        minHeight: '100dvh', paddingTop: 60,
        display: 'grid', gridTemplateColumns: '55% 45%', alignItems: 'center',
        maxWidth: 1320, margin: '0 auto', padding: '60px 80px 0', gap: 48,
      }}>
        <div style={{ paddingBottom: 80 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }} style={{ marginBottom: 30 }}>
            <Badge variant="outline" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 999,
              border: `1px solid ${C.goldLine}`, background: C.goldFaint,
              fontSize: 11, color: C.gold, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.02em',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, display: 'inline-block', flexShrink: 0 }} />
              Free &amp; open source
            </Badge>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ margin: '0 0 24px', fontSize: 'clamp(58px, 7vw, 104px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.9, fontFamily: 'var(--font-display)', color: C.text }}>
            Understand<br />your money,<br /><span style={{ color: C.taupe }}>finally.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: 16, lineHeight: 1.7, color: C.dim, maxWidth: 410, margin: '0 0 36px', fontFamily: 'var(--font-ui)' }}>
            An AI finance tracker that categorises spending, detects anomalies, and generates reports. All automatically.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.5 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MagneticButton href="/login" className="btn-gold glow-gold" style={{ fontSize: 14, padding: '14px 28px' }}>
              Start for free <ArrowRight size={14} weight="bold" />
            </MagneticButton>
            <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 16px', fontSize: 13, color: C.faint, textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'var(--font-ui)', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>
              See features <ArrowRight size={12} />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85, duration: 0.5 }}
            style={{ display: 'flex', gap: 36, marginTop: 56, paddingTop: 32, borderTop: `1px solid ${C.line}` }}>
            {[{ v: '12k+', l: 'Banks connected' }, { v: '50+', l: 'Auto categories' }, { v: 'MIT', l: 'Licensed' }].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: C.gold, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 5, fontFamily: 'var(--font-ui)' }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 40, y: 12 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.32, duration: 1, ease: [0.16, 1, 0.3, 1] }} style={{ paddingBottom: 40, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '30%', left: '20%', right: '20%', bottom: '10%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,75,0.12) 0%, transparent 70%)', filter: 'blur(48px)', pointerEvents: 'none' }} />
          <AppPreview />
        </motion.div>
      </section>

      {/* ════ LOGO TICKER ════ */}
      <LogoTicker />

      {/* ════ PIN 1: Scale ════ */}
      <ScalePin />

      {/* ════ PIN 2: Features ════ */}
      <FeaturesPin />

      {/* ════ HOW IT WORKS ════ */}
      <HowItWorks />

      {/* ════ TESTIMONIALS ════ */}
      <Testimonials />

      {/* ════ PIN 3: Promise ════ */}
      <PromisePin />

      {/* ════ FAQ ════ */}
      <div id="faq" style={{ borderTop: `1px solid ${C.lineFaint}` }}>
        <FAQ />
      </div>

      {/* ════ FOOTER ════ */}
      <footer style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 80px 48px', borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoMark size={18} radius={5} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.faint, fontFamily: 'var(--font-ui)', letterSpacing: '-0.02em' }}>FinanceAI</span>
        </div>
        <span style={{ fontSize: 11, color: C.ghost, fontFamily: 'var(--font-ui)' }}>FastAPI + React · Open source · MIT</span>
        <MagneticButton href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.faint, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', padding: 0 }}>
          Sign in <ArrowUpRight size={10} />
        </MagneticButton>
      </footer>
    </div>
  )
}
