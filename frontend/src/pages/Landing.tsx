// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import {
  ArrowRight, ShieldCheck, ChartLineUp, Sparkle,
  Star, CheckCircle,
} from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { MagneticButton } from '@/components/ui/MagneticButton'
import { TiltCard } from '@/components/ui/TiltCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { MarketingShell } from '@/components/marketing/MarketingChrome'
import { AppPreview, FEATURES, VISUALS } from '@/components/marketing/featureVisuals'
import { C } from '@/lib/landingTheme'

gsap.registerPlugin(ScrollTrigger)

/* Small "explore this in detail" link used under teaser sections */
function MoreLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontSize: 13.5, fontWeight: 600, color: C.gold, textDecoration: 'none',
      fontFamily: 'var(--font-ui)', transition: 'gap 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.gap = '11px')}
      onMouseLeave={e => (e.currentTarget.style.gap = '7px')}>
      {children} <ArrowRight size={14} weight="bold" />
    </Link>
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
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=200%', pin: true, pinSpacing: true, scrub: 1.2, onEnter: () => setInView(true) },
      })
      items.forEach((item, i) => {
        tl.to(item, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', ease: 'power3.out', duration: 0.5 }, i * 0.26)
      })
      tl.to(line, { scaleX: 1, ease: 'none', duration: 0.9 }, 0)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ height: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', position: 'relative', borderTop: `1px solid ${C.lineFaint}` }}>
      <div style={{ marginBottom: 72 }}>
        <h2 style={{ fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95, color: C.text, margin: 0, fontFamily: 'var(--font-display)' }}>
          Built different.<br /><span style={{ color: C.taupe }}>By design.</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
        {stats.map((s, i) => (
          <div key={i} className="scale-item" style={{ paddingRight: i < 2 ? 48 : 0, paddingLeft: i > 0 ? 48 : 0, borderRight: i < 2 ? `1px solid ${C.line}` : 'none' }}>
            <div style={{ fontSize: 'clamp(52px, 6.5vw, 88px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: C.gold, fontFamily: 'var(--font-display)', marginBottom: 14, display: 'flex', alignItems: 'baseline' }}>
              {inView ? <AnimatedNumber value={s.num} suffix={s.suffix} style={{ fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit', color: 'inherit', fontFamily: 'inherit' }} /> : <span>{s.num}{s.suffix}</span>}
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

/* ─────────────────── GSAP Pin 2: Features (cinematic teaser) ─────────────────── */
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
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=300%', pin: true, pinSpacing: true, scrub: 1.2 },
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

  return (
    <section id="features" ref={sectionRef} style={{ height: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${C.lineFaint}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', borderRight: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={f.num} className="feat-label" style={{ padding: '18px 0', borderBottom: i < 3 ? `1px solid ${C.lineFaint}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 16, cursor: 'default' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: C.goldFaint, border: `1px solid ${C.goldLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={C.gold} weight="fill" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.goldSoft, fontFamily: 'var(--font-mono)' }}>{f.num}</span>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-ui)', letterSpacing: '-0.02em' }}>{f.title}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.faint, lineHeight: 1.6, fontFamily: 'var(--font-ui)', paddingLeft: 26 }}>{f.short}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 32 }}>
          <MoreLink to="/features">See all features in detail</MoreLink>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,75,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'grid' }}>
          {FEATURES.map((f, i) => {
            const Visual = VISUALS[f.key]
            return (
              <div key={i} className="feat-visual" style={{ gridArea: '1 / 1', opacity: i === 0 ? 1 : 0, background: C.surface, border: `1px solid ${C.surfaceBorder}`, borderRadius: 18, padding: 28, boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, marginBottom: 16, fontFamily: 'var(--font-ui)' }}>{f.title}</div>
                <Visual />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── How it works (teaser) ─────────────────── */
const STEPS = [
  { icon: ShieldCheck, step: '01', title: 'Connect your accounts', body: 'Link any bank or card via Plaid. Read-only, 12,000+ institutions, under two minutes.' },
  { icon: Sparkle, step: '02', title: 'AI sorts everything', body: '50+ categories applied automatically. No tagging, no rules. It learns your patterns.' },
  { icon: ChartLineUp, step: '03', title: 'See the full picture', body: 'Reports, anomaly alerts, budgets, and plain-English AI chat. All in one place.' },
]

function HowItWorksTeaser() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <section ref={ref} style={{ padding: '128px 80px', borderTop: `1px solid ${C.lineFaint}`, maxWidth: 1320, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ marginBottom: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <h2 style={{ fontSize: 'clamp(36px, 4.4vw, 60px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, color: C.text, margin: 0, fontFamily: 'var(--font-display)' }}>
          Up in minutes,<br /><span style={{ color: C.taupe }}>clear forever.</span>
        </h2>
        <MoreLink to="/how-it-works">How it works in detail</MoreLink>
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
              <div style={{ fontSize: 13.5, color: C.faint, lineHeight: 1.65, fontFamily: 'var(--font-ui)' }}>{s.body}</div>
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
          Real people,<br /><span style={{ color: C.taupe }}>real clarity.</span>
        </h2>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 32 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}>
            <TiltCard intensity={4} glare={false} style={{ background: C.surface, border: `1px solid ${C.surfaceBorder}`, borderRadius: 18, padding: 30, height: '100%', boxShadow: '0 2px 24px rgba(0,0,0,0.22)' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                {Array.from({ length: 5 }).map((_, si) => <Star key={si} size={13} weight="fill" color={C.gold} />)}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(237,233,225,0.72)', fontFamily: 'var(--font-ui)', margin: '0 0 26px' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Avatar style={{ width: 38, height: 38 }}>
                  <AvatarFallback style={{ background: `${t.tone}22`, border: `1px solid ${t.tone}40`, color: t.tone, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>{t.initials}</AvatarFallback>
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
      const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=180%', pin: true, pinSpacing: true, scrub: 1.1 } })
      words.forEach((word, i) => { tl.to(word, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power3.out', duration: 0.35 }, i * 0.2) })
      tl.to(sub, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.84)
      tl.to(cta, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.28 }, 0.96)
    }, sectionRef)
    return () => ctx.revert()
  }, [])
  const words = ['Your', 'money,', 'finally', 'clear.']
  return (
    <section ref={sectionRef} style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px', textAlign: 'center', position: 'relative', borderTop: `1px solid ${C.lineFaint}` }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,75,0.06) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(56px, 8.5vw, 120px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.92, margin: '0 0 36px', fontFamily: 'var(--font-display)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.2em' }}>
          {words.map((w, i) => <span key={i} className="promise-word" style={{ display: 'inline-block', color: i < 2 ? C.text : C.gold }}>{w}</span>)}
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

/* ─────────────────── FAQ teaser ─────────────────── */
const faqsTeaser = [
  { q: 'Is FinanceAI free?', a: 'Completely free and open source. Self-host it or run it locally. No subscription, no trial, no credit card.' },
  { q: 'How is my data stored?', a: 'All data lives in your own PostgreSQL database. Nothing is sent to third-party analytics. You own everything.' },
  { q: 'What banks are supported?', a: 'FinanceAI integrates with Plaid, which connects to 12,000+ financial institutions in the US, Canada, and UK.' },
  { q: 'Can FinanceAI move my money?', a: 'No. Account access is read-only through Plaid. It can read balances and transactions but never initiate a transfer.' },
]

function FAQTeaser() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <section style={{ padding: '128px 80px', maxWidth: 760, margin: '0 auto' }} ref={ref}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
        <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, color: C.text, margin: 0, fontFamily: 'var(--font-display)' }}>Questions.</h2>
        <MoreLink to="/faq">Read the full FAQ</MoreLink>
      </motion.div>
      <Accordion type="single" collapsible>
        {faqsTeaser.map((faq, i) => (
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
    <MarketingShell>
      {/* ════ HERO ════ */}
      <section style={{ minHeight: '100dvh', paddingTop: 60, display: 'grid', gridTemplateColumns: '55% 45%', alignItems: 'center', maxWidth: 1320, margin: '0 auto', padding: '60px 80px 0', gap: 48 }}>
        <div style={{ paddingBottom: 80 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }} style={{ marginBottom: 30 }}>
            <Badge variant="outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 999, border: `1px solid ${C.goldLine}`, background: C.goldFaint, fontSize: 11, color: C.gold, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.02em' }}>
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
            <Link to="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 16px', fontSize: 13, color: C.faint, textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'var(--font-ui)', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>
              See features <ArrowRight size={12} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85, duration: 0.5 }} style={{ display: 'flex', gap: 36, marginTop: 56, paddingTop: 32, borderTop: `1px solid ${C.line}` }}>
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

      <ScalePin />
      <FeaturesPin />
      <HowItWorksTeaser />
      <Testimonials />
      <PromisePin />
      <div style={{ borderTop: `1px solid ${C.lineFaint}` }}>
        <FAQTeaser />
      </div>
    </MarketingShell>
  )
}
