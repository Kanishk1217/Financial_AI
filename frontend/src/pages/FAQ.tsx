// @ts-nocheck
import { useRef, useEffect } from 'react'
import { motion, useInView } from 'motion/react'
import { MarketingShell, PageHero, CtaBand } from '@/components/marketing/MarketingChrome'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { C } from '@/lib/landingTheme'

const GROUPS = [
  {
    id: 'pricing', label: 'Pricing & licensing',
    items: [
      { q: 'Is FinanceAI free?', a: 'Completely free and open source. Self-host it or run it locally. There is no subscription, no trial, and no credit card required, ever.' },
      { q: 'What license is it under?', a: 'MIT. You can use it commercially, fork it, modify it, and ship your own version. No strings attached.' },
      { q: 'Will there ever be a paid tier?', a: 'The core stays free and open source. If a hosted convenience option ever exists, it will be optional and never a requirement to use the product.' },
    ],
  },
  {
    id: 'privacy', label: 'Data & privacy',
    items: [
      { q: 'How is my data stored?', a: 'All data lives in your own PostgreSQL database. Nothing is sent to third-party analytics, and there is no telemetry pipeline collecting your activity.' },
      { q: 'Can FinanceAI move my money?', a: 'No. Account access is read-only through Plaid. The app can read balances and transactions but has no ability to initiate a transfer.' },
      { q: 'Do you sell or share my data?', a: 'Never. There is nothing to sell because your data never leaves your own database in the first place.' },
      { q: 'Can I delete everything?', a: 'Yes. It is your database. You can drop it, export it, or disconnect any account at any time.' },
    ],
  },
  {
    id: 'features', label: 'Features & capabilities',
    items: [
      { q: 'What banks are supported?', a: 'FinanceAI integrates with Plaid, which connects to 12,000+ financial institutions across the US, Canada, and UK.' },
      { q: 'How does anomaly detection work?', a: 'The backend compares current-week spending by category against your historical weekly averages and flags any category that exceeds roughly 2x its norm.' },
      { q: 'Can I export my data?', a: 'Yes. Every monthly report can be downloaded as a CSV from the Reports page for taxes, accountants, or your own records.' },
      { q: 'What can the AI chat answer?', a: 'Anything grounded in your real transactions: where you overspent, category trends, subscription totals, savings rate, and more. Every answer traces back to actual line items.' },
    ],
  },
  {
    id: 'technical', label: 'Technical & setup',
    items: [
      { q: 'How do I self-host it?', a: 'Clone the repository, point it at a PostgreSQL instance, add your Plaid API keys, and run it. Full setup instructions are in the README.' },
      { q: 'What is the tech stack?', a: 'A FastAPI backend with a React and Vite frontend. Modern, fast, and straightforward to run locally or deploy.' },
      { q: 'Do I need a Plaid account?', a: 'Yes, a free Plaid developer account to get API keys. Plaid is what securely connects your bank accounts.' },
    ],
  },
]

function ContentsRail() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }
  return (
    <div style={{ position: 'sticky', top: 110, alignSelf: 'start' }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.faint, marginBottom: 18, fontFamily: 'var(--font-ui)' }}>Contents</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {GROUPS.map((g) => (
          <button key={g.id} onClick={() => scrollTo(g.id)}
            style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontSize: 13.5, color: C.dim, fontFamily: 'var(--font-ui)', transition: 'color 0.18s' }}
            onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
            {g.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Group({ group }: { group: any }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <div ref={ref} id={group.id} style={{ marginBottom: 56, scrollMarginTop: 96 }}>
      <motion.h2 initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
        style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: C.text, margin: '0 0 18px', fontFamily: 'var(--font-display)' }}>
        {group.label}
      </motion.h2>
      <Accordion type="single" collapsible>
        {group.items.map((faq: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay: i * 0.06 }}>
            <AccordionItem value={`${group.id}-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  )
}

export default function FAQ() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <MarketingShell>
      <PageHero
        eyebrow="FAQ"
        title="Questions,"
        titleDim="answered in full."
        sub="Everything about pricing, privacy, features, and setup. If something here is not covered, the source is open, so the real answer is always in the code."
      />
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 80px 96px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 64, alignItems: 'start' }}>
        <ContentsRail />
        <div>
          {GROUPS.map((g) => <Group key={g.id} group={g} />)}
        </div>
      </section>
      <CtaBand title="Still curious?" sub="Read the source, or just start using it. Both are free." />
    </MarketingShell>
  )
}
