// @ts-nocheck
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Brain, Lightning, ChartLineUp, Database } from '@phosphor-icons/react'
import { C } from '@/lib/landingTheme'

export const FEATURES = [
  {
    num: '01', key: 'anomaly', icon: Lightning, title: 'Anomaly Detection',
    short: 'Unusual spikes flagged instantly, before they become problems.',
    desc: 'Every transaction is compared against your historical patterns by category. When something deviates more than 2x from your norm, it surfaces immediately with the context of why it was flagged.',
  },
  {
    num: '02', key: 'budget', icon: ChartLineUp, title: 'Smart Budgets',
    short: 'A 20% warning before you overspend, not a surprise at month end.',
    desc: 'Set category limits once. Live tracking shows exactly where you stand, and pre-alerts fire at 80% so you can adjust while it still matters, not after the month closes.',
  },
  {
    num: '03', key: 'reports', icon: Database, title: 'Monthly Reports',
    short: 'Beautiful, exportable reports generated automatically.',
    desc: 'Income, fixed costs, variable spend, subscriptions, and savings rate, composed into a clean monthly view. Export any month to CSV in one click for taxes or your own records.',
  },
  {
    num: '04', key: 'ai', icon: Brain, title: 'AI Financial Chat',
    short: 'Ask questions about your money in plain English.',
    desc: '"Where did I overspend last month?" returns a real, data-backed answer grounded in your actual transactions, with the specific charges that drove the number.',
  },
]

/* ─────────────────── App preview (hero) ─────────────────── */
export function AppPreview() {
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
      <motion.div style={{
        rotateX: rx, rotateY: ry,
        borderRadius: 18, overflow: 'hidden',
        border: `1px solid ${C.surfaceBorder}`,
        background: 'rgba(14,13,11,0.96)',
        boxShadow: `0 0 0 1px rgba(237,233,225,0.03), 0 4px 8px rgba(0,0,0,0.45), 0 24px 64px rgba(0,0,0,0.55), 0 56px 120px rgba(0,0,0,0.35), inset 0 1px 0 rgba(237,233,225,0.05)`,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '144px 1fr' }}>
          <div style={{ borderRight: `1px solid ${C.lineFaint}`, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(237,233,225,0.012)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16, padding: '0 2px' }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: 1.5, background: 'rgba(26,20,7,0.9)' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(237,233,225,0.7)', fontFamily: 'var(--font-ui)', letterSpacing: '-0.01em' }}>FinanceAI</span>
            </div>
            {[
              { label: 'Dashboard', active: true }, { label: 'Transactions', active: false },
              { label: 'Budget', active: false }, { label: 'Reports', active: false }, { label: 'Smart AI', active: false },
            ].map(({ label, active }) => (
              <div key={label} style={{ padding: '5px 8px', borderRadius: 5, fontSize: 9.5, background: active ? C.goldFaint : 'transparent', borderLeft: active ? `2px solid ${C.gold}` : '2px solid transparent', color: active ? C.gold : 'rgba(237,233,225,0.24)', fontWeight: active ? 600 : 400, fontFamily: 'var(--font-ui)' }}>{label}</div>
            ))}
          </div>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 7.5, color: 'rgba(237,233,225,0.32)', marginBottom: 2, fontFamily: 'var(--font-ui)' }}>Net worth</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: C.text, letterSpacing: '-0.04em', fontFamily: 'var(--font-mono)' }}>$48,231.70</div>
              <span style={{ display: 'inline-block', fontSize: 8.5, fontFamily: 'var(--font-mono)', color: C.pos, background: 'rgba(138,154,90,0.12)', border: '1px solid rgba(138,154,90,0.22)', borderRadius: 4, padding: '1px 6px', marginTop: 4 }}>+$1,402 this month</span>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.lineFaint}`, borderRadius: 9, padding: '9px 11px' }}>
              <div style={{ fontSize: 7.5, color: 'rgba(237,233,225,0.38)', marginBottom: 7, fontFamily: 'var(--font-ui)' }}>Weekly spending</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: i === 4 ? C.gold : 'rgba(237,233,225,0.07)', height: `${h}%` }} />
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
                  <span style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', color: t.up ? C.pos : 'rgba(237,233,225,0.5)' }}>{t.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────────────── Feature visuals ─────────────────── */
export function AnomalyVisual() {
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

export function BudgetVisual() {
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

export function ReportsVisual() {
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

export function AiVisual() {
  const msgs = [
    { role: 'user', text: 'Where did I overspend in April?' },
    { role: 'ai', text: 'Dining out was 2.1x your March average. $340 vs your $162 norm. Three restaurant visits on Apr 12-14 account for $180 of the overage.' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {msgs.map((m, i) => (
        <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: m.role === 'user' ? C.goldFaint : 'rgba(237,233,225,0.04)', border: `1px solid ${m.role === 'user' ? C.goldLine : C.lineFaint}`, fontSize: 12, lineHeight: 1.6, color: m.role === 'user' ? 'rgba(237,233,225,0.78)' : C.dim, fontFamily: 'var(--font-ui)' }}>
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

export const VISUALS = {
  anomaly: AnomalyVisual,
  budget: BudgetVisual,
  reports: ReportsVisual,
  ai: AiVisual,
}
