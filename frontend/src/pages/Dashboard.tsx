import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import {
  TrendingUp, TrendingDown, Target,
  RefreshCw, ArrowUpRight, ArrowDownRight, Sparkles,
  ChevronRight, Wallet,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { GlowCard } from '@/components/ui/GlowCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Sparkline } from '@/components/ui/Sparkline'
import { OnboardingChecklist } from '@/components/ui/OnboardingChecklist'
import { MonoAmount } from '@/components/ui/MonoAmount'
import { dashAPI } from '@/lib/api'
import { getMonthRange, categoryColor } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

interface Insight {
  category_breakdown: Record<string, number>
  category_deltas?: Record<string, { current: number; previous: number; pct: number | null }>
  top_merchants: { name: string; total: number }[]
  weekly_trend: { week: string; total: number }[]
  total_income: number
  total_expenses: number
  previous_period?: { start: string; end: string; income: number; expenses: number }
  deltas?: { income_pct: number | null; expenses_pct: number | null; net_pct: number | null }
}
interface NetWorth { net_worth: number }

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any } },
}

function DeltaPill({ pct, lowerIsBetter = false }: { pct: number | null | undefined; lowerIsBetter?: boolean }) {
  if (pct == null) return null
  const sign = pct > 0 ? '+' : ''
  const isGood = lowerIsBetter ? pct < 0 : pct > 0
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      title="vs previous period of same length"
      className={`delta-pill ${isGood ? 'up' : 'down'}`}
    >
      {pct > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {sign}{pct}%
    </motion.span>
  )
}

