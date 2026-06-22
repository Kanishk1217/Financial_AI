import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  X, User, Lock, Database, AlertTriangle, Loader2, Check, Eye, EyeOff,
  Download, Building2,
} from 'lucide-react'
import { userAPI, plaidAPI, reportAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

type Section = 'profile' | 'security' | 'data' | 'danger'

type Me = {
  id: number
  name: string | null
  email: string
  stats: { transactions: number; banks: number }
}

export function AccountSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [section, setSection] = useState<Section>('profile')
  const [me, setMe] = useState<Me | null>(null)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setSection('profile')
    userAPI.me().then(r => setMe(r.data)).catch(() => setMe(null))
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          />
          {/* Centering wrapper — uses flex so the motion child can scale/translate freely */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 310,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, pointerEvents: 'none',
          }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              pointerEvents: 'auto',
              flex: '0 0 auto',
              width: 840,
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: '88vh',
              borderRadius: 20, overflow: 'hidden',
              background: '#0d0d10',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
              display: 'grid', gridTemplateColumns: '220px 1fr',
            }}>
            {/* ── Sidebar nav ── */}
            <div style={{
              borderRight: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.015)',
              padding: '22px 12px',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <div style={{ padding: '0 8px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Settings</p>
              </div>
              <NavBtn icon={User}     label="Profile"  active={section === 'profile'}  onClick={() => setSection('profile')} />
              <NavBtn icon={Lock}     label="Security" active={section === 'security'} onClick={() => setSection('security')} />
              <NavBtn icon={Database} label="Data"     active={section === 'data'}     onClick={() => setSection('data')} />
              <div style={{ flex: 1 }} />
              <NavBtn icon={AlertTriangle} label="Danger zone" active={section === 'danger'} onClick={() => setSection('danger')} danger />
            </div>

            {/* ── Body ── */}
            <div style={{ position: 'relative', maxHeight: '88vh', overflowY: 'auto' }}>
              <button onClick={onClose} title="Close" style={{
                position: 'absolute', top: 16, right: 16, zIndex: 5,
                width: 32, height: 32, borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={14} />
              </button>
              <div style={{ padding: '32px 36px' }}>
                {section === 'profile'  && <ProfileSection me={me} onUpdated={(name) => setMe(m => m && { ...m, name })} />}
                {section === 'security' && <SecuritySection />}
                {section === 'data'     && <DataSection me={me} onChanged={() => userAPI.me().then(r => setMe(r.data))} />}
                {section === 'danger'   && <DangerSection onDeleted={() => { logout(); navigate('/login'); onClose() }} />}
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ── Section nav button ──────────────────────────────────── */
function NavBtn({ icon: Icon, label, active, onClick, danger }: { icon: any; label: string; active: boolean; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 11px', borderRadius: 9,
      border: 'none', cursor: 'pointer',
      background: active ? (danger ? 'rgba(255,90,90,0.10)' : 'rgba(255,255,255,0.07)') : 'transparent',
      color: active ? (danger ? 'rgba(255,160,160,1)' : '#fff') : (danger ? 'rgba(255,180,180,0.7)' : 'rgba(255,255,255,0.65)'),
      fontSize: 12.5, fontWeight: active ? 700 : 500, textAlign: 'left',
      transition: 'background 0.15s, color 0.15s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <Icon size={14} style={{ flexShrink: 0 }} />{label}
    </button>
  )
}

/* ── Header ────────────────────────────────────────────── */
function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>{title}</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '4px 0 0' }}>{sub}</p>
    </div>
  )
}

/* ── Profile ──────────────────────────────────────────── */
function ProfileSection({ me, onUpdated }: { me: Me | null; onUpdated: (name: string) => void }) {
  const [name, setName] = useState(me?.name || '')
  const [saving, setSaving] = useState(false)
  useEffect(() => { setName(me?.name || '') }, [me?.name])

  const dirty = me ? (name !== (me.name || '')) : false

  const save = async () => {
    setSaving(true)
    try {
      await userAPI.updateProfile({ name })
      onUpdated(name)
      toast.success('Profile updated')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const initials = (name || me?.email || '?')[0].toUpperCase()
  return (
    <div>
      <SectionHeader title="Profile" sub="How you appear in the app" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(180,140,255,0.45), rgba(120,200,255,0.45))',
          border: '1px solid rgba(255,255,255,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color: '#fff',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 30px rgba(180,140,255,0.25)',
        }}>{initials}</div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>{me?.name || me?.email?.split('@')[0] || '—'}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '3px 0 0' }}>{me?.email}</p>
          {me?.stats && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0' }}>
              {me.stats.transactions.toLocaleString()} transactions · {me.stats.banks} bank{me.stats.banks === 1 ? '' : 's'} connected
            </p>
          )}
        </div>
      </div>

      <Field label="Display name" value={name} onChange={setName} placeholder="Your name" />

      <div style={{ marginTop: 12 }}>
        <Field label="Email" value={me?.email || ''} onChange={() => {}} disabled hint="Email address can't be changed yet" />
      </div>

      <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
        <button onClick={save} disabled={!dirty || saving} style={{
          padding: '10px 18px', borderRadius: 11, border: 'none', cursor: dirty && !saving ? 'pointer' : 'default',
          background: dirty ? '#fff' : 'rgba(255,255,255,0.05)', color: dirty ? '#000' : 'rgba(255,255,255,0.4)',
          fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Save changes
        </button>
      </div>
    </div>
  )
}

