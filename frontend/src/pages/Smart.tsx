// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Target, RefreshCw, Repeat, Brain, Plus, Loader2, Calendar, Zap, Flame } from 'lucide-react'
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar'
import { smartAPI, txAPI } from '@/lib/api'
import { getMonthRange, formatDate, categoryColor } from '@/lib/utils'
import { GlowCard } from '@/components/ui/GlowCard'

interface Goal { id: number; name: string; target_amount: number; current_amount: number; deadline: string; days_left?: number; needed_per_month?: number }
interface Anomaly { category: string; this_week: number; previous_avg: number; ratio: number; date: string }
interface RecurringTx { description: string; category: string; amount: number; frequency: string; count: number; annual_cost: number }

const TABS = [{ label: 'Goals', icon: Target }, { label: 'Anomalies', icon: Zap }, { label: 'Recurring', icon: Repeat }]

/* ─── Input field ─── */
function GField({ label, type = 'text', value, onChange, placeholder = '', required = false, step }: any) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--night-text-dim)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={value} required={required} step={step} placeholder={placeholder}
        onFocus={() => setF(true)} onBlur={() => setF(false)} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: f ? 'var(--parchment)' : 'var(--surface)', border: `1px solid ${f ? 'var(--electric)' : 'rgba(240,237,230,0.10)'}`, color: 'var(--night-text)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s, background 0.2s',  }} />
    </div>
  )
}

