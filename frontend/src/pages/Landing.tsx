import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Brain, TrendingUp, BarChart2, Shield,
  ArrowRight, Sparkles, Check, ArrowUpRight, ChevronDown,
  DollarSign, Target, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { ElegantShape } from '@/components/ui/shape-landing-hero'
import { Spotlight } from '@/components/ui/Spotlight'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { LogoMark } from '@/components/ui/Logo'
import { useLenis } from '@/lib/useLenis'

/* ── feature data ─────────────────────────────────── */
const features = [
  {
    icon: Brain,
    label: 'Intelligence',
    title: 'Anomaly Detection',
    body: 'ML scans every transaction and flags unusual patterns before they become real problems.',
  },
  {
    icon: TrendingUp,
    label: 'Control',
    title: 'Smart Budgets',
    body: 'Per-category limits with real-time tracking and 80% pre-alerts so you never overspend.',
  },
  {
    icon: BarChart2,
    label: 'Insights',
    title: 'Monthly Reports',
    body: 'Income, expenses, and savings rate — summarised beautifully and exportable to CSV.',
  },
  {
    icon: Shield,
    label: 'Privacy',
    title: 'Bank-Level Security',
    body: 'OAuth2 tokens, bcrypt hashing, HTTPS transport. Your data belongs entirely to you.',
  },
]

const steps = [
  { n: '01', title: 'Sign up free', body: 'Create an account in under 30 seconds. No credit card required.' },
  { n: '02', title: 'Add transactions', body: 'Log income and expenses by category, date, and merchant.' },
  { n: '03', title: 'Get AI insights', body: 'Anomaly alerts, recurring patterns, and reports — automated.' },
]

