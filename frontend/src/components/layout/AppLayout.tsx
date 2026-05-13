import { Navigate, Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from './Sidebar'
import { AuroraBg } from '@/components/ui/AuroraBg'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { LayoutDashboard, ArrowLeftRight, PieChart, FileText, Sparkles, CreditCard } from 'lucide-react'

const mobileNav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts',     icon: CreditCard,      label: 'Accounts'  },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Tx' },
  { to: '/budget',       icon: PieChart,        label: 'Budget' },
  { to: '/reports',      icon: FileText,        label: 'Reports' },
  { to: '/smart',        icon: Sparkles,        label: 'Smart' },
]

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated()) return <Navigate to="/login" replace />


  return (
    <div className="dark flex h-screen overflow-hidden" style={{ background: '#070708', position: 'relative' }}>
      <AuroraBg />
      <GrainOverlay />

      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ position: 'relative', zIndex: 2 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0" style={{ background: 'transparent', position: 'relative', zIndex: 2 }}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-2 py-2 border-t border-white/[0.07]"
        style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(12px)' }}>
        {mobileNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'text-white' : 'text-white/30'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={18} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
