import * as RT from '@radix-ui/react-tooltip'
import { type ReactNode } from 'react'

export function Tooltip({
  children, content, side = 'top', sideOffset = 6, delayMs = 250,
}: {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  delayMs?: number
}) {
  if (!content) return <>{children}</>
  return (
    <RT.Provider delayDuration={delayMs} skipDelayDuration={200}>
      <RT.Root>
        <RT.Trigger asChild>{children}</RT.Trigger>
        <RT.Portal>
          <RT.Content
            side={side}
            sideOffset={sideOffset}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(20,20,22,0.96)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              maxWidth: 280,
              zIndex: 9999,
            }}
          >
            {content}
            <RT.Arrow style={{ fill: 'rgba(20,20,22,0.96)' }} />
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  )
}
