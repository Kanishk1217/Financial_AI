// @ts-nocheck
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff, Loader2, TrendingUp, BarChart2, Brain, Shield, Check } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { LogoMark } from '@/components/ui/Logo'

/* ── Night input field ── */
function NightField({
  label, type = 'text', name, placeholder, value, onChange, required = false, rightSlot,
}: {
  label: string; type?: string; name: string; placeholder: string
  value: string; onChange: (v: string) => void; required?: boolean; rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        fontSize: 12, fontWeight: 500, letterSpacing: '0.03em',
        color: focused ? 'rgba(240,237,230,0.8)' : 'rgba(240,237,230,0.55)',
        display: 'block', marginBottom: 7,
        transition: 'color 0.15s',
        fontFamily: 'var(--font-ui)',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} name={name} placeholder={placeholder}
          value={value} onChange={e => onChange(e.target.value)}
          required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            padding: '12px 16px', paddingRight: rightSlot ? 46 : 16,
            fontSize: 14, color: '#F0EDE6', outline: 'none',
            borderRadius: 11,
            border: `1px solid ${focused ? 'var(--electric)' : 'rgba(240,237,230,0.10)'}`,
            transition: 'border-color 0.15s, background 0.15s',
            fontFamily: 'var(--font-ui)',
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

/* ── Right panel ── */
function RightPanel() {
  const features = [
    { icon: Brain,     title: 'AI Anomaly Detection',    body: 'Every transaction is scanned automatically. Unusual spending flagged before it becomes a problem.' },
    { icon: TrendingUp, title: 'Smart Budget Tracking',  body: 'Set per-category limits. Get alerted at 80% so you always know where you stand.' },
    { icon: BarChart2,  title: 'Beautiful Reports',      body: 'Income, expenses, and savings rate — summarised automatically, exportable to CSV.' },
    { icon: Shield,     title: 'Your Data, Your Ownership', body: 'JWT auth, bcrypt hashing, HTTPS transport. Nothing shared with third parties.' },
  ]

  return (
    <div style={{
      position: 'relative', height: '100%',
      padding: '48px 36px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      overflow: 'hidden',
      background: 'rgba(51,130,247,0.03)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(51,130,247,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        style={{ marginBottom: 32 }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', display: 'block', marginBottom: 10, fontFamily: 'var(--font-ui)' }}>
          What you get
        </span>
        <h2 style={{
          fontSize: 22, fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1,
          color: '#F0EDE6', margin: 0,
        }}>
          Everything to win<br />with your money.
        </h2>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map(({ icon: Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 + i * 0.09, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              display: 'flex', gap: 13, alignItems: 'flex-start',
              padding: '14px 16px', borderRadius: 12,
              border: '1px solid rgba(240,237,230,0.06)',
              background: 'rgba(240,237,230,0.02)',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: 'rgba(51,130,247,0.10)',
              border: '1px solid rgba(51,130,247,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1,
            }}>
              <Icon size={14} color="rgba(51,130,247,0.8)" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F0EDE6', marginBottom: 3, fontFamily: 'var(--font-ui)' }}>{title}</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(240,237,230,0.52)', fontFamily: 'var(--font-ui)' }}>{body}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.5 }}
        style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <div style={{ flex: 1, height: 1, background: 'rgba(240,237,230,0.07)' }} />
        <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)' }}>
          Free · Open Source · Self-hostable
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(240,237,230,0.07)' }} />
      </motion.div>
    </div>
  )
}

