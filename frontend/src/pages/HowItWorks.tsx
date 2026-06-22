// @ts-nocheck
import { useRef, useEffect } from 'react'
import { motion, useInView } from 'motion/react'
import {
  LinkSimple, Sparkle, ChartLineUp,
  ShieldCheck, Database, Brain, CheckCircle,
} from '@phosphor-icons/react'
import { MarketingShell, PageHero, CtaBand } from '@/components/marketing/MarketingChrome'
import { ReportsVisual, BudgetVisual } from '@/components/marketing/featureVisuals'
import { C } from '@/lib/landingTheme'

const STEPS = [
  {
    icon: LinkSimple, num: '01', title: 'Connect your accounts',
    body: 'Link any bank, credit card, or investment account through Plaid. Authentication is OAuth and read-only, so FinanceAI can see balances and transactions but can never move money. Your bank credentials never touch our servers.',
    points: ['12,000+ institutions across US, Canada, UK', 'Read-only OAuth via Plaid', 'Setup takes under two minutes'],
  },
  {
    icon: Sparkle, num: '02', title: 'AI sorts everything',
    body: 'The moment a transaction lands, it is classified into one of 50+ categories. There are no rules to configure and no manual tagging. The model learns the shape of your spending and gets sharper the longer you use it.',
    points: ['50+ spending categories applied automatically', 'Learns your personal patterns over time', 'Corrections teach it, once'],
    visual: <BudgetVisual />,
  },
  {
    icon: ChartLineUp, num: '03', title: 'See the full picture',
    body: 'Monthly reports, anomaly alerts, live budget tracking, and a chat you can ask anything. Everything updates as transactions arrive, so the picture you see is always current, never a stale snapshot from last sync.',
    points: ['Auto-generated monthly reports', 'Real-time anomaly + budget alerts', 'Plain-English AI chat over your data'],
    visual: <ReportsVisual />,
  },
]

function Step({ step, last }: { step: any; last: boolean }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const Icon = step.icon
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', columnGap: 32, position: 'relative' }}>
      {/* Rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: 56, height: 56, borderRadius: 16, background: C.goldFaint, border: `1px solid ${C.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <Icon size={24} color={C.gold} weight="fill" />
        </motion.div>
        {!last && <div style={{ width: 1, flex: 1, minHeight: 80, background: `linear-gradient(${C.goldLine}, ${C.lineFaint})`, marginTop: 4 }} />}
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        style={{ paddingBottom: last ? 0 : 80 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.goldSoft, fontFamily: 'var(--font-mono)' }}>{step.num}</span>
        <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, color: C.text, margin: '8px 0 16px', fontFamily: 'var(--font-display)' }}>{step.title}</h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.75, color: C.dim, margin: '0 0 24px', maxWidth: 560, fontFamily: 'var(--font-ui)' }}>{step.body}</p>

        <div style={{ display: 'grid', gridTemplateColumns: step.visual ? '1fr 1fr' : '1fr', gap: 28, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {step.points.map((p: string) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={16} color={C.gold} weight="fill" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: 'rgba(237,233,225,0.7)', fontFamily: 'var(--font-ui)' }}>{p}</span>
              </div>
            ))}
          </div>
          {step.visual && (
            <div style={{ background: C.surface, border: `1px solid ${C.surfaceBorder}`, borderRadius: 18, padding: 24, boxShadow: '0 4px 28px rgba(0,0,0,0.25)' }}>
              {step.visual}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const TECH = [
  { icon: ShieldCheck, title: 'Read-only by design', body: 'Plaid grants balance and transaction scope only. There is no path for the app to initiate a transfer.' },
  { icon: Database, title: 'Your own database', body: 'All data persists in a Postgres instance you control. Self-host it and nothing ever leaves your machine.' },
  { icon: Brain, title: 'Grounded answers', body: 'The AI chat only reasons over your real transactions, so every answer traces back to actual line items.' },
]

function BehindScenes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <section ref={ref} style={{ maxWidth: 1320, margin: '0 auto', padding: '104px 80px', borderTop: `1px solid ${C.lineFaint}` }}>
      <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, color: C.text, margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>
        What happens<br /><span style={{ color: C.taupe }}>behind the scenes.</span>
      </h2>
      <p style={{ fontSize: 15, color: C.faint, maxWidth: 520, margin: '0 0 56px', lineHeight: 1.7, fontFamily: 'var(--font-ui)' }}>
        Three principles the whole system is built around. None of them are optional.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {TECH.map((t, i) => {
          const Icon = t.icon
          return (
            <motion.div key={t.title} initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '0 40px', borderLeft: i > 0 ? `1px solid ${C.line}` : 'none' }}>
              <Icon size={22} color={C.gold} weight="fill" style={{ marginBottom: 18 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 10, fontFamily: 'var(--font-ui)' }}>{t.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.7, color: C.faint, fontFamily: 'var(--font-ui)' }}>{t.body}</div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default function HowItWorks() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <MarketingShell>
      <PageHero
        eyebrow="How it works"
        title="Up in minutes,"
        titleDim="clear forever."
        sub="From a fresh account to a complete picture of your money in three steps. No spreadsheets, no manual tagging, no monthly reconciliation ritual."
      />
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 80px 96px' }}>
        {STEPS.map((s, i) => (
          <Step key={s.num} step={s} last={i === STEPS.length - 1} />
        ))}
      </section>
      <BehindScenes />
      <CtaBand title="Start in two minutes." sub="Connect an account and watch it sort itself. Free and open source." />
    </MarketingShell>
  )
}
