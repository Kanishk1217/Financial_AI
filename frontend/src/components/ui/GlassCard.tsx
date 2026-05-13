import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'purple' | 'cyan' | 'amber' | 'none'
  delay?: number
}

const glowMap = {
  purple: '0 0 40px rgba(124,58,237,0.2)',
  cyan: '0 0 40px rgba(6,182,212,0.2)',
  amber: '0 0 40px rgba(245,158,11,0.2)',
  none: 'none',
}

export function GlassCard({ children, className, hover = true, glow = 'none', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -4, boxShadow: `${glowMap[glow]}, 0 20px 60px rgba(0,0,0,0.4)` } : undefined}
      className={cn('glass rounded-2xl p-6', className)}
      style={{ boxShadow: glow !== 'none' ? glowMap[glow] : undefined }}
    >
      {children}
    </motion.div>
  )
}
