import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'

export type DropdownOption<T extends string | number> = {
  value: T
  label: string
}

type Props<T extends string | number> = {
  value: T
  options: DropdownOption<T>[] | readonly DropdownOption<T>[]
  onChange: (v: T) => void
  placeholder?: string
  fullWidth?: boolean
  minWidth?: number
  size?: 'sm' | 'md'
}

export function Dropdown<T extends string | number>({
  value, options, onChange, placeholder, fullWidth = true, minWidth, size = 'md',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.querySelector<HTMLButtonElement>('[data-selected="true"]')
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [open])

  const padY = size === 'sm' ? 7 : 11
  const padX = size === 'sm' ? 12 : 14
  const fontSize = size === 'sm' ? 13 : 14

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: fullWidth ? '100%' : 'auto', minWidth }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: `${padY}px ${padX}px`,
          paddingRight: padX + 18,
          borderRadius: 12,
          background: open || focused ? 'var(--surface-hover)' : 'var(--surface)',
          border: `1px solid ${open || focused ? 'var(--amber)' : 'var(--warm-border-strong)'}`,
          color: selected ? 'var(--ink)' : 'var(--ink-muted)',
          fontSize,
          outline: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.label ?? placeholder ?? 'Select…'}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--ink-muted)',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 300,
              maxHeight: 260,
              overflowY: 'auto',
              padding: 4,
              borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--warm-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {options.map(o => {
              const isSel = o.value === value
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  data-selected={isSel}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  style={{
                    width: '100%',
                    padding: `${size === 'sm' ? 8 : 10}px 12px`,
                    borderRadius: 8,
                    border: 'none',
                    background: isSel ? 'var(--parchment-deep)' : 'transparent',
                    color: isSel ? 'var(--ink)' : 'var(--ink-secondary)',
                    fontSize,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    transition: 'background 0.12s, color 0.12s',
                  }}
                  onMouseEnter={e => {
                    if (!isSel) e.currentTarget.style.background = 'var(--surface-hover)'
                  }}
                  onMouseLeave={e => {
                    if (!isSel) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                  {isSel && <Check size={13} style={{ color: 'var(--ink)', flexShrink: 0 }} />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
