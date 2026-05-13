// @ts-nocheck
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, TrendingUp, BarChart2, Brain, Shield, Check } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { LogoMark } from '@/components/ui/Logo'

/* ── Glass input wrapper (from new sign-in component) ── */
function GlassField({
  label, type = 'text', name, placeholder, value, onChange, required = false, rightSlot,
}: {
  label: string; type?: string; name: string; placeholder: string
  value: string; onChange: (v: string) => void; required?: boolean; rightSlot?: React.ReactNode
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
          type={type} name={name} placeholder={placeholder}
          value={value} onChange={e => onChange(e.target.value)}
          required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
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

/* ── Right panel — feature highlights ── */
function RightPanel() {
  const features = [
    {
      icon: Brain,
      title: 'AI Anomaly Detection',
      body: 'Every transaction is scanned automatically. Unusual spending gets flagged before it becomes a real problem.',
    },
    {
      icon: TrendingUp,
      title: 'Smart Budget Tracking',
      body: 'Set per-category limits. Get alerted at 80% so you always know where you stand.',
    },
    {
      icon: BarChart2,
      title: 'Beautiful Monthly Reports',
      body: 'Income, expenses, and savings rate — summarised automatically and exportable to CSV.',
    },
    {
      icon: Shield,
      title: 'Your Data, Your Ownership',
      body: 'JWT auth, bcrypt hashing, and HTTPS transport. Nothing is shared with third parties.',
    },
  ]

  return (
    <div style={{
      position: 'relative', height: '100%',
      padding: '48px 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0,
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
        style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 10 }}>
          What you get
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.2, color: '#fff', margin: 0 }}>
          Everything to win<br />with your money.
        </h2>
      </motion.div>

      {/* Feature list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map(({ icon: Icon, title, body }, i) => (
          <motion.div key={title}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '16px 18px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)',
              transition: 'border-color 0.2s, background 0.2s',
              cursor: 'default',
            }}
            onHoverStart={e => {
              (e.target as HTMLElement).closest('[data-feature]')?.setAttribute('style',
                'border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.04)')
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1,
            }}>
              <Icon size={15} color="rgba(255,255,255,0.55)" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)' }}>{body}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom trust line */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.5 }}
        style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>Free · Open Source · Self-hostable</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
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

  const toggleMode = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setForgotSent(false) }

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
        setMode('login')
        setPass('')
        setName('')
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

  /* ─ success screen ─ */
  if (done) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
          style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={26} color="#000" strokeWidth={3} />
        </motion.div>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>You're in!</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginTop: 6 }}>Taking you to your dashboard…</p>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex' }}>

      {/* ── Left — form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
            <LogoMark size={32} radius={9} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>FinanceAI</span>
          </Link>

          {/* Heading */}
          <div className="animate-element animate-delay-100" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, margin: '0 0 8px' }}>
              {mode === 'login' ? 'Welcome back.' : mode === 'register' ? 'Create account.' : 'Reset password.'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              {mode === 'login' ? 'Sign in to your FinanceAI account' : mode === 'register' ? 'Start tracking your finances for free' : "We'll send a reset link to your email."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* forgot-sent success */}
            <AnimatePresence>
              {mode === 'forgot' && forgotSent && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(80,200,120,0.07)', border: '1px solid rgba(80,200,120,0.18)', fontSize: 13, color: 'rgba(140,230,160,0.9)', lineHeight: 1.6 }}>
                  ✓ If that email exists, a reset link has been sent. Check your inbox.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name — register only */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <GlassField label="Full name" name="name" placeholder="Your name" value={name} onChange={setName} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email — always shown */}
            {!forgotSent && (
              <div className="animate-element animate-delay-200">
                <GlassField label="Email address" type="email" name="email" placeholder="you@example.com"
                  value={email} onChange={setEmail} required />
              </div>
            )}

            {/* Password — login / register only */}
            {mode !== 'forgot' && (
              <div className="animate-element animate-delay-300">
                <GlassField
                  label="Password" type={showPass ? 'text' : 'password'} name="password"
                  placeholder="••••••••" value={password} onChange={setPass} required
                  rightSlot={
                    <button type="button" onClick={() => setShowP(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.65)', display: 'flex' }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
              </div>
            )}

            {/* Remember + forgot */}
            {mode === 'login' && (
              <div className="animate-element animate-delay-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  <input type="checkbox" className="custom-checkbox" checked={remember} onChange={e => setRemem(e.target.checked)} />
                  Keep me signed in
                </label>
                <button type="button"
                  onClick={() => { setMode('forgot'); setError(''); setForgotSent(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.18)', fontSize: 12.5, color: 'rgba(255,120,120,0.9)', lineHeight: 1.5 }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            {!forgotSent && (
              <div className="animate-element animate-delay-500">
                <button type="submit"
                  disabled={loading || !email || (mode !== 'forgot' && !password)}
                  style={{
                    width: '100%', padding: '13px 20px', borderRadius: 14, border: 'none',
                    cursor: loading || !email || (mode !== 'forgot' && !password) ? 'not-allowed' : 'pointer',
                    background: loading || !email || (mode !== 'forgot' && !password) ? 'rgba(255,255,255,0.06)' : '#fff',
                    color: loading || !email || (mode !== 'forgot' && !password) ? 'rgba(255,255,255,0.25)' : '#000',
                    fontSize: 14, fontWeight: 700, transition: 'background 0.2s, color 0.2s, transform 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { if (!loading && email) e.currentTarget.style.transform = 'scale(1.01)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" />{mode === 'login' ? 'Signing in…' : mode === 'register' ? 'Creating account…' : 'Sending link…'}</>
                    : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'
                  }
                </button>
              </div>
            )}
          </form>

          {/* Toggle mode */}
          <div className="animate-element animate-delay-600" style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            {mode === 'forgot'
              ? <>Remember your password?{' '}</>
              : mode === 'login' ? "Don't have an account? " : 'Already have an account? '
            }
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setForgotSent(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', padding: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

        </div>
      </div>

      {/* ── Right — finance preview (desktop only) ── */}
      <div className="hidden lg:block" style={{ width: 420, borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <RightPanel />
      </div>

    </div>
  )
}
