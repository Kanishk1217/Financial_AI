import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Sparkles, X } from 'lucide-react'
import { plaidAPI, txAPI, budgetAPI, smartAPI } from '@/lib/api'

type Step = {
  key: string
  label: string
  hint: string
  href: string
  done: boolean
}

const DISMISS_KEY = 'financeai_onboarding_dismissed'

export function OnboardingChecklist() {
  const navigate = useNavigate()
  const [steps, setSteps] = useState<Step[] | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  useEffect(() => {
    if (dismissed) return
    let cancelled = false
    ;(async () => {
      // Probe each prerequisite cheaply
      const [plaid, txs, budgets, goals] = await Promise.allSettled([
        plaidAPI.status(),
        txAPI.list('2020-01-01', '2100-01-01'),
        budgetAPI.status(),
        smartAPI.goals(),
      ])
      if (cancelled) return
      const txList = txs.status === 'fulfilled' ? txs.value.data : []
      const budgetList = budgets.status === 'fulfilled' ? budgets.value.data?.budgets : []
      const goalList = goals.status === 'fulfilled' ? goals.value.data : []
      const next: Step[] = [
        {
          key:  'connect',
          label:'Connect a bank',
          hint: 'Pull real balances and transactions via Plaid sandbox',
          href: '/accounts',
          done: plaid.status === 'fulfilled' && plaid.value.data?.connected,
        },
        {
          key:  'tx',
          label:'Add or sync your first transaction',
          hint: 'Either let Plaid sync them or add one manually',
          href: '/transactions?add=1',
          done: Array.isArray(txList) && txList.length > 0,
        },
        {
          key:  'budget',
          label:'Set your first monthly budget',
          hint: 'Pick a category and a monthly limit',
          href: '/budget',
          done: Array.isArray(budgetList) && budgetList.length > 0,
        },
        {
          key:  'goal',
          label:'Create a savings goal',
          hint: 'Track progress toward something you want',
          href: '/smart',
          done: Array.isArray(goalList) && goalList.length > 0,
        },
      ]
      setSteps(next)
    })()
    return () => { cancelled = true }
  }, [dismissed])

  if (dismissed || !steps) return null
  const total = steps.length
  const completed = steps.filter(s => s.done).length
  const allDone = completed === total
  if (allDone) {
    // Auto-dismiss after a short victory moment
    if (!dismissed) {
      setTimeout(() => {
        localStorage.setItem(DISMISS_KEY, '1')
        setDismissed(true)
      }, 4500)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 22, stiffness: 240 }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 150,
          width: collapsed ? 220 : 340,
          borderRadius: 18,
          background: 'rgba(15,15,17,0.96)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
        <button onClick={() => setCollapsed(c => !c)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', cursor: 'pointer',
            background: 'transparent', border: 'none', color: '#fff',
            borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.06)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={11} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {allDone ? 'All set!' : `Get started · ${completed}/${total}`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); localStorage.setItem(DISMISS_KEY, '1'); setDismissed(true) }}
              style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              title="Dismiss">
              <X size={12} />
            </span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}>
              {/* Progress bar */}
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={false}
                  animate={{ width: `${(completed / total) * 100}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #fff, rgba(140,240,170,0.95))' }}
                />
              </div>
              <div style={{ padding: 8 }}>
                {steps.map(s => (
                  <button
                    key={s.key}
                    onClick={() => { if (!s.done) navigate(s.href) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                      padding: '10px 10px', borderRadius: 10,
                      border: 'none', cursor: s.done ? 'default' : 'pointer',
                      background: 'transparent', color: '#fff', textAlign: 'left',
                      opacity: s.done ? 0.6 : 1,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!s.done) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: s.done ? 'rgba(80,220,120,0.18)' : 'rgba(255,255,255,0.05)',
                      border: s.done ? '1px solid rgba(80,220,120,0.4)' : '1px solid rgba(255,255,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.done && <Check size={11} style={{ color: 'rgba(140,240,170,1)' }} strokeWidth={2.5} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', textDecoration: s.done ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                      {!s.done && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{s.hint}</div>}
                    </div>
                    {!s.done && <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
