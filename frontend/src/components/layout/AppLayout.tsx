import { Navigate, Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from './Sidebar'
import { LayoutDashboard, ArrowLeftRight, PieChart, FileText, Sparkles, CreditCard } from 'lucide-react'

const mobileNav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Home'    },
  { to: '/accounts',     icon: CreditCard,      label: 'Accounts' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Tx'       },
  { to: '/budget',       icon: PieChart,        label: 'Budget'   },
  { to: '/reports',      icon: FileText,        label: 'Reports'  },
  { to: '/smart',        icon: Sparkles,        label: 'AI'       },
]

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated()) return <Navigate to="/login" replace />

  return (
    <div
      className="app-shell flex h-screen overflow-hidden"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content — parchment bg with subtle dot grid */}
      <main
        className="flex-1 overflow-y-auto pb-20 md:pb-0"
        style={{
          background: 'var(--parchment)',
          backgroundImage: 'radial-gradient(circle, rgba(24,21,16,0.048) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          position: 'relative',
        }}
      >
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-2 py-2"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--warm-border)',
        }}
      >
        {mobileNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              padding: '6px 10px', borderRadius: 10,
              textDecoration: 'none',
              fontSize: 10, fontWeight: 600,
              fontFamily: 'var(--font-ui)',
              color: isActive ? 'var(--amber)' : 'var(--ink-muted)',
              background: isActive ? 'var(--amber-dim)' : 'transparent',
              transition: 'color 0.15s, background 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.7} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
