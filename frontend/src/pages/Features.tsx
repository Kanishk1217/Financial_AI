// @ts-nocheck
import { useRef, useEffect } from 'react'
import { motion, useInView } from 'motion/react'
import {
  Bank, ShieldCheck, DownloadSimple, Lock, Certificate, Tag,
} from '@phosphor-icons/react'
import { MarketingShell, PageHero, CtaBand } from '@/components/marketing/MarketingChrome'
import { FEATURES, VISUALS } from '@/components/marketing/featureVisuals'
import { C } from '@/lib/landingTheme'

function FeatureRow({ feature, index, flip }: { feature: any; index: number; flip: boolean }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const Icon = feature.icon
  const Visual = VISUALS[feature.key]

  const text = (
    <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ maxWidth: 440 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.goldFaint, border: `1px solid ${C.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={C.gold} weight="fill" />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.goldSoft, fontFamily: 'var(--font-mono)' }}>{feature.num}</span>
      </div>
      <h2 style={{ fontSize: 'clamp(30px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: C.text, margin: '0 0 18px', fontFamily: 'var(--font-display)' }}>{feature.title}</h2>
      <p style={{ fontSize: 15.5, lineHeight: 1.75, color: C.dim, margin: 0, fontFamily: 'var(--font-ui)' }}>{feature.desc}</p>
    </motion.div>
  )

  const visual = (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: C.surface, border: `1px solid ${C.surfaceBorder}`, borderRadius: 20, padding: 30, boxShadow: '0 4px 32px rgba(0,0,0,0.28)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, marginBottom: 18, fontFamily: 'var(--font-ui)' }}>{feature.title}</div>
      <Visual />
    </motion.div>
  )

  return (
    <section ref={ref} style={{ maxWidth: 1320, margin: '0 auto', padding: '64px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
      {flip ? <>{visual}{text}</> : <>{text}{visual}</>}
    </section>
  )
}

const CAPS = [
  { icon: Bank, title: '12,000+ institutions', body: 'Connect any bank, card, or investment account through Plaid.' },
  { icon: Tag, title: '50+ auto categories', body: 'Every transaction sorted the moment it lands. No rules to write.' },
  { icon: ShieldCheck, title: 'Bank-level security', body: 'Read-only access via Plaid. Credentials never touch our servers.' },
  { icon: Lock, title: 'Self-hosted & private', body: 'Run it on your own Postgres. No telemetry, no third-party analytics.' },
  { icon: DownloadSimple, title: 'One-click CSV export', body: 'Download any month for taxes, accountants, or your own records.' },
  { icon: Certificate, title: 'MIT licensed', body: 'Fully open source. Read the code, fork it, own it forever.' },
]

function Capabilities() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <section ref={ref} style={{ maxWidth: 1320, margin: '0 auto', padding: '96px 80px', borderTop: `1px solid ${C.lineFaint}` }}>
      <h2 style={{ fontSize: 'clamp(30px, 3.6vw, 48px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, color: C.text, margin: '0 0 56px', fontFamily: 'var(--font-display)' }}>
        And everything else<br /><span style={{ color: C.taupe }}>you'd expect.</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: 0, rowGap: 48 }}>
        {CAPS.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div key={c.title} initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '0 40px', borderLeft: i % 3 !== 0 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.goldFaint, border: `1px solid ${C.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={17} color={C.gold} weight="fill" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-ui)' }}>{c.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: C.faint, fontFamily: 'var(--font-ui)' }}>{c.body}</div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* Full-width band that breaks the zigzag rhythm between feature rows */
function MidBand() {
  return (
    <section style={{ borderTop: `1px solid ${C.lineFaint}`, borderBottom: `1px solid ${C.lineFaint}`, padding: '72px 80px', maxWidth: 1320, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { v: '2.1×', l: 'average overspend caught in dining alone' },
          { v: '< 2 min', l: 'to connect your first account' },
          { v: '0', l: 'rows of data sent to third-party analytics' },
        ].map((s, i) => (
          <div key={i} style={{ paddingLeft: i > 0 ? 48 : 0, paddingRight: i < 2 ? 48 : 0, borderRight: i < 2 ? `1px solid ${C.line}` : 'none' }}>
            <div style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', color: C.gold, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 12 }}>{s.v}</div>
            <div style={{ fontSize: 13.5, color: C.faint, lineHeight: 1.6, fontFamily: 'var(--font-ui)', maxWidth: 220 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Features() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Features"
        title="Everything FinanceAI"
        titleDim="does for your money."
        sub="Four core systems working together: detecting anomalies, holding budgets, generating reports, and answering questions in plain English. Here is exactly how each one works."
      />
      <FeatureRow feature={FEATURES[0]} index={0} flip={false} />
      <FeatureRow feature={FEATURES[1]} index={1} flip={true} />
      <MidBand />
      <FeatureRow feature={FEATURES[2]} index={2} flip={false} />
      <FeatureRow feature={FEATURES[3]} index={3} flip={true} />
      <Capabilities />
      <CtaBand />
    </MarketingShell>
  )
}
