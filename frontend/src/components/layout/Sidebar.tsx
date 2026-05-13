import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, PieChart, FileText,
  Sparkles, LogOut, ChevronsLeft, ChevronsRight, CreditCard,
  Settings2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { LogoMark } from '@/components/ui/Logo'
import { AccountSettingsModal } from '@/components/ui/AccountSettingsModal'

type Item = { to: string; icon: any; label: string; accent: string }

const navMain: Item[] = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    accent: 'rgba(180,140,255,1)' },
  { to: '/accounts',     icon: CreditCard,      label: 'Accounts',     accent: 'rgba(120,200,255,1)' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions', accent: 'rgba(140,240,170,1)' },
]
const navTools: Item[] = [
  { to: '/budget',       icon: PieChart,        label: 'Budget',       accent: 'rgba(255,200,140,1)' },
  { to: '/reports',      icon: FileText,        label: 'Reports',      accent: 'rgba(255,180,200,1)' },
  { to: '/smart',        icon: Sparkles,        label: 'Smart AI',     accent: 'rgba(200,160,255,1)' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 74 : 252 }}
      transition={{ duration: 0.34, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        height: '100vh', flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(10,10,14,0.85) 0%, rgba(8,8,10,0.75) 100%)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Aurora glow inside the sidebar */}
      <div style={{
        position: 'absolute', top: -40, left: -60, width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,140,255,0.10) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: 80, right: -40, width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,200,255,0.08) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Logo ─────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: collapsed ? '18px 0 16px' : '18px 16px 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden', position: 'relative', zIndex: 1,
      }}>
        <LogoMark size={36} />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}>
              <p style={{
                fontSize: 15, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1, whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #fff 0%, rgba(200,180,255,0.95) 50%, #fff 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}>FinanceAI</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Personal Tracker</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ──────────────────────────── */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && <SectionLabel label="MAIN" />}
        {navMain.map((item) => <NavRow key={item.to} item={item} collapsed={collapsed} />)}

        <div style={{ height: 14 }} />
        {!collapsed && <SectionLabel label="TOOLS" />}
        {navTools.map((item) => <NavRow key={item.to} item={item} collapsed={collapsed} />)}
      </nav>

      {/* ── Footer ───────────────────────── */}
      <div style={{
        padding: '10px 10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', zIndex: 1,
      }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden', marginBottom: 6 }}>
              <motion.div
                whileHover={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'default',
                  transition: 'background 0.18s, border-color 0.18s',
                }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(180,140,255,0.4), rgba(120,200,255,0.4))',
                    border: '1px solid rgba(255,255,255,0.16)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>{initials}</div>
                  {/* Online status dot */}
                  <div style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 9, height: 9, borderRadius: '50%',
                    background: 'rgba(140,240,170,1)',
                    border: '2px solid rgba(15,15,17,1)',
                    boxShadow: '0 0 6px rgba(140,240,170,0.7)',
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                    {user?.name || (user?.email?.split('@')[0] ?? 'User')}
                  </p>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                    {user?.email ?? ''}
                  </p>
                </div>
                <Tooltip content="Account settings" side="top">
                  <button aria-label="Account settings" onClick={() => setSettingsOpen(true)} style={{
                    width: 26, height: 26, borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                    color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
                    <Settings2 size={12} />
                  </button>
                </Tooltip>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 6 }}>
          <LogoutBtn collapsed={collapsed} onClick={handleLogout} />
          <Tooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="top">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
              onClick={() => setCollapsed(c => !c)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.55)',
                flexShrink: 0,
              }}>
              {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
            </motion.button>
          </Tooltip>
        </div>
      </div>

      <AccountSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </motion.aside>
  )
}

/* ── Section label ─────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ padding: '8px 14px 6px' }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
        color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase',
      }}>{label}</span>
    </div>
  )
}

/* ── Nav row ───────────────────────────────────────────── */
function NavRow({ item, collapsed }: { item: Item; collapsed: boolean }) {
  return (
    <Tooltip content={collapsed ? item.label : null} side="right" sideOffset={12}>
      <NavLink to={item.to} style={{ textDecoration: 'none', display: 'block' }}>
        {({ isActive }) => (
          <NavItem isActive={isActive} item={item} collapsed={collapsed} />
        )}
      </NavLink>
    </Tooltip>
  )
}