/* ════════════════════════════════════════════════════ */
export default function Login() {
  const [mode, setMode]         = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPass]     = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowP]    = useState(false)
  const [remember, setRemem]    = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'forgot') {
        await authAPI.forgotPassword(email)
        setForgotSent(true)
        return
      }
      if (!email || !password) return
      if (mode === 'register') {
        await authAPI.register({ email, password, name: name || email.split('@')[0] })
        const res = await authAPI.login({ username: email, password })
        setAuth(res.data.access_token, { email })
        setDone(true)
        setTimeout(() => navigate('/dashboard'), 1400)
        return
      }
      const res = await authAPI.login({ username: email, password })
      setAuth(res.data.access_token, { email })
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 1400)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string }
      if (!e.response) {
        setError('Cannot reach server — make sure the backend is running on port 8000.')
      } else {
        setError(e.response?.data?.detail ?? 'Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ── */
  if (done) return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.38 }}
        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.14, type: 'spring', stiffness: 260, damping: 18 }}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--electric)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(51,130,247,0.4)',
          }}
        >
          <Check size={26} color="#fff" strokeWidth={2.5} />
        </motion.div>
        <div>
          <h2 style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, color: '#F0EDE6', letterSpacing: '-0.02em', margin: 0 }}>
            You're in!
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.55)', marginTop: 8, fontFamily: 'var(--font-ui)' }}>
            Taking you to your dashboard…
          </p>
        </div>
      </motion.div>
    </div>
  )

  const disabled = loading || !email || (mode !== 'forgot' && !password)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', fontFamily: 'var(--font-ui)' }}>

      {/* ── Left — form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 44 }}>
            <LogoMark size={30} radius={9} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F0EDE6', letterSpacing: '-0.02em', fontFamily: 'var(--font-ui)' }}>
              FinanceAI
            </span>
          </Link>

          {/* Heading */}
          <div className="animate-element animate-delay-100" style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontWeight: 400, letterSpacing: '-0.025em',
              color: '#F0EDE6', lineHeight: 1.05, margin: '0 0 8px',
            }}>
              {mode === 'login' ? 'Welcome back.' : mode === 'register' ? 'Create account.' : 'Reset password.'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', margin: 0, fontFamily: 'var(--font-ui)' }}>
              {mode === 'login'
                ? 'Sign in to your FinanceAI account'
                : mode === 'register'
                ? 'Start tracking your finances for free'
                : "We'll send a reset link to your email."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Forgot-sent success */}
            <AnimatePresence>
              {mode === 'forgot' && forgotSent && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '13px 16px', borderRadius: 10, background: 'rgba(31,157,99,0.07)', border: '1px solid rgba(31,157,99,0.2)', fontSize: 13, color: 'rgba(100,220,150,0.9)', lineHeight: 1.6, fontFamily: 'var(--font-ui)' }}
                >
                  If that email exists, a reset link has been sent. Check your inbox.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name — register only */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                >
                  <NightField label="Full name" name="name" placeholder="Your name" value={name} onChange={setName} />
                </motion.div>
              )}
            </AnimatePresence>

            {!forgotSent && (
              <div className="animate-element animate-delay-200">
                <NightField label="Email address" type="email" name="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="animate-element animate-delay-300">
                <NightField
                  label="Password" type={showPass ? 'text' : 'password'} name="password"
                  placeholder="••••••••" value={password} onChange={setPass} required
                  rightSlot={
                    <button type="button" onClick={() => setShowP(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(240,237,230,0.45)', display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.8)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.45)')}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="animate-element animate-delay-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(240,237,230,0.6)' }}>
                  <input type="checkbox" className="custom-checkbox-dark" checked={remember} onChange={e => setRemem(e.target.checked)} />
                  Keep me signed in
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setForgotSent(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(240,237,230,0.45)', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.8)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.45)')}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(196,54,42,0.08)', border: '1px solid rgba(196,54,42,0.2)', fontSize: 12.5, color: 'rgba(220,120,110,0.9)', lineHeight: 1.5, fontFamily: 'var(--font-ui)' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            {!forgotSent && (
              <div className="animate-element animate-delay-500">
                <button
                  type="submit"
                  disabled={disabled}
                  style={{
                    width: '100%', padding: '13px 20px', borderRadius: 11, border: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: disabled ? 'rgba(255,255,255,0.05)' : 'var(--electric)',
                    color: disabled ? 'rgba(240,237,230,0.2)' : '#fff',
                    fontSize: 14, fontWeight: 600,
                    transition: 'background 0.2s, color 0.2s, transform 0.15s, opacity 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'var(--font-ui)',
                    boxShadow: disabled ? 'none' : '0 4px 20px rgba(51,130,247,0.3)',
                  }}
                  onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" />{mode === 'login' ? 'Signing in…' : mode === 'register' ? 'Creating account…' : 'Sending link…'}</>
                    : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'
                  }
                </button>
              </div>
            )}
          </form>

          {/* Toggle mode */}
          <div className="animate-element animate-delay-600" style={{ marginTop: 26, textAlign: 'center', fontSize: 13, color: 'rgba(240,237,230,0.45)' }}>
            {mode === 'forgot'
              ? 'Remember your password? '
              : mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setForgotSent(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--electric)', padding: 0, transition: 'opacity 0.15s', fontFamily: 'var(--font-ui)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

        </div>
      </div>

      {/* ── Right — feature highlights (desktop only) ── */}
      <div className="hidden lg:block" style={{ width: 420, borderLeft: '1px solid rgba(240,237,230,0.06)' }}>
        <RightPanel />
      </div>

    </div>
  )
}
