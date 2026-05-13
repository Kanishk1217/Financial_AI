// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2, PieChart, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { budgetAPI } from '@/lib/api'
import { categoryColor } from '@/lib/utils'
import { Dropdown } from '@/components/ui/Dropdown'
import { GlowCard } from '@/components/ui/GlowCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

interface Budget {
  category: string; limit: number; spent: number
  remaining: number; percent_used: number; alert: boolean
}

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Housing', 'Other']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function InputField({ label, type = 'text', value, onChange, placeholder = '', step }: {
  label: string; type?: string; value: string | number; onChange: (v: string) => void; placeholder?: string; step?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label}>
      <input
        type={type} value={value} step={step} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 12,
          background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}`,
          color: '#fff', fontSize: 14, outline: 'none',
          transition: 'border-color 0.2s, background 0.2s', colorScheme: 'dark',
        }}
      />
    </Field>
  )
}

function SetBudgetModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const now = new Date()
  const [form, setForm] = useState({
    category: 'Food', amount: '', month: now.getMonth() + 1, year: now.getFullYear(),
  })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')
  const [focused, setFocused] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    setSubmitting(true)
    try {
      await budgetAPI.set({ category: form.category, amount: parseFloat(form.amount), month: form.month, year: form.year })
      onSaved(); onClose()
      setForm({ category: 'Food', amount: '', month: now.getMonth() + 1, year: now.getFullYear() })
    } catch { setErr('Failed to save budget.') }
    finally { setSubmitting(false) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{ width: '100%', maxWidth: 400, borderRadius: 24, background: 'rgba(7,7,7,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(40px)', padding: '28px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChart size={16} style={{ color: 'rgba(255,255,255,0.55)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Set Budget</h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', margin: '2px 0 0' }}>Monthly spending limit</p>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>✕</button>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Category">
                <Dropdown<string>
                  value={form.category}
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                  onChange={v => setForm(p => ({ ...p, category: v }))}
                />
              </Field>

              <InputField label="Monthly Limit ($)" type="number" step="0.01" value={form.amount} onChange={v => setForm(p => ({ ...p, amount: v }))} placeholder="15000" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Month">
                  <input type="number" min="1" max="12" value={form.month}
                    onChange={e => setForm(p => ({ ...p, month: parseInt(e.target.value) }))}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, outline: 'none' }}
                  />
                </Field>
                <Field label="Year">
                  <input type="number" value={form.year}
                    onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) }))}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, outline: 'none' }}
                  />
                </Field>
              </div>

              {err && <div style={{ padding: '9px 13px', borderRadius: 10, background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.15)', fontSize: 12, color: 'rgba(255,120,120,0.9)' }}>{err}</div>}

              <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: 4, padding: '13px', borderRadius: 14, border: 'none',
                  cursor: submitting ? 'default' : 'pointer',
                  background: submitting ? 'rgba(255,255,255,0.07)' : '#fff',
                  color: submitting ? 'rgba(255,255,255,0.3)' : '#000',
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {submitting ? <><Loader2 size={14} className="animate-spin" />Saving…</> : 'Save Budget'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Budget() {
  const [budgets, setBudgets]   = useState<Budget[]>([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModal]   = useState(false)

  const load = () =>
    budgetAPI.status()
      .then(r => setBudgets(r.data.budgets ?? []))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const totalBudget  = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent   = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget   = budgets.filter(b => b.percent_used >= 100)
  const warnings     = budgets.filter(b => b.percent_used >= 80 && b.percent_used < 100)
  const pctOverall   = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <div style={{ background: '#060606', padding: '36px 36px 48px', position: 'relative', minHeight: '100vh' }}>

      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: 0, right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '-8%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={20} style={{ color: 'rgba(255,255,255,0.55)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>Budget</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '3px 0 0' }}>Monthly spending limits & tracking</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 11, border: 'none', cursor: 'pointer', background: '#fff', color: '#000', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', boxShadow: '0 0 20px rgba(255,255,255,0.12)' }}>
            <Plus size={14} strokeWidth={2.5} />
            Set Budget
          </motion.button>
        </motion.div>

        {/* Summary stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total Budget', value: totalBudget, icon: PieChart },
            { label: 'Total Spent', value: totalSpent, icon: TrendingUp },
            { label: 'Remaining', value: Math.max(totalBudget - totalSpent, 0), icon: CheckCircle2 },
            { label: 'Alerts', value: overBudget.length + warnings.length, icon: AlertTriangle, isCount: true },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              style={{ padding: '18px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={13} style={{ color: 'rgba(255,255,255,0.7)' }} />
                </div>
              </div>
              {s.isCount
                ? <div style={{ fontSize: 26, fontWeight: 800, color: s.value > 0 ? 'rgba(255,200,100,0.9)' : '#fff', letterSpacing: '-0.03em' }}>{s.value}</div>
                : <AnimatedCounter value={s.value} prefix="$" className="text-[26px] font-[800] text-white tracking-[-0.03em]" />
              }
            </motion.div>
          ))}
        </motion.div>

        {/* Overall progress bar */}
        {!loading && budgets.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Overall budget utilisation</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: pctOverall >= 90 ? 'rgba(255,180,100,0.9)' : '#fff' }}>{pctOverall}%</span>
            </div>
            <AnimatedProgressBar value={totalSpent} max={totalBudget} color={pctOverall >= 90 ? 'rgba(255,180,80,0.7)' : 'rgba(255,255,255,0.4)'} showLabel={false} delay={0.3} />
          </motion.div>
        )}

        {/* Budget cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 160, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} className="shimmer-line" />)}
          </div>
        ) : budgets.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <PieChart size={22} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>No budgets set</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 260, lineHeight: 1.6, margin: '0 0 20px' }}>Set monthly limits per category to track your spending</p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setModal(true)}
              style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={13} />Set first budget
            </motion.button>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {budgets.map((b, i) => {
              const isOver = b.percent_used >= 100
              const isWarn = b.percent_used >= 80 && !isOver
              const color  = categoryColor(b.category)
              const pct    = Math.min(b.percent_used, 100)
              const ringSize = 56
              const ringR = 24
              const circ = 2 * Math.PI * ringR
              const dash = (pct / 100) * circ
              const glow = isOver ? 'rgba(255,120,100,0.22)' : isWarn ? 'rgba(255,200,100,0.22)' : `${color}40`
              const barColor = isOver ? 'rgba(255,120,100,1)' : isWarn ? 'rgba(255,200,100,1)' : color

              return (
                <motion.div key={b.category}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <GlowCard padding={22} radius={20} glowColor={glow}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}`, flexShrink: 0 }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{b.category}</span>
                      </div>
                      {isOver
                        ? <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,80,50,0.14)', color: 'rgba(255,160,140,1)', border: '1px solid rgba(255,80,50,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Over</span>
                        : isWarn
                        ? <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,180,50,0.14)', color: 'rgba(255,210,140,1)', border: '1px solid rgba(255,180,50,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Watch</span>
                        : <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: 'rgba(80,220,120,0.12)', color: 'rgba(180,240,200,1)', border: '1px solid rgba(80,220,120,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>On track</span>
                      }
                    </div>

                    {/* Big circular progress + amount layout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                      <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} style={{ flexShrink: 0 }}>
                        <circle cx={ringSize/2} cy={ringSize/2} r={ringR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
                        <motion.circle
                          cx={ringSize/2} cy={ringSize/2} r={ringR}
                          fill="none" stroke={barColor} strokeWidth={4} strokeLinecap="round"
                          transform={`rotate(-90 ${ringSize/2} ${ringSize/2})`}
                          initial={{ strokeDasharray: `0 ${circ}` }}
                          animate={{ strokeDasharray: `${dash} ${circ}` }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
                          style={{ filter: `drop-shadow(0 0 8px ${barColor}88)` }}
                        />
                        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
                          style={{ fontSize: 12, fontWeight: 800, fill: '#fff' }}>
                          {b.percent_used.toFixed(0)}%
                        </text>
                      </svg>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                          $<AnimatedNumber value={b.spent} decimals={0} />
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '4px 0 0', fontWeight: 500 }}>
                          of <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>${b.limit.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                      {isOver
                        ? <span style={{ color: 'rgba(255,180,180,1)', fontWeight: 700 }}>Over by ${Math.abs(b.remaining).toLocaleString()}</span>
                        : <>Remaining <span style={{ color: '#fff', fontWeight: 700 }}>${Math.max(b.remaining, 0).toLocaleString()}</span></>
                      }
                    </div>
                  </GlowCard>
                </motion.div>
              )
            })}
          </div>
        )}

      <SetBudgetModal open={modalOpen} onClose={() => setModal(false)} onSaved={load} />
    </div>
  )
}
