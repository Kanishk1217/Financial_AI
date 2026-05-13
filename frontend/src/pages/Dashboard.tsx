import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Target,
  RefreshCw, ArrowUpRight, ArrowDownRight, Sparkles,
  ChevronRight, Wallet,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { GradientText } from '@/components/ui/GradientText'
import { GlowCard } from '@/components/ui/GlowCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Sparkline } from '@/components/ui/Sparkline'
import { OnboardingChecklist } from '@/components/ui/OnboardingChecklist'
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
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

function DeltaPill({ pct, lowerIsBetter = false }: { pct: number | null | undefined; lowerIsBetter?: boolean }) {
  if (pct == null) return null
  const sign = pct > 0 ? '+' : ''
  const isGood = lowerIsBetter ? pct < 0 : pct > 0
  const up = pct > 0
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      title="vs previous period of same length"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 11, fontWeight: 700,
        padding: '3px 8px', borderRadius: 6,
        background: isGood ? 'rgba(80,220,120,0.12)' : 'rgba(255,80,80,0.12)',
        color:      isGood ? 'rgba(140,240,170,1)'  : 'rgba(255,140,140,1)',
        border: `1px solid ${isGood ? 'rgba(80,220,120,0.25)' : 'rgba(255,80,80,0.25)'}`,
      }}>
      {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
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

  // Build weekly chart data
  const chartData = (insights?.weekly_trend?.length
    ? insights.weekly_trend.map((w, i) => ({ day: `W${i + 1}`, value: Math.round(Math.abs(w.total)) }))
    : Array.from({ length: 7 }, (_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: 0 }))
  )
  const sparkValues = chartData.map(d => d.value)

  const catEntries = insights
    ? Object.entries(insights.category_breakdown).sort((a, b) => b[1] - a[1])
    : []
  const totalSpent = catEntries.reduce((s, [, v]) => s + v, 0) || 1

  const savings = insights ? insights.total_income - insights.total_expenses : 0
  const savingsRate = insights?.total_income ? (savings / insights.total_income) * 100 : 0

  if (loading) return <DashboardSkeleton />

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding: '32px 40px 80px', minHeight: '100vh', maxWidth: 1320, position: 'relative' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={13} style={{ color: 'rgba(200,180,255,0.7)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
            <GradientText variant="subtle">{greeting},</GradientText>{' '}
            <GradientText variant="vivid">{firstName}.</GradientText>
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 11,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </motion.button>
      </motion.div>

      {/* ── Bento Row 1: Hero + 3 stats ────────────────── */}
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginBottom: 14 }}>

        {/* HERO: Net Worth (spans 6 cols) */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 6' }}>
          <GlowCard padding={28} radius={22} glowColor="rgba(180,140,255,0.20)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, rgba(180,140,255,0.18), rgba(120,180,255,0.10))', border: '1px solid rgba(180,140,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={13} style={{ color: 'rgba(200,180,255,0.95)' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
                    Net Worth
                  </span>
                </div>
                <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1, color: netWorth && netWorth.net_worth < 0 ? 'rgba(255,180,180,1)' : '#fff' }}>
                  {netWorth && netWorth.net_worth < 0 ? '-' : ''}$<AnimatedNumber value={Math.abs(netWorth?.net_worth ?? 0)} decimals={0} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                  <DeltaPill pct={insights?.deltas?.net_pct} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>vs last month</span>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Sparkline data={sparkValues} width={160} height={56}
                  stroke="rgba(200,180,255,0.85)"
                  fillFrom="rgba(180,140,255,0.18)" fillTo="rgba(180,140,255,0)" />
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Total Income (3 cols) */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 3' }}>
          <GlowCard padding={20} radius={18} glowColor="rgba(120,230,160,0.18)">
            <StatBlock
              icon={TrendingUp}
              iconColor="rgba(140,240,170,1)"
              iconBg="rgba(80,220,120,0.12)"
              iconBorder="rgba(80,220,120,0.25)"
              label="Total Income"
              value={insights?.total_income ?? 0}
              decimals={0}
              prefix="$"
              delta={insights?.deltas?.income_pct}
            />
          </GlowCard>
        </motion.div>

        {/* Total Expenses (3 cols) */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 3' }}>
          <GlowCard padding={20} radius={18} glowColor="rgba(255,180,180,0.16)">
            <StatBlock
              icon={TrendingDown}
              iconColor="rgba(255,200,200,1)"
              iconBg="rgba(255,120,120,0.10)"
              iconBorder="rgba(255,120,120,0.22)"
              label="Total Expenses"
              value={insights?.total_expenses ?? 0}
              decimals={0}
              prefix="$"
              delta={insights?.deltas?.expenses_pct}
              lowerIsBetter
            />
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* ── Bento Row 2: Savings + Chart ───────────────── */}
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginBottom: 14 }}>

        {/* Savings Rate (3 cols) */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 3' }}>
          <GlowCard padding={20} radius={18} glowColor="rgba(255,220,140,0.16)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,220,140,0.10)', border: '1px solid rgba(255,220,140,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={13} style={{ color: 'rgba(255,220,140,0.95)' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
                Savings Rate
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1, color: savingsRate >= 20 ? 'rgba(180,240,200,1)' : savingsRate < 0 ? 'rgba(255,180,180,1)' : '#fff' }}>
              <AnimatedNumber value={savingsRate} decimals={1} suffix="%" />
            </div>
            {/* Mini horizontal gauge */}
            <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                style={{
                  height: '100%',
                  background: savingsRate >= 20
                    ? 'linear-gradient(90deg, rgba(140,240,170,0.7), rgba(140,240,170,1))'
                    : 'linear-gradient(90deg, rgba(255,200,140,0.7), rgba(255,200,140,1))',
                  borderRadius: 3,
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '10px 0 0' }}>
              {savingsRate >= 20 ? 'On track 🎯' : savingsRate >= 0 ? 'Below target' : 'Spending exceeds income'}
            </p>
          </GlowCard>
        </motion.div>

        {/* Spending Trend Chart (9 cols) */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 9' }}>
          <GlowCard padding={24} radius={20} glowColor="rgba(120,180,255,0.16)">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 10px' }}>
                  Spending Trend
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>
                    $<AnimatedNumber value={insights?.total_expenses ?? 0} decimals={0} />
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>this month</span>
                  <DeltaPill pct={insights?.deltas?.expenses_pct} lowerIsBetter />
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#a78bfa" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#7baaff" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#7baaff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#7dd3fc" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={50} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,17,0.96)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, color: '#fff', fontSize: 12, backdropFilter: 'blur(12px)', padding: '8px 12px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginBottom: 4 }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Spent'] as [string, string]}
                  cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone" dataKey="value"
                  stroke="url(#strokeGrad)" strokeWidth={2.5}
                  fill="url(#areaGrad2)"
                  filter="url(#glow)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: 'rgba(180,140,255,0.6)', strokeWidth: 3 }}
                  animationDuration={1400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* ── Bento Row 3: By Category + Top Merchants ────── */}
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginBottom: 14 }}>

        {/* By Category */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 6' }}>
          <GlowCard padding={24} radius={20}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: 0 }}>By Category</p>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{catEntries.length} categories</span>
            </div>
            {catEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {catEntries.slice(0, 6).map(([name, value], i) => {
                  const color = categoryColor(name)
                  const pct = (value / totalSpent) * 100
                  return (
                    <motion.div key={name}
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{name}</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{pct.toFixed(0)}%</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                          $<AnimatedNumber value={value} decimals={0} />
                        </span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + i * 0.06 }}
                          style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${color}66, ${color})`,
                            boxShadow: `0 0 8px ${color}55`,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <EmptyState icon="📊" label="No spending data yet" sub="Transactions will appear here" />
            )}
          </GlowCard>
        </motion.div>

        {/* Top Merchants */}
        <motion.div variants={fadeUp} style={{ gridColumn: 'span 6' }}>
          <GlowCard padding={24} radius={20}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 18px' }}>Top Merchants</p>
            {(insights?.top_merchants?.length ?? 0) > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(insights?.top_merchants ?? []).slice(0, 5).map((m, i) => {
                  const max = insights!.top_merchants[0].total
                  const pct = (m.total / max) * 100
                  return (
                    <motion.div key={m.name}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.07 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: 7, fontSize: 11, fontWeight: 800,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{i + 1}</span>
                          <span style={{ fontSize: 13, color: '#fff', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.name}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                          $<AnimatedNumber value={m.total} decimals={0} />
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', marginLeft: 35 }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, delay: 0.25 + i * 0.07 }}
                          style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, rgba(180,140,255,0.6), rgba(120,180,255,0.85))',
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <EmptyState icon="🏪" label="No merchant data" sub="Add transactions to see top merchants" />
            )}
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* ── Bento Row 4: Monthly Summary (full width) ──── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <GlowCard padding={24} radius={20}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Monthly Summary</p>
            <motion.a href="/transactions"
              whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 600,
                color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
              }}>
              View all transactions <ChevronRight size={13} />
            </motion.a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Income',      value: insights?.total_income ?? 0,   tone: 'success' as const, sign: '+' },
              { label: 'Expenses',    value: insights?.total_expenses ?? 0, tone: 'subtle'  as const, sign: '-' },
              { label: 'Net Savings', value: Math.abs(savings),             tone: savings >= 0 ? 'success' as const : 'danger' as const, sign: savings >= 0 ? '+' : '-' },
            ].map((row, i) => (
              <motion.div key={row.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                style={{
                  padding: '16px 18px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, fontWeight: 600, letterSpacing: '0.04em' }}>{row.label}</p>
                <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', margin: '6px 0 0', color: row.tone === 'success' ? 'rgba(180,240,200,1)' : row.tone === 'danger' ? 'rgba(255,180,180,1)' : '#fff' }}>
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

/* ────────────────────────────────────────────────── */
function StatBlock({
  icon: Icon, iconColor, iconBg, iconBorder,
  label, value, decimals = 0, prefix = '', suffix = '',
  delta, lowerIsBetter = false,
}: {
  icon: any
  iconColor: string
  iconBg: string
  iconBorder: string
  label: string
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  delta?: number | null
  lowerIsBetter?: boolean
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: iconBg, border: `1px solid ${iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} style={{ color: iconColor }} />
        </div>
        <DeltaPill pct={delta} lowerIsBetter={lowerIsBetter} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1, marginBottom: 6, color: '#fff' }}>
        {prefix}<AnimatedNumber value={value} decimals={decimals} />{suffix}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, fontWeight: 600, letterSpacing: '0.03em' }}>{label}</p>
    </>
  )
}

/* ── Empty state ── */
function EmptyState({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{sub}</span>
    </div>
  )
}

/* ── Skeleton ── */
function DashboardSkeleton() {
  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ height: 52, width: 240, borderRadius: 12, background: 'rgba(255,255,255,0.04)', marginBottom: 36 }} className="shimmer-line" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginBottom: 14 }}>
        <div style={{ gridColumn: 'span 6', height: 180, borderRadius: 22, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} className="shimmer-line" />
        <div style={{ gridColumn: 'span 3', height: 180, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} className="shimmer-line" />
        <div style={{ gridColumn: 'span 3', height: 180, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} className="shimmer-line" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginBottom: 14 }}>
        <div style={{ gridColumn: 'span 3', height: 190, borderRadius: 18, background: 'rgba(255,255,255,0.03)' }} className="shimmer-line" />
        <div style={{ gridColumn: 'span 9', height: 280, borderRadius: 20, background: 'rgba(255,255,255,0.03)' }} className="shimmer-line" />
      </div>
    </div>
  )
}