/* ── Security ─────────────────────────────────────────── */
function SecuritySection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (next.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (next !== confirm) { toast.error('Passwords don\'t match'); return }
    setSaving(true)
    try {
      await userAPI.changePassword({ current_password: current, new_password: next })
      setCurrent(''); setNext(''); setConfirm('')
      toast.success('Password changed')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to change password')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <SectionHeader title="Security" sub="Change your password and review session" />
      <PasswordField label="Current password"     value={current} onChange={setCurrent} />
      <PasswordField label="New password"         value={next}    onChange={setNext}    hint="At least 6 characters" />
      <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} />
      <div style={{ marginTop: 22 }}>
        <button onClick={submit} disabled={!current || !next || saving}
          style={{
            padding: '10px 18px', borderRadius: 11, border: 'none', cursor: current && next && !saving ? 'pointer' : 'default',
            background: current && next ? '#fff' : 'rgba(255,255,255,0.05)',
            color:      current && next ? '#000' : 'rgba(255,255,255,0.4)',
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
          Update password
        </button>
      </div>
    </div>
  )
}

/* ── Password field with inline show/hide toggle ───────── */
function PasswordField({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string
}) {
  const [f, setF] = useState(false)
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          style={{
            width: '100%', padding: '11px 44px 11px 14px', borderRadius: 11,
            background: f ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${f ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
            color: '#fff', fontSize: 14, outline: 'none', colorScheme: 'dark',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          title={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28, borderRadius: 7,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent' }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {hint && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', margin: '5px 0 0' }}>{hint}</p>}
    </div>
  )
}

/* ── Data ─────────────────────────────────────────────── */
function DataSection({ me, onChanged }: { me: Me | null; onChanged: () => void }) {
  const [exporting, setExporting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const exportCSV = async () => {
    setExporting(true)
    try {
      const res = await reportAPI.exportCSV('2000-01-01', '2100-01-01')
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url; a.download = `financeai-transactions-${new Date().toISOString().slice(0,10)}.csv`
      a.click(); URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const disconnectAll = async () => {
    if (!window.confirm('Disconnect all banks? This removes Plaid access but keeps your transaction history.')) return
    setDisconnecting(true)
    try {
      await plaidAPI.disconnect()
      toast.success('All banks disconnected')
      onChanged()
    } catch { toast.error('Could not disconnect') }
    finally { setDisconnecting(false) }
  }

  return (
    <div>
      <SectionHeader title="Data & connections" sub="Export your data or manage bank links" />

      <Row title="Export transactions" sub={`Download all ${me?.stats?.transactions ?? 0} transactions as CSV`}
        action={<button onClick={exportCSV} disabled={exporting} style={btnGhost(exporting)}>
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Export CSV
        </button>} />

      <Row title="Connected banks" sub={`${me?.stats?.banks ?? 0} bank${me?.stats?.banks === 1 ? '' : 's'} linked via Plaid`}
        action={<button onClick={disconnectAll} disabled={disconnecting || !me?.stats?.banks} style={btnGhost(disconnecting || !me?.stats?.banks)}>
          {disconnecting ? <Loader2 size={13} className="animate-spin" /> : <Building2 size={13} />} Disconnect all
        </button>} />
    </div>
  )
}

/* ── Danger ───────────────────────────────────────────── */
function DangerSection({ onDeleted }: { onDeleted: () => void }) {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const ready = confirmText.trim().toLowerCase() === 'delete'

  const doDelete = async () => {
    if (!ready) return
    setDeleting(true)
    try {
      await userAPI.deleteAccount()
      toast.success('Account deleted')
      onDeleted()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Delete failed')
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <SectionHeader title="Danger zone" sub="Irreversible actions" />
      <div style={{
        padding: 20, borderRadius: 14,
        background: 'rgba(255,90,90,0.05)',
        border: '1px solid rgba(255,90,90,0.18)',
      }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,170,170,1)', margin: '0 0 6px' }}>Delete account</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '0 0 14px', lineHeight: 1.55 }}>
          Permanently delete your account, all transactions, budgets, goals, and bank links.
          This cannot be undone.
        </p>
        <Field label='Type "delete" to confirm' value={confirmText} onChange={setConfirmText} />
        <button onClick={doDelete} disabled={!ready || deleting}
          style={{
            marginTop: 14,
            padding: '10px 18px', borderRadius: 11, border: 'none',
            cursor: ready && !deleting ? 'pointer' : 'default',
            background: ready ? 'rgba(255,90,90,0.95)' : 'rgba(255,90,90,0.18)',
            color: ready ? '#fff' : 'rgba(255,200,200,0.5)',
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
          Permanently delete my account
        </button>
      </div>
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────── */
function Field({ label, value, onChange, type = 'text', placeholder, disabled, hint }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; disabled?: boolean; hint?: string
}) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} disabled={disabled}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 11,
          background: disabled ? 'rgba(255,255,255,0.02)'
                    : f ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${f ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
          color: disabled ? 'rgba(255,255,255,0.55)' : '#fff',
          fontSize: 14, outline: 'none', colorScheme: 'dark',
          transition: 'border-color 0.2s, background 0.2s',
        }} />
      {hint && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', margin: '5px 0 0' }}>{hint}</p>}
    </div>
  )
}

function Row({ title, sub, action }: { title: string; sub: string; action: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      padding: '14px 16px', borderRadius: 13,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      marginBottom: 10,
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '3px 0 0' }}>{sub}</p>
      </div>
      {action}
    </div>
  )
}

function btnGhost(disabled: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: disabled ? 'rgba(255,255,255,0.4)' : '#fff',
    fontSize: 12, fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    flexShrink: 0,
  }
}
