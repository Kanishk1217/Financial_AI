// @ts-nocheck
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, Wallet, Check, AlertCircle } from 'lucide-react'
import { authAPI } from '@/lib/api'

function GlassField({ label, type = 'text', value, onChange, required = false, rightSlot }: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  required?: boolean; rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.72)', display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{
        borderRadius: 14, border: `1px solid ${focused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
        background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(8px)', transition: 'border-color 0.2s, background 0.2s',
        position: 'relative',
      }}>
        <input
          type={type} value={value} required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', background: 'transparent',
            padding: '13px 16px', paddingRight: rightSlot ? 48 : 16,
            fontSize: 14, color: '#fff', outline: 'none', borderRadius: 14,
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

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return }
    setError('')
    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2200)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail ?? 'Invalid or expired reset link. Please request a new one.')
    } finally { setLoading(false) }
  }

  /* success screen */
  if (done) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 18 }}
          style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={26} color="#000" strokeWidth={3} />
        </motion.div>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Password updated!</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginTop: 6 }}>Taking you to sign in…</p>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={12} color="#000" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>FinanceAI</span>
        </Link>

        <div className="animate-element animate-delay-100" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, margin: '0 0 8px' }}>
            Set new password.
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="animate-element animate-delay-200">
            <GlassField
              label="New password" type={showPass ? 'text' : 'password'}
              value={password} onChange={setPassword} required
              rightSlot={
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.65)', display: 'flex' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          </div>

          <div className="animate-element animate-delay-300">
            <GlassField
              label="Confirm password" type={showConf ? 'text' : 'password'}
              value={confirm} onChange={setConfirm} required
              rightSlot={
                <button type="button" onClick={() => setShowConf(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.65)', display: 'flex' }}>
                  {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.18)', fontSize: 12.5, color: 'rgba(255,120,120,0.9)', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertCircle size={13} style={{ marginTop: 1, flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="animate-element animate-delay-400">
            <button type="submit" disabled={loading || !password || !confirm}
              style={{
                width: '100%', padding: '13px 20px', borderRadius: 14, border: 'none',
                cursor: loading || !password || !confirm ? 'not-allowed' : 'pointer',
                background: loading || !password || !confirm ? 'rgba(255,255,255,0.06)' : '#fff',
                color: loading || !password || !confirm ? 'rgba(255,255,255,0.25)' : '#000',
                fontSize: 14, fontWeight: 700, transition: 'background 0.2s, color 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading ? <><Loader2 size={14} className="animate-spin" />Updating…</> : 'Update password'}
            </button>
          </div>
        </form>

        <div className="animate-element animate-delay-500" style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>

      </div>
    </div>
  )
}
