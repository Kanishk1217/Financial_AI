// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, TrendingUp, TrendingDown, Wallet, Percent, FileText, Loader2 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar'
import { reportAPI } from '@/lib/api'
import { categoryColor } from '@/lib/utils'
import { Dropdown } from '@/components/ui/Dropdown'
import { GlowCard } from '@/components/ui/GlowCard'

interface MonthlyReport {
  month: number; year: number
  total_income: number; total_expenses: number
  savings: number; savings_rate: number
  category_breakdown: Record<string, number>
  top_merchants: { name: string; total: number }[]
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#fff', fontWeight: 700 }}>${Number(payload[0].value).toLocaleString()}</p>
    </div>
  )
}

export default function Reports() {
  const [report, setReport]     = useState<MonthlyReport | null>(null)
  const [loading, setLoading]   = useState(true)
  const [exporting, setExporting] = useState(false)
  const [month, setMonth]       = useState(new Date().getMonth() + 1)
  const [year, setYear]         = useState(new Date().getFullYear())
  const [selectFocus, setSelectFocus] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    reportAPI.monthly(month, year)
      .then(r => setReport(r.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [month, year])

  const handleExport = async () => {
    setExporting(true)
    try {
      const pad = (n: number) => String(n).padStart(2, '0')
      const start = `${year}-${pad(month)}-01`
      const end   = `${year}-${pad(month)}-${new Date(year, month, 0).getDate()}`
      const res   = await reportAPI.exportCSV(start, end)
      const url   = window.URL.createObjectURL(new Blob([res.data]))
      const a     = document.createElement('a')
      a.href = url; a.download = `report-${year}-${pad(month)}.csv`; a.click()
      window.URL.revokeObjectURL(url)
    } finally { setExporting(false) }
  }

  const catData = report ? Object.entries(report.category_breakdown).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value) : []
  const maxCat  = catData[0]?.value ?? 1

  const selectStyle = (key: string) => ({
    padding: '9px 14px', borderRadius: 11, fontSize: 13, color: '#fff', outline: 'none',
    background: selectFocus === key ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${selectFocus === key ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
    colorScheme: 'dark', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
  })

  return (
    <div style={{ background: '#060606', padding: '36px 36px 48px', position: 'relative', minHeight: '100vh' }}>

      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: 0, left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: '-5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} style={{ color: 'rgba(255,255,255,0.55)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>Reports</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '3px 0 0' }}>Monthly financial breakdown</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 130 }}>
              <Dropdown<number>
                value={month}
                onChange={setMonth}
                options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
                size="sm"
                fullWidth={false}
              />
            </div>
            <div style={{ minWidth: 90 }}>
              <Dropdown<number>
                value={year}
                onChange={setYear}
                options={[2024, 2025, 2026].map(y => ({ value: y, label: String(y) }))}
                size="sm"
                fullWidth={false}
              />
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleExport} disabled={exporting || !report}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11,
                border: '1px solid rgba(255,255,255,0.1)', cursor: exporting || !report ? 'not-allowed' : 'pointer',
                background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, fontWeight: 600,
                opacity: !report ? 0.4 : 1,
              }}>
              {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Export CSV
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ height: 100, borderRadius: 18, background: 'rgba(255,255,255,0.03)' }} className="shimmer-line" />)}
            </div>
            <div style={{ height: 260, borderRadius: 20, background: 'rgba(255,255,255,0.03)' }} className="shimmer-line" />
          </div>
        ) : !report || (report.total_income === 0 && report.total_expenses === 0) ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FileText size={22} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>No data for this period</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 260, lineHeight: 1.6 }}>Add transactions to see your monthly report</p>
          </motion.div>
        ) : (
          <>
            {/* Stat cards */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Income', value: report.total_income, icon: TrendingUp, prefix: '$' },
                { label: 'Total Expenses', value: report.total_expenses, icon: TrendingDown, prefix: '$' },
                { label: 'Net Savings', value: report.savings, icon: Wallet, prefix: '$' },
                { label: 'Savings Rate', value: report.savings_rate, icon: Percent, suffix: '%', decimals: 1 },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                  <GlowCard padding={18} radius={18}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
                      <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <s.icon size={13} style={{ color: 'rgba(255,255,255,0.85)' }} />
                      </div>
                    </div>
                    <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals ?? 0}
                      className="text-[24px] font-[800] text-white tracking-[-0.03em]" />
                  </GlowCard>
                </motion.div>
              ))}
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

              {/* Bar chart */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <GlowCard padding={22} radius={20} glowColor="rgba(180,140,255,0.15)">
                <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 18, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Spending by Category</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={catData} barSize={22} barGap={4}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </GlowCard>
              </motion.div>

              {/* Category progress bars */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <GlowCard padding={22} radius={20}>
                  <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Category Breakdown</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {catData.slice(0, 6).map((c, i) => {
                      const color = categoryColor(c.name)
                      const pct = (c.value / maxCat) * 100
                      return (
                        <div key={c.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.name}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${c.value.toLocaleString()}</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 + i * 0.05 }}
                              style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${color}66, ${color})`,
                                boxShadow: `0 0 8px ${color}55`,
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </GlowCard>
              </motion.div>
            </div>

            {/* Top merchants */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <GlowCard padding={22} radius={20}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 18, letterSpacing: '-0.01em' }}>Top Merchants</h2>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Top Merchants</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(report.top_merchants ?? []).slice(0, 8).map((m, i) => {
                  const maxVal = report.top_merchants[0]?.total ?? 1
                  const pct = (m.total / maxVal) * 100
                  return (
                    <motion.div key={m.name}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.04 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800,
                        width: 24, height: 24, borderRadius: 7,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 500, width: 160, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + i * 0.04, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(180,140,255,0.6), rgba(120,200,255,0.9))', borderRadius: 3 }}
                        />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', width: 90, textAlign: 'right', flexShrink: 0 }}>${m.total.toLocaleString()}</span>
                    </motion.div>
                  )
                })}
              </div>
              </GlowCard>
            </motion.div>
          </>
        )}
    </div>
  )
}