/* ─── New Goal modal ─── */
function NewGoalModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '0', deadline: '' })
  const [sub, setSub] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setSub(true)
    try {
      await smartAPI.createGoal({ name: form.name, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount || '0'), deadline: form.deadline })
      onCreated(); onClose()
      setForm({ name: '', target_amount: '', current_amount: '0', deadline: '' })
    } catch { setErr('Failed to create goal.') } finally { setSub(false) }
  }

  if (!open) return null
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(24,21,16,0.55)',  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        style={{ width: '100%', maxWidth: 420, borderRadius: 24, background: 'var(--night-surface)', border: '1px solid rgba(240,237,230,0.10)',  padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--night-text)', letterSpacing: '-0.02em', margin: 0 }}>New Savings Goal</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', marginTop: 3 }}>Track your financial target</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid rgba(240,237,230,0.07)', background: 'var(--night)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--night-text-muted)', fontSize: 14 }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GField label="Goal Name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Emergency Fund" required />
          <GField label="Target Amount ($)" type="number" step="0.01" value={form.target_amount} onChange={v => setForm(p => ({ ...p, target_amount: v }))} placeholder="150000" required />
          <GField label="Already Saved ($)" type="number" step="0.01" value={form.current_amount} onChange={v => setForm(p => ({ ...p, current_amount: v }))} placeholder="0" />
          <GField label="Deadline" type="date" value={form.deadline} onChange={v => setForm(p => ({ ...p, deadline: v }))} required />
          {err && <div style={{ padding: '9px 13px', borderRadius: 10, background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.15)', fontSize: 12, color: 'rgba(255,120,120,0.9)' }}>{err}</div>}
          <motion.button type="submit" disabled={sub} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ marginTop: 4, padding: '13px', borderRadius: 14, border: 'none', cursor: sub ? 'default' : 'pointer', background: sub ? 'rgba(255,255,255,0.07)' : '#fff', color: sub ? 'rgba(255,255,255,0.3)' : '#000', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {sub ? <><Loader2 size={14} className="animate-spin" />Creating…</> : 'Create Goal'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

/* ─── Empty state ─── */
function EmptyState({ icon: Icon, title, sub, onAction, actionLabel }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 54, height: 54, borderRadius: 18, background: 'var(--night)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon size={22} style={{ color: 'var(--night-text-dim)' }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--night-text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--night-text-dim)', maxWidth: 280, lineHeight: 1.6, margin: 0 }}>{sub}</p>
      {onAction && (
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onAction}
          style={{ marginTop: 20, padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(240,237,230,0.10)', cursor: 'pointer', background: 'rgba(240,237,230,0.07)', color: 'var(--night-text-dim)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={13} />{actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

/* ═══════ Main component ═══════ */
export default function Smart() {
  const [goals, setGoals]         = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [modalOpen, setModal]     = useState(false)

  const load = async () => {
    try {
      const { start } = getMonthRange()
      // Anomaly endpoint compares last 7 days vs previous 7. Use today as the
      // reference so future days in the month don't poison the windows.
      const today = new Date().toISOString().split('T')[0]
      const [g, a, r] = await Promise.allSettled([smartAPI.goals(), smartAPI.anomalies(start, today), txAPI.recurring()])
      if (g.status === 'fulfilled') setGoals(g.value.data ?? [])
      if (a.status === 'fulfilled') setAnomalies(a.value.data ?? [])
      if (r.status === 'fulfilled') setRecurring(r.value.data ?? [])
    } catch (e) { console.error('Smart load error:', e) }
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  const counts = [goals.length, anomalies.length, recurring.length]

  return (
    <div style={{ background: 'var(--night)', padding: '36px 36px 48px', position: 'relative', minHeight: '100vh' }}>

      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '-8%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,21,16,0.015) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 15, background: 'var(--night)', border: '1px solid rgba(240,237,230,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} style={{ color: 'var(--night-text-muted)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--night-text)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>Smart AI</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '3px 0 0' }}>Goals · Anomalies · Recurring charges</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => { setLoading(true); load().finally(() => setLoading(false)) }}
            style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid rgba(240,237,230,0.07)', background: 'var(--night)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--night-text-dim)' }}>
            <RefreshCw size={14} />
          </motion.button>
          <AnimatePresence>
            {activeTab === 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'var(--electric)', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', boxShadow: '0 0 20px rgba(255,255,255,0.12)' }}>
                <Plus size={14} strokeWidth={2.5} />New Goal
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tab bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ marginBottom: 32, position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px', borderRadius: 16, background: 'rgba(240,237,230,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(({ label, icon: Icon }, i) => (
            <button key={label} onClick={() => setActiveTab(i)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'transparent', color: activeTab === i ? '#000' : 'rgba(255,255,255,0.38)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', transition: 'color 0.25s', zIndex: 1, userSelect: 'none' }}>
              {activeTab === i && (
                <motion.div layoutId="smart-tab-pill" style={{ position: 'absolute', inset: 0, borderRadius: 12, background: '#fff', zIndex: -1 }} transition={{ type: 'spring', bounce: 0.12, duration: 0.38 }} />
              )}
              <Icon size={13} />
              {label}
              {counts[i] > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, lineHeight: 1.7, background: activeTab === i ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)', color: activeTab === i ? '#000' : 'rgba(255,255,255,0.45)' }}>{counts[i]}</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* GOALS */}
        {activeTab === 0 && (
          <motion.div key="goals" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                {[0,1,2].map(i => <div key={i} style={{ height: 240, borderRadius: 22, background: 'rgba(240,237,230,0.03)', border: '1px solid rgba(240,237,230,0.07)' }} className="shimmer-line" />)}
              </div>
            ) : goals.length === 0 ? (
              <EmptyState icon={Target} title="No goals yet" sub="Create a savings goal to track your financial progress" onAction={() => setModal(true)} actionLabel="Create your first goal" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                {goals.map((goal, i) => {
                  const pct = Math.min(((goal.current_amount ?? 0) / goal.target_amount) * 100, 100)
                  const daysLeft = goal.days_left ?? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
                  const isUrgent = daysLeft > 0 && daysLeft < 60
                  const isOverdue = daysLeft <= 0
                  return (
                    <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <GlowCard padding={22} radius={20} glowColor={isOverdue ? 'rgba(255,140,140,0.20)' : isUrgent ? 'rgba(255,200,140,0.20)' : 'rgba(180,140,255,0.20)'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 13,
                          background: isOverdue ? 'rgba(255,140,140,0.12)' : isUrgent ? 'rgba(255,200,140,0.12)' : 'rgba(180,140,255,0.12)',
                          border: `1px solid ${isOverdue ? 'rgba(255,140,140,0.25)' : isUrgent ? 'rgba(255,200,140,0.25)' : 'rgba(180,140,255,0.25)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Target size={18} style={{
                            color: isOverdue ? 'rgba(255,180,180,1)' : isUrgent ? 'rgba(255,210,160,1)' : 'rgba(200,180,255,1)',
                            filter: 'drop-shadow(0 0 6px currentColor)',
                          }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: isOverdue ? 'rgba(255,80,80,0.1)' : isUrgent ? 'rgba(255,185,50,0.1)' : 'rgba(255,255,255,0.05)', color: isOverdue ? 'rgba(255,110,110,0.9)' : isUrgent ? 'rgba(255,195,70,0.9)' : 'rgba(255,255,255,0.3)', border: `1px solid ${isOverdue ? 'rgba(255,80,80,0.15)' : isUrgent ? 'rgba(255,185,50,0.15)' : 'transparent'}` }}>
                          {isOverdue ? 'Overdue' : `${daysLeft}d left`}
                        </div>
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--night-text)', margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{goal.name}</h3>
                      <div style={{ fontSize: 12, color: 'var(--night-text-dim)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={10} />{formatDate(goal.deadline)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--night-text)', letterSpacing: '-0.03em' }}>${(goal.current_amount ?? 0).toLocaleString()}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>of ${goal.target_amount.toLocaleString()}</span>
                      </div>
                      <AnimatedProgressBar value={goal.current_amount ?? 0} max={goal.target_amount} color="rgba(255,255,255,0.45)" showLabel={false} delay={0.28 + i * 0.07} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                        {[{ label: 'Saved', value: `${pct.toFixed(0)}%` }, { label: 'Need/mo', value: `$${Math.round(goal.needed_per_month ?? 0).toLocaleString()}` }].map(s => (
                          <div key={s.label} style={{ padding: '9px 12px', borderRadius: 11, background: 'rgba(240,237,230,0.03)', border: '1px solid rgba(240,237,230,0.07)' }}>
                            <div style={{ fontSize: 10, color: 'var(--night-text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{s.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--night-text)', letterSpacing: '-0.01em' }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                    </GlowCard>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ANOMALIES */}
        {activeTab === 1 && (
          <motion.div key="anomalies" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {anomalies.length === 0 ? (
              <EmptyState icon={Zap} title="No anomalies detected" sub="All spending looks normal — unusual spikes will be flagged here automatically" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 700 }}>
                {anomalies.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 4 }}
                    style={{ padding: '18px 22px', borderRadius: 18, background: 'rgba(255,90,40,0.04)', border: '1px solid rgba(255,90,40,0.1)', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, flexShrink: 0, background: 'rgba(255,100,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flame size={17} style={{ color: 'rgba(255,140,80,0.9)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--night-text)', marginBottom: 4, letterSpacing: '-0.01em' }}>{a.category} spending spiked</div>
                      <div style={{ fontSize: 12, color: 'var(--night-text-dim)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span>${a.this_week.toLocaleString()} this period</span>
                        <span style={{ color: 'var(--night-text-muted)' }}>·</span>
                        <span>${a.previous_avg.toLocaleString()} avg</span>
                        <span style={{ color: 'var(--night-text-muted)' }}>·</span>
                        <span>{formatDate(a.date)}</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 20, background: 'rgba(255,100,50,0.12)', border: '1px solid rgba(255,100,50,0.2)', fontSize: 12, fontWeight: 800, color: 'rgba(255,155,100,0.95)' }}>{a.ratio}× normal</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* RECURRING */}
        {activeTab === 2 && (
          <motion.div key="recurring" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ height: 140, borderRadius: 18, background: 'rgba(240,237,230,0.03)' }} className="shimmer-line" />)}
              </div>
            ) : recurring.length === 0 ? (
              <EmptyState icon={Repeat} title="No recurring charges" sub="Transactions that repeat 2+ times are detected automatically" />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24, maxWidth: 580 }}>
                  {[
                    { label: 'Monthly Total', value: `$${Math.round(recurring.reduce((s, r) => s + r.amount, 0)).toLocaleString()}` },
                    { label: 'Annual Total', value: `$${Math.round(recurring.reduce((s, r) => s + (r.annual_cost ?? r.amount * 12), 0)).toLocaleString()}` },
                    { label: 'Active Charges', value: String(recurring.length) },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ padding: '16px 18px', borderRadius: 16, background: 'rgba(240,237,230,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: 10, color: 'var(--night-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--night-text)', letterSpacing: '-0.03em' }}>{s.value}</div>
                    </motion.div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {recurring.map((r, i) => (
                    <motion.div key={r.description} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.11)' }}
                      style={{ padding: '18px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s, transform 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: `${categoryColor(r.category)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Repeat size={15} style={{ color: categoryColor(r.category) }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--night-text)', margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</p>
                          <p style={{ fontSize: 11, color: 'var(--night-text-dim)', margin: '2px 0 0' }}>{r.category} · {r.count}× detected</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--night-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 3 }}>Per Month</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--night-text)', letterSpacing: '-0.03em' }}>${r.amount.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: 'var(--night-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 3 }}>Annual</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--night-text-dim)' }}>${Math.round(r.annual_cost ?? r.amount * 12).toLocaleString()}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      <NewGoalModal open={modalOpen} onClose={() => setModal(false)} onCreated={load} />
    </div>
  )
}
