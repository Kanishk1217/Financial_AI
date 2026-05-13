import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import Dashboard from '@/pages/Dashboard'
import Accounts from '@/pages/Accounts'
import Transactions from '@/pages/Transactions'
import Budget from '@/pages/Budget'
import Reports from '@/pages/Reports'
import Smart from '@/pages/Smart'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts'

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrap><Landing /></PageWrap>} />
        <Route path="/login" element={<PageWrap><Login /></PageWrap>} />
        <Route path="/reset-password" element={<PageWrap><ResetPassword /></PageWrap>} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<PageWrap><Dashboard /></PageWrap>} />
          <Route path="/accounts" element={<PageWrap><Accounts /></PageWrap>} />
          <Route path="/transactions" element={<PageWrap><Transactions /></PageWrap>} />
          <Route path="/budget" element={<PageWrap><Budget /></PageWrap>} />
          <Route path="/reports" element={<PageWrap><Reports /></PageWrap>} />
          <Route path="/smart" element={<PageWrap><Smart /></PageWrap>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <CommandPalette />
      <KeyboardShortcuts />
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(15,15,17,0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  )
}
