import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, ArrowLeftRight, PieChart, FileText,
  Sparkles, LogOut, ChevronsLeft, ChevronsRight, CreditCard,
  Settings2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { LogoMark } from '@/components/ui/Logo'
import { AccountSettingsModal } from '@/components/ui/AccountSettingsModal'

type Item = { to: string; icon: any; label: string }

const navMain: Item[] = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/accounts',     icon: CreditCard,      label: 'Accounts'     },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
]
const navTools: Item[] = [
  { to: '/budget',  icon: PieChart,  label: 'Budget'   },
  { to: '/reports', icon: FileText,  label: 'Reports'  },
  { to: '/smart',   icon: Sparkles,  label: 'Smart AI' },
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
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        height: '100vh', flexShrink: 0,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF8 100%)',
        borderRight: '1px solid var(--warm-border)',
        overflow: 'hidden',
      }}
    >
      {/* ── Accent top line ──────────────── */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, var(--electric), var(--amber))', flexShrink: 0 }} />

      {/* ── Logo ─────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '16px 0 14px' : '16px 16px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
        borderBottom: '1px solid var(--warm-border)',
      }}>
        <LogoMark size={32} radius={9} />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16 }}
            >
              <p style={{
                fontSize: 14, fontWeight: 700,
                letterSpacing: '-0.02em', lineHeight: 1,
                color: 'var(--ink)', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-ui)',
              }}>FinanceAI</p>
              <p style={{
                fontSize: 10, color: 'var(--ink-muted)',
                marginTop: 3, letterSpacing: '0.07em',
                textTransform: 'uppercase', fontWeight: 600,
                fontFamily: 'var(--font-ui)',
              }}>Personal Tracker</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ──────────────────────────── */}
      <nav style={{
        flex: 1,
        padding: '12px 8px',
        display: 'flex', flexDirection: 'column', gap: 1,
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {!collapsed && <SectionLabel label="Main" />}
        {navMain.map((item) => (
          <NavRow key={item.to} item={item} collapsed={collapsed} />
        ))}
        <div style={{ height: 12 }} />
        {!collapsed && <SectionLabel label="Tools" />}
        {navTools.map((item) => (
          <NavRow key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Footer ───────────────────────── */}
      <div style={{
        padding: '8px 8px 12px',
        borderTop: '1px solid var(--warm-border)',
      }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', marginBottom: 6 }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px',
                borderRadius: 10,
                background: 'var(--parchment)',
                border: '1px solid var(--warm-border)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'var(--amber-dim)',
                  border: '1px solid var(--amber-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--amber)',
                  fontFamily: 'var(--font-ui)',
                }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 12, fontWeight: 600,
                    color: 'var(--ink)', margin: 0, lineHeight: 1.2,
                    fontFamily: 'var(--font-ui)',
                  }}>
                    {user?.name || (user?.email?.split('@')[0] ?? 'User')}
                  </p>
                  <p style={{
                    fontSize: 10.5, color: 'var(--ink-muted)',
                    margin: '2px 0 0', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120,
                    fontFamily: 'var(--font-ui)',
                  }}>
                    {user?.email ?? ''}
                  </p>
                </div>
                <Tooltip content="Account settings" side="top">
                  <button
                    aria-label="Account settings"
                    onClick={() => setSettingsOpen(true)}
                    style={{
                      width: 26, height: 26, borderRadius: 7,
                      border: '1px solid var(--warm-border-strong)',
                      background: 'var(--surface)',
                      color: 'var(--ink-secondary)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--parchment-deep)'
                      e.currentTarget.style.color = 'var(--ink)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--surface)'
                      e.currentTarget.style.color = 'var(--ink-secondary)'
                    }}
                  >
                    <Settings2 size={12} />
                  </button>
                </Tooltip>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 6 }}>
          <LogoutBtn collapsed={collapsed} onClick={handleLogout} />
          <Tooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="top">
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'var(--parchment)',
                border: '1px solid var(--warm-border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--ink-secondary)',
                flexShrink: 0,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--parchment-deep)'
                e.currentTarget.style.color = 'var(--ink)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--parchment)'
                e.currentTarget.style.color = 'var(--ink-secondary)'
              }}
            >
              {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
            </button>
          </Tooltip>
        </div>
      </div>

      <AccountSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </motion.aside>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ padding: '6px 12px 4px' }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
        color: 'var(--ink-muted)', textTransform: 'uppercase',
        fontFamily: 'var(--font-ui)',
      }}>{label}</span>
    </div>
  )
}

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
  const { icon: Icon, label } = item

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 9,
        width: collapsed ? 44 : '100%',
        margin: collapsed ? '0 auto' : undefined,
        background: isActive
          ? 'var(--amber-dim)'
          : hovered
          ? 'var(--parchment)'
          : 'transparent',
        borderLeft: isActive && !collapsed ? '2px solid var(--amber)' : '2px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 10,
        padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <Icon
          size={15}
          strokeWidth={isActive ? 2.2 : 1.8}
          style={{
            flexShrink: 0,
            color: isActive
              ? 'var(--amber)'
              : hovered
              ? 'var(--ink)'
              : 'var(--ink-secondary)',
            transition: 'color 0.15s',
          }}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.13 }}
              style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
                color: isActive
                  ? 'var(--amber)'
                  : hovered
                  ? 'var(--ink)'
                  : 'var(--ink-secondary)',
                transition: 'color 0.15s',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function LogoutBtn({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Tooltip content={collapsed ? 'Sign out' : null} side="top">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1, display: 'flex', alignItems: 'center',
          gap: 8, padding: '9px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 9,
          border: `1px solid ${hovered ? 'rgba(196,54,42,0.2)' : 'var(--warm-border-strong)'}`,
          cursor: 'pointer',
          background: hovered ? 'var(--rose-dim)' : 'var(--parchment)',
          color: hovered ? 'var(--rose)' : 'var(--ink-secondary)',
          fontSize: 12, fontWeight: 600,
          fontFamily: 'var(--font-ui)',
          transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        }}
      >
        <LogOut size={13} style={{ flexShrink: 0 }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              Sign out
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </Tooltip>
  )
}