/* ── mini progress visual ─────────────────────────── */
function MiniProgress({ bars }: { bars: { label: string; pct: number }[] }) {
  return (
    <div className="space-y-2.5 w-full">
      {bars.map((b, i) => (
        <div key={b.label}>
          <div className="flex justify-between text-[10px] text-white/20 mb-1">
            <span>{b.label}</span><span>{b.pct}%</span>
          </div>
          <div className="h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }}
              initial={{ width: 0 }} animate={{ width: `${b.pct}%` }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const faqs = [
  { q: 'Is FinanceAI free?', a: 'Yes — completely free and open source. Self-host it or run it locally. No subscription, no trial, no credit card.' },
  { q: 'How is my data stored?', a: 'All data lives in your own PostgreSQL database. Nothing is sent to third-party analytics. You own everything.' },
  { q: 'What banks are supported?', a: 'FinanceAI integrates with Plaid, which connects to 12,000+ financial institutions in the US, Canada, and UK.' },
  { q: 'Can I export my data?', a: 'Yes. Every monthly report can be downloaded as a CSV with one click from the Reports page.' },
  { q: 'How does AI anomaly detection work?', a: 'The backend compares current-week spending by category against your historical weekly averages and flags categories that exceed 2× the norm.' },
]

/* ── Dashboard preview mockup ────────────────────── */
function DashboardMockup() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-60px' })
  const bars = [55, 80, 60, 92, 72, 45, 68]
  const txs = [
    { name: 'Netflix', cat: 'Entertainment', amt: '-$15.99', color: '#a3a3a3' },
    { name: 'Whole Foods', cat: 'Food', amt: '-$84.30', color: '#737373' },
    { name: 'Salary', cat: 'Income', amt: '+$3,200', color: '#d4d4d4' },
    { name: 'Uber', cat: 'Transport', amt: '-$22.40', color: '#a3a3a3' },
  ]
  return (
    <div ref={ref} style={{
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      {/* Fake toolbar */}
      <div style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6 }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
        <div style={{ flex: 1, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.04)', margin: '0 12px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', minHeight: 380 }}>
        {/* Fake sidebar */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Dashboard','Transactions','Budget','Reports','Smart AI'].map((l, i) => (
            <div key={l} style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 12,
              background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)',
            }}>{l}</div>
          ))}
        </div>

        {/* Fake content */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[['Net Worth','$48,230', DollarSign],['Income','$4,800', TrendingUp],['Expenses','$2,940', BarChart2],['Savings Rate','38.7%', Target]].map(([l, v, Icon]: any, i) => (
              <motion.div key={l}
                initial={{ opacity: 0, y: 10 }} animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.06 }}
                style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Icon size={11} color="rgba(255,255,255,0.4)" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{v}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{l}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Fake bar chart */}
            <motion.div
              initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>Weekly Spending</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60 }}>
                {bars.map((h, i) => (
                  <motion.div key={i}
                    initial={{ scaleY: 0 }} animate={visible ? { scaleY: 1 } : {}}
                    transition={{ delay: 0.45 + i * 0.04, duration: 0.45, ease: 'easeOut' }}
                    style={{ flex: 1, borderRadius: 3, transformOrigin: 'bottom', background: i === 4 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)', height: `${h}%` }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {['M','T','W','T','F','S','S'].map(d => (
                  <span key={d} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>{d}</span>
                ))}
              </div>
            </motion.div>

            {/* Fake transactions */}
            <motion.div
              initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Recent Transactions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {txs.map((t, i) => (
                  <motion.div key={t.name}
                    initial={{ opacity: 0, x: -8 }} animate={visible ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.55 + i * 0.06 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>{t.cat}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: t.amt.startsWith('+') ? 'rgba(255,255,255,0.5)' : '#fff' }}>{t.amt}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── FAQ accordion ───────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-40px' })
  return (
    <section ref={ref} style={{ padding: '96px 48px', maxWidth: 760, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }} style={{ marginBottom: 52 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 14 }}>FAQ</span>
        <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>Common questions.</h2>
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {faqs.map((faq, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: open === i ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', cursor: 'pointer', outline: 'none', textAlign: 'left',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{faq.q}</span>
              <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
              </motion.div>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <p style={{ padding: '0 20px 18px', fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ── page ─────────────────────────────────────────── */
export default function Landing() {
  useLenis(true)
  const featRef = useRef(null)
  const featVisible = useInView(featRef, { once: true, margin: '-50px' })
  const stepsRef = useRef(null)
  const stepsVisible = useInView(stepsRef, { once: true, margin: '-50px' })

  return (
    <div style={{ background: '#050505', color: '#fff', fontFamily: 'inherit' }}
      className="min-h-screen overflow-x-hidden">

      {/* ═══════════════════════════════ NAV */}
      <motion.header
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 48px',
          background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark size={30} radius={8} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            FinanceAI
          </span>
        </Link>

        {/* Centre links — desktop */}
        <nav style={{ display: 'flex', gap: 28 }} className="hidden md:flex">
          {[['#features', 'Features'], ['#how', 'How it works']].map(([h, l]) => (
            <a key={h} href={h} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
              {l}
            </a>
          ))}
        </nav>

        {/* Right CTAs — using <Link> not <button> */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{
            fontSize: 13, color: 'rgba(255,255,255,0.72)', textDecoration: 'none',
            padding: '6px 12px', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
            Sign in
          </Link>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 18px', borderRadius: 999,
            background: '#fff', color: '#000',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Get started
          </Link>
        </div>
      </motion.header>

      {/* ═══════════════════════════════ HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 60 }}>
        <Spotlight size={700} color="rgba(255,255,255,0.08)" />
        {/* Floating shapes */}
        <ElegantShape delay={0.2} width={520} height={130} rotate={-14}
          className="top-[12%] -left-[10%] opacity-35" gradient="from-white/[0.06]" />
        <ElegantShape delay={0.45} width={360} height={88} rotate={18}
          className="top-[8%] right-[0%] opacity-25" gradient="from-white/[0.04]" />
        <ElegantShape delay={0.65} width={280} height={68} rotate={-6}
          className="bottom-[20%] -right-[4%] opacity-20" gradient="from-white/[0.05]" />
        <ElegantShape delay={0.85} width={200} height={55} rotate={10}
          className="bottom-[25%] left-[4%] opacity-15" gradient="from-white/[0.04]" />

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
          background: 'linear-gradient(to top, #050505, transparent)', zIndex: 5, pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 820, width: '100%' }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
              borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', fontSize: 11, color: 'rgba(255,255,255,0.7)',
              marginBottom: 28,
            }}>
              <Sparkles size={9} color="rgba(255,255,255,0.4)" />
              AI-Powered · FastAPI · Open Source
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(44px, 7.5vw, 88px)',
              fontWeight: 900, lineHeight: 0.9,
              letterSpacing: '-0.04em', margin: '0 0 24px',
            }}>
            Understand your<br />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>money, finally.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={{
              fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)',
              maxWidth: 500, margin: '0 auto 36px',
            }}>
            An AI finance tracker that categorises spending, detects anomalies, and generates beautiful reports — all automatically.
          </motion.p>

          {/* CTAs — both are <Link> / <a> — zero browser button styling */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <MagneticButton
              href="/login"
              pull={0.35}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '12px 28px', borderRadius: 999,
                background: '#fff', color: '#000',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 50px rgba(255,255,255,0.18)',
              }}
            >
              Start for free <ArrowRight size={13} />
            </MagneticButton>
            <a href="#features" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '12px 20px',
              fontSize: 13, color: 'rgba(255,255,255,0.72)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              See what's inside <ArrowRight size={12} />
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 48, marginTop: 64, paddingTop: 40,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
            {[['50+', 'Smart categories'], ['AI', 'Anomaly detection'], ['100%', 'Data ownership']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)', margin: '0 auto' }} />
        </motion.div>
      </section>

      {/* ═══════════════════════════════ DASHBOARD PREVIEW */}
      <section style={{ padding: '0 48px 96px', maxWidth: 1120, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.55 }}
          style={{ marginBottom: 40, textAlign: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 14 }}>
            Preview
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Your dashboard,<br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>at a glance.</span>
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7, delay: 0.1 }}>
          <DashboardMockup />
        </motion.div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* ═══════════════════════════════ FEATURES */}
      <section id="features" ref={featRef} style={{ padding: '96px 48px', maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={featVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{ marginBottom: 52 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 14,
          }}>Features</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Everything you need<br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>to win with money.</span>
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 22 }} animate={featVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              style={{
                borderRadius: 18, padding: '28px 24px 24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', gap: 20,
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={15} color="rgba(255,255,255,0.5)" />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                  {f.label}
                </span>
              </div>

              {/* Mini visual */}
              <div style={{ height: 44 }}>
                {i === 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: '100%' }}>
                    {[40, 35, 42, 38, 100, 36, 34].map((h, j) => (
                      <motion.div key={j}
                        initial={{ scaleY: 0 }} animate={featVisible ? { scaleY: 1 } : {}}
                        transition={{ delay: 0.5 + j * 0.05, duration: 0.4, ease: 'easeOut' }}
                        style={{
                          flex: 1, borderRadius: 3, transformOrigin: 'bottom',
                          background: j === 4 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)',
                          height: `${h}%`,
                        }} />
                    ))}
                  </div>
                )}
                {i === 1 && (
                  <MiniProgress bars={[{ label: 'Food', pct: 78 }, { label: 'Travel', pct: 45 }, { label: 'Health', pct: 92 }]} />
                )}
                {i === 2 && (
                  <div style={{ display: 'flex', gap: 8, height: '100%', alignItems: 'center' }}>
                    {[['Income', '+$4,200'], ['Expenses', '-$2,800'], ['Saved', '+$1,400']].map(([k, v]) => (
                      <div key={k} style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.02em' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
                {i === 3 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignContent: 'flex-start' }}>
                    {['OAuth2', 'bcrypt', 'HTTPS', 'JWT'].map((t, j) => (
                      <motion.span key={t}
                        initial={{ opacity: 0 }} animate={featVisible ? { opacity: 1 } : {}}
                        transition={{ delay: 0.5 + j * 0.07 }}
                        style={{
                          padding: '2px 7px', borderRadius: 4,
                          fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                          color: 'rgba(255,255,255,0.7)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                        {t}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.62)', margin: 0 }}>{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* ═══════════════════════════════ HOW IT WORKS */}
      <section id="how" ref={stepsRef} style={{ padding: '96px 48px', maxWidth: 1120, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={stepsVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }} style={{ marginBottom: 52 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 14,
          }}>How it works</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Up and running<br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>in 3 steps.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {steps.map((step, i) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, y: 22 }} animate={stepsVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              style={{
                borderRadius: 18, padding: '32px 28px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
              {/* Big background number */}
              <span style={{
                position: 'absolute', top: 12, right: 20,
                fontSize: 72, fontWeight: 900, lineHeight: 1,
                color: 'rgba(255,255,255,0.55)', userSelect: 'none', pointerEvents: 'none',
              }}>
                {step.n}
              </span>

              {/* Check circle */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              }}>
                <Check size={13} color="#000" strokeWidth={3} />
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{step.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.62)', margin: 0 }}>{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* ═══════════════════════════════ FAQ */}
      <FAQ />

      {/* Divider */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* ═══════════════════════════════ FINAL CTA */}
      <section style={{ padding: '0 48px 96px', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          style={{
            borderRadius: 24, padding: '72px 48px', textAlign: 'center',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            position: 'relative', overflow: 'hidden',
          }}>
          {/* Soft glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.05), transparent)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 28px' }}>
              <LogoMark size={56} radius={14} />
            </div>

            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>
              Start tracking<br />smarter today.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', margin: '0 auto 36px', maxWidth: 380, lineHeight: 1.6 }}>
              Free to use. No credit card. Full ownership of your financial data.
            </p>

            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 32px', borderRadius: 999,
              background: '#fff', color: '#000',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}>
              Get started free <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════ FOOTER */}
      <footer style={{
        maxWidth: 1120, margin: '0 auto', padding: '24px 48px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoMark size={22} radius={6} glow={false} animated={false} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>FinanceAI</span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>© 2025 FinanceAI · FastAPI + React</span>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
          Sign in <ArrowUpRight size={9} />
        </Link>
      </footer>
    </div>
  )
}
