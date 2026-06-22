import { motion } from 'motion/react'

export function AuroraBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Aurora orbs */}
      <motion.div
        className="absolute rounded-full blur-[120px] opacity-30"
        style={{
          width: 700, height: 700,
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          top: '-20%', left: '-15%',
        }}
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full blur-[140px] opacity-20"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          top: '10%', right: '-10%',
        }}
        animate={{ x: [0, -50, 40, 0], y: [0, 60, -20, 0], scale: [1, 0.92, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div
        className="absolute rounded-full blur-[100px] opacity-20"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
          bottom: '-10%', left: '30%',
        }}
        animate={{ x: [0, 40, -60, 0], y: [0, -50, 20, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
      />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