export default function Dashboard() {
  const [insights, setInsights] = useState<Insight | null>(null)
  const [netWorth, setNetWorth] = useState<NetWorth | null>(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const user = useAuthStore(s => s.user)

  const load = () => {
    const { start, end } = getMonthRange()
    return Promise.all([dashAPI.insights(start, end), dashAPI.netWorth()])
      .then(([ins, nw]) => { setInsights(ins.data); setNetWorth(nw.data) })
      .finally(() => { setLoading(false); setRefreshing(false) })
  }
  useEffect(() => { load() }, [])
  const handleRefresh = () => { setRefreshing(true); load() }

  const chartData = insights?.weekly_trend?.length
    ? insights.weekly_trend.map((w, i) => ({ day: `W${i + 1}`, value: Math.round(Math.abs(w.total)) }))
    : Array.from({ length: 7 }, (_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: 0 }))

  const sparkValues = chartData.map(d => d.value)
  const catEntries = insights
    ? Object.entries(insights.category_breakdown).sort((a, b) => b[1] - a[1])
    : []
  const totalSpent = catEntries.reduce((s, [, v]) => s + v, 0) || 1
  const savings = insights ? insights.total_income - insights.total_expenses : 0
  const savingsRate = insights?.total_income ? (savings / insights.total_income) * 100 : 0

  if (loading) return <DashboardSkeleton />

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{
      padding: '32px 40px 80px',
      minHeight: '100vh',
      maxWidth: 1320,
      fontFamily: 'var(--font-ui)',
    }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <Sparkles size={12} style={{ color: 'var(--amber)' }} />
            <span style={{
              fontSize: 11, color: 'var(--ink-muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
            }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 style={{ margin: 0, lineHeight: 1.1 }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 500, color: 'var(--ink-secondary)',
              letterSpacing: '-0.01em',
            }}>
              {greeting},{' '}
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 400, color: 'var(--ink)',
              letterSpacing: '-0.025em',
            }}>
              {firstName}.
            </span>
          </h1>
        </div>

        <button
          onClick={handleRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 10,
            border: '1px solid var(--warm-border-strong)',
            background: 'var(--surface)',
            color: 'var(--ink-secondary)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--parchment-deep)'; e.currentTarget.style.color = 'var(--ink)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--ink-secondary)' }}
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* ── Row 1: Net Worth + Income + Expenses ── */}
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12, marginBottom: 12 }}
      >
        {/* Net Worth — 6 cols */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 6' }}>
          <GlowCard padding={26} radius={20}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--electric-dim)',
                    border: '1px solid rgba(51,130,247,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Wallet size={13} style={{ color: 'var(--electric)' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                    Net Worth
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(32px, 4vw, 48px)',
                  fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1,
                  color: netWorth && netWorth.net_worth < 0 ? 'var(--rose)' : 'var(--ink)',
                }}>
                  {netWorth && netWorth.net_worth < 0 ? '-' : ''}$<AnimatedNumber value={Math.abs(netWorth?.net_worth ?? 0)} decimals={0} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <DeltaPill pct={insights?.deltas?.net_pct} />
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>vs last month</span>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <Sparkline data={sparkValues} width={140} height={52}
                  stroke="rgba(51,130,247,0.8)"
                  fillFrom="rgba(51,130,247,0.14)" fillTo="rgba(51,130,247,0)" />
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Income — 3 cols */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 3' }}>
          <GlowCard padding={20} radius={16}>
            <StatBlock
              icon={TrendingUp}
              iconColor="var(--emerald)"
              iconBg="var(--emerald-dim)"
              iconBorder="rgba(31,157,99,0.2)"
              label="Total Income"
              value={insights?.total_income ?? 0}
              delta={insights?.deltas?.income_pct}
            />
          </GlowCard>
        </motion.div>

        {/* Expenses — 3 cols */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 3' }}>
          <GlowCard padding={20} radius={16}>
            <StatBlock
              icon={TrendingDown}
              iconColor="var(--rose)"
              iconBg="var(--rose-dim)"
              iconBorder="rgba(196,54,42,0.2)"
              label="Total Expenses"
              value={insights?.total_expenses ?? 0}
              delta={insights?.deltas?.expenses_pct}
              lowerIsBetter
            />
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* ── Row 2: Savings Rate + Spending Chart ── */}
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12, marginBottom: 12 }}
      >
        {/* Savings Rate — 3 cols */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 3' }}>
          <GlowCard padding={20} radius={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--amber-dim)', border: '1px solid var(--amber-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Target size={13} style={{ color: 'var(--amber)' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                Savings Rate
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1,
              color: savingsRate >= 20 ? 'var(--emerald)' : savingsRate < 0 ? 'var(--rose)' : 'var(--ink)',
            }}>
              <AnimatedNumber value={savingsRate} decimals={1} suffix="%" />
            </div>
            <div style={{ marginTop: 14, height: 5, borderRadius: 3, background: 'var(--warm-border)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                transition={{ duration: 1.1, ease: 'easeOut', delay: 0.4 }}
                style={{
                  height: '100%',
                  background: savingsRate >= 20 ? 'var(--emerald)' : 'var(--amber)',
                  borderRadius: 3,
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', margin: '8px 0 0' }}>
              {savingsRate >= 20 ? 'On track' : savingsRate >= 0 ? 'Below target' : 'Spending exceeds income'}
            </p>
          </GlowCard>
        </motion.div>

        {/* Spending Trend Chart — 9 cols */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 9' }}>
          <GlowCard padding={22} radius={20}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', margin: '0 0 8px' }}>
                  Spending Trend
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
                    $<AnimatedNumber value={insights?.total_expenses ?? 0} decimals={0} />
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>this month</span>
                  <DeltaPill pct={insights?.deltas?.expenses_pct} lowerIsBetter />
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradWarm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3382F7" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#3382F7" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day"
                  tick={{ fill: 'var(--ink-muted)', fontSize: 10, fontFamily: 'var(--font-ui)' }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'var(--ink-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v}`} width={48} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--warm-border-strong)',
                    borderRadius: 10, fontSize: 12,
                    padding: '8px 12px',
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--ink)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  labelStyle={{ color: 'var(--ink-secondary)', fontSize: 11, marginBottom: 3 }}
                  itemStyle={{ color: 'var(--ink)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Spent'] as [string, string]}
                  cursor={{ stroke: 'var(--warm-border-strong)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone" dataKey="value"
                  stroke="var(--electric)" strokeWidth={2}
                  fill="url(#areaGradWarm)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--electric)', stroke: 'var(--surface)', strokeWidth: 2 }}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* ── Row 3: By Category + Top Merchants ── */}
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12, marginBottom: 12 }}
      >
        {/* By Category — 6 cols */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 6' }}>
          <GlowCard padding={22} radius={18}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', margin: 0 }}>By Category</p>
              <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{catEntries.length} categories</span>
            </div>
            {catEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {catEntries.slice(0, 6).map(([name, value], i) => {
                  const color = categoryColor(name)
                  const pct = (value / totalSpent) * 100
                  return (
                    <motion.div key={name}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.05, duration: 0.38 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{name}</span>
                          <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{pct.toFixed(0)}%</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                          $<AnimatedNumber value={value} decimals={0} />
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: 'var(--parchment-deep)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.18 + i * 0.05 }}
                          style={{ height: '100%', background: color, borderRadius: 3, opacity: 0.75 }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <EmptyState label="No spending data yet" sub="Transactions will appear here" />
            )}
          </GlowCard>
        </motion.div>

        {/* Top Merchants — 6 cols */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 6' }}>
          <GlowCard padding={22} radius={18}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', margin: '0 0 16px' }}>
              Top Merchants
            </p>
            {(insights?.top_merchants?.length ?? 0) > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(insights?.top_merchants ?? []).slice(0, 5).map((m, i) => {
                  const max = insights!.top_merchants[0].total
                  const pct = (m.total / max) * 100
                  return (
                    <motion.div key={m.name}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.06 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: 6,
                            fontSize: 10, fontWeight: 700,
                            background: 'var(--parchment-deep)',
                            border: '1px solid var(--warm-border)',
                            color: 'var(--ink-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{i + 1}</span>
                          <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.name}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                          $<AnimatedNumber value={m.total} decimals={0} />
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--parchment-deep)', overflow: 'hidden', marginLeft: 32 }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.85, delay: 0.22 + i * 0.06 }}
                          style={{ height: '100%', background: 'var(--electric)', borderRadius: 2, opacity: 0.6 }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <EmptyState label="No merchant data" sub="Add transactions to see top merchants" />
            )}
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* ── Row 4: Monthly Summary ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <GlowCard padding={22} radius={18}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', margin: 0 }}>
              Monthly Summary
            </p>
            <a href="/transactions" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600,
              color: 'var(--electric)', textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              View all transactions <ChevronRight size={13} />
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {[
              { label: 'Income',      value: insights?.total_income ?? 0,   color: 'var(--emerald)', sign: '+' },
              { label: 'Expenses',    value: insights?.total_expenses ?? 0, color: 'var(--ink)',     sign: '-' },
              { label: 'Net Savings', value: Math.abs(savings),             color: savings >= 0 ? 'var(--emerald)' : 'var(--rose)', sign: savings >= 0 ? '+' : '-' },
            ].map((row, i) => (
              <motion.div key={row.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                style={{
                  padding: '16px 18px', borderRadius: 12,
                  background: 'var(--parchment)',
                  border: '1px solid var(--warm-border)',
                }}
              >
                <p style={{ fontSize: 11, color: 'var(--ink-muted)', margin: 0, fontWeight: 600, letterSpacing: '0.04em' }}>{row.label}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', margin: '6px 0 0', color: row.color }}>
                  {row.sign}$<AnimatedNumber value={row.value} decimals={0} />
                </p>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      </motion.div>

      <OnboardingChecklist />
    </div>
  )
}

/* ── StatBlock ── */
function StatBlock({
  icon: Icon, iconColor, iconBg, iconBorder,
  label, value, delta, lowerIsBetter = false,
}: {
  icon: any; iconColor: string; iconBg: string; iconBorder: string
  label: string; value: number; delta?: number | null; lowerIsBetter?: boolean
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: iconBg, border: `1px solid ${iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} style={{ color: iconColor }} />
        </div>
        <DeltaPill pct={delta} lowerIsBetter={lowerIsBetter} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1, marginBottom: 6, color: 'var(--ink)' }}>
        $<AnimatedNumber value={value} decimals={0} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink-muted)', margin: 0, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</p>
    </>
  )
}

/* ── Empty state ── */
function EmptyState({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--parchment-deep)', border: '1px solid var(--warm-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TrendingUp size={16} style={{ color: 'var(--ink-muted)' }} />
      </div>
      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{sub}</span>
    </div>
  )
}

/* ── Skeleton ── */
function DashboardSkeleton() {
  return (
    <div style={{ padding: '32px 40px', background: 'var(--parchment)', minHeight: '100vh' }}>
      <div style={{ height: 44, width: 220, borderRadius: 10, background: 'var(--warm-border)', marginBottom: 32 }} className="shimmer-line" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12, marginBottom: 12 }}>
        <div style={{ gridColumn: 'span 6', height: 160, borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--warm-border)' }} className="shimmer-line" />
        <div style={{ gridColumn: 'span 3', height: 160, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--warm-border)' }} className="shimmer-line" />
        <div style={{ gridColumn: 'span 3', height: 160, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--warm-border)' }} className="shimmer-line" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12, marginBottom: 12 }}>
        <div style={{ gridColumn: 'span 3', height: 180, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--warm-border)' }} className="shimmer-line" />
        <div style={{ gridColumn: 'span 9', height: 280, borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--warm-border)' }} className="shimmer-line" />
      </div>
    </div>
  )
}