function NavItem({ isActive, item, collapsed }: { isActive: boolean; item: Item; collapsed: boolean }) {
  const [hovered, setHovered] = useState(false)
  const { icon: Icon, label, accent } = item

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 11,
        overflow: 'visible',
        // When collapsed, constrain the active pill to a centered square so it
        // doesn't span weird widths or extend outside the sidebar.
        width: collapsed ? 44 : '100%',
        margin: collapsed ? '0 auto' : undefined,
      }}>
      {/* Active pill background */}
      {isActive && (
        <motion.div
          layoutId="nav-pill"
          transition={{ type: 'spring', bounce: 0.18, duration: 0.42 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 11,
            background: `linear-gradient(90deg, ${accent.replace(',1)', ',0.14)')}, ${accent.replace(',1)', ',0.04)')})`,
            border: `1px solid ${accent.replace(',1)', ',0.22)')}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px ${accent.replace(',1)', ',0.18)')}`,
          }}
        />
      )}
      {/* Accent rail (active) — only when expanded. Centered via calc to avoid Framer Motion's transform clobbering translateY(-50%). */}
      {isActive && !collapsed && (
        <motion.div
          layoutId="nav-rail"
          transition={{ type: 'spring', bounce: 0.18, duration: 0.42 }}
          style={{
            position: 'absolute', left: -10, top: 'calc(50% - 10px)',
            width: 3, height: 20, borderRadius: '0 3px 3px 0',
            background: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
      )}

      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 11,
        padding: collapsed ? '10px 0' : '10px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        position: 'relative', zIndex: 1,
        transition: 'background 0.15s',
        background: !isActive && hovered ? 'rgba(255,255,255,0.025)' : 'transparent',
        borderRadius: 11,
      }}>
        <Icon
          size={16}
          strokeWidth={isActive ? 2.4 : 1.8}
          style={{
            flexShrink: 0,
            color: isActive ? accent
                 : hovered  ? 'rgba(255,255,255,0.85)'
                 :            'rgba(255,255,255,0.45)',
            filter: isActive ? `drop-shadow(0 0 6px ${accent.replace(',1)', ',0.4)')})` : undefined,
            transition: 'color 0.18s',
          }}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.14 }}
              style={{
                fontSize: 13,
                fontWeight: isActive ? 700 : hovered ? 600 : 500,
                whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                color: isActive ? '#fff' : hovered ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)',
                transition: 'color 0.18s',
              }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {/* Active indicator dot on the right — only when expanded */}
        {isActive && !collapsed && (
          <motion.span
            layoutId="nav-dot"
            transition={{ type: 'spring', bounce: 0.2 }}
            style={{
              marginLeft: 'auto',
              width: 5, height: 5, borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 8px ${accent}`,
            }} />
        )}
      </div>
    </div>
  )
}

/* ── Sign out ──────────────────────────────────────────── */
function LogoutBtn({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Tooltip content={collapsed ? 'Sign out' : null} side="top">
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1, display: 'flex', alignItems: 'center',
          gap: 9, padding: '9px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10,
          border: `1px solid ${hovered ? 'rgba(255,100,100,0.18)' : 'rgba(255,255,255,0.06)'}`,
          cursor: 'pointer',
          background: hovered ? 'rgba(255,90,90,0.06)' : 'rgba(255,255,255,0.02)',
          color: hovered ? 'rgba(255,160,160,0.95)' : 'rgba(255,255,255,0.55)',
          fontSize: 12, fontWeight: 600,
          transition: 'background 0.18s, color 0.18s, border-color 0.18s',
        }}>
        <LogOut size={13} style={{ flexShrink: 0 }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              Sign out
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </Tooltip>
  )
}
