// @ts-nocheck
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { LogoMark } from '@/components/ui/Logo'

function NightField({ label, type = 'text', value, onChange, required = false, rightSlot }: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  required?: boolean; rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.03em', color: focused ? 'rgba(240,237,230,0.8)' : 'rgba(240,237,230,0.55)', display: 'block', marginBottom: 7, transition: 'color 0.15s', fontFamily: 'var(--font-ui)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} value={value} required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            padding: '12px 16px', paddingRight: rightSlot ? 46 : 16,
            fontSize: 14, color: '#F0EDE6', outline: 'none', borderRadius: 11,
            border: `1px solid ${focused ? 'var(--electric)' : 'rgba(240,237,230,0.10)'}`,
            transition: 'border-color 0.15s, background 0.15s', fontFamily: 'var(--font-ui)',
          }}
          className="placeholder:text-white/20"
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  useEffect(() => { if (!token) navigate('/login') }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return }
    setError(''); setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2200)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail ?? 'Invalid or expired reset link. Please request a new one.')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.38 }}
        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.14, type: 'spring', stiffness: 260, damping: 18 }}
          style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(51,130,247,0.4)' }}>
          <Check size={26} color="#fff" strokeWidth={2.5} />
        </motion.div>
        <div>
          <h2 style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, color: '#F0EDE6', letterSpacing: '-0.02em', margin: 0 }}>Password updated!</h2>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.55)', marginTop: 8, fontFamily: 'var(--font-ui)' }}>Taking you to sign in…</p>
        </div>
      </motion.div>
    </div>
  )

  const disabled = loading || !password || !confirm

  return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'var(--font-ui)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 44 }}>
          <LogoMark size={30} radius={9} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F0EDE6', letterSpacing: '-0.02em' }}>FinanceAI</span>
        </Link>

        <div className="animate-element animate-delay-100" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(26px,4vw,34px)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.025em', color: '#F0EDE6', lineHeight: 1.05, margin: '0 0 8px' }}>
            Set new password.
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', margin: 0 }}>Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="animate-element animate-delay-200">
            <NightField label="New password" type={showPass ? 'text' : 'password'} value={password} onChange={setPassword} required
              rightSlot={
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(240,237,230,0.45)', display: 'flex', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.8)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.45)')}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          </div>
          <div className="animate-element animate-delay-300">
            <NightField label="Confirm password" type={showConf ? 'text' : 'password'} value={confirm} onChange={setConfirm} required
              rightSlot={
                <button type="button" onClick={() => setShowConf(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(240,237,230,0.45)', display: 'flex', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.8)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.45)')}>
                  {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(196,54,42,0.08)', border: '1px solid rgba(196,54,42,0.2)', fontSize: 12.5, color: 'rgba(220,120,110,0.9)', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertCircle size={13} style={{ marginTop: 1, flexShrink: 0 }} />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="animate-element animate-delay-400">
            <button type="submit" disabled={disabled} style={{
              width: '100%', padding: '13px 20px', borderRadius: 11, border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              background: disabled ? 'rgba(255,255,255,0.05)' : 'var(--electric)',
              color: disabled ? 'rgba(240,237,230,0.2)' : '#fff',
              fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-ui)',
              boxShadow: disabled ? 'none' : '0 4px 20px rgba(51,130,247,0.3)',
              transition: 'background 0.2s, color 0.2s, opacity 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
              {loading ? <><Loader2 size={14} className="animate-spin" />Updating…</> : 'Update password'}
            </button>
          </div>
        </form>

        <div className="animate-element animate-delay-500" style={{ marginTop: 26, textAlign: 'center', fontSize: 13, color: 'rgba(240,237,230,0.45)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--electric)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
