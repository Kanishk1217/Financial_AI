import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, PieChart, FileText, Sparkles,
  Plus, RefreshCw, Building2, LogOut, Search,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { plaidAPI } from '@/lib/api'
import { toast } from '@/lib/toast'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const go = (path: string) => { setOpen(false); navigate(path) }
  const run = async (label: string, fn: () => Promise<unknown>) => {
    setOpen(false)
    const id = toast.loading(label + '…')
    try { await fn(); toast.dismiss(id); toast.success(label + ' complete') }
    catch (e: any) { toast.dismiss(id); toast.error(label + ' failed', { description: e?.response?.data?.detail }) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '14vh' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}
            style={{ width: 'min(560px, 92vw)', borderRadius: 16, background: 'rgba(15,15,17,0.98)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}
          >
            <Command label="Command palette">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Search size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
                <Command.Input
                  autoFocus
                  placeholder="Search pages, actions…"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontWeight: 500 }}
                />
                <kbd style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>ESC</kbd>
              </div>
              <Command.List style={{ maxHeight: 340, overflowY: 'auto', padding: 6 }}>
                <Command.Empty style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  No results
                </Command.Empty>

                <Command.Group heading="Navigate" style={groupStyle}>
                  <Item icon={LayoutDashboard} label="Dashboard"     hint="g d" onSelect={() => go('/dashboard')} />
                  <Item icon={CreditCard}      label="Accounts"      hint="g a" onSelect={() => go('/accounts')} />
                  <Item icon={ArrowLeftRight}  label="Transactions"  hint="g t" onSelect={() => go('/transactions')} />
                  <Item icon={PieChart}        label="Budget"        hint="g b" onSelect={() => go('/budget')} />
                  <Item icon={FileText}        label="Reports"       hint="g r" onSelect={() => go('/reports')} />
                  <Item icon={Sparkles}        label="Smart AI"      hint="g s" onSelect={() => go('/smart')} />
                </Command.Group>

                <Command.Group heading="Actions" style={groupStyle}>
                  <Item icon={Plus}      label="Add transaction"   onSelect={() => go('/transactions?add=1')} />
                  <Item icon={Building2} label="Connect a bank"    onSelect={() => go('/accounts?connect=1')} />
                  <Item icon={RefreshCw} label="Sync with bank"    onSelect={() => run('Bank sync', () => plaidAPI.sync())} />
                  <Item icon={LogOut}    label="Sign out"          onSelect={() => { setOpen(false); logout(); navigate('/login') }} />
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const groupStyle: React.CSSProperties = {
  // cmdk applies its own classes; we'll use cmdk-group selector indirectly
}

function Item({ icon: Icon, label, hint, onSelect }: { icon: any; label: string; hint?: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 8,
        fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
        cursor: 'pointer',
      }}
    >
      <Icon size={14} style={{ color: 'rgba(255,255,255,0.55)' }} />
      <span style={{ flex: 1 }}>{label}</span>
      {hint && <kbd style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>{hint}</kbd>}
    </Command.Item>
  )
}
