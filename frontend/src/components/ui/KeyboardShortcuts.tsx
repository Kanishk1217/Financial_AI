import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from '@/lib/toast'

/**
 * Linear-style chord shortcuts:
 *   g d → /dashboard, g a → /accounts, g t → /transactions, g b → /budget,
 *   g r → /reports, g s → /smart
 *   n   → Add new transaction (/transactions?add=1)
 *   ?   → Show shortcut hint
 * Disabled when typing in inputs/textareas/contenteditable.
 */
export function KeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()
  const chordTimer = useRef<number | null>(null)
  const chord = useRef<string | null>(null)
  const hinted = useRef(false)

  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTyping(e.target)) return

      // Show hint on '?'
      if (e.key === '?') {
        e.preventDefault()
        toast.info('Keyboard shortcuts', {
          description: 'g d · Dashboard\ng a · Accounts\ng t · Transactions\ng b · Budget\ng r · Reports\ng s · Smart\nn · New transaction\n⌘K · Command palette',
          duration: 6000,
        })
        return
      }

      // Single-key shortcuts
      if (chord.current == null) {
        if (e.key === 'g') {
          chord.current = 'g'
          if (chordTimer.current) window.clearTimeout(chordTimer.current)
          chordTimer.current = window.setTimeout(() => { chord.current = null }, 1200)
          return
        }
        if (e.key === 'n') {
          e.preventDefault()
          navigate('/transactions?add=1')
          return
        }
        return
      }

      // Second key after 'g'
      if (chord.current === 'g') {
        const map: Record<string, string> = {
          d: '/dashboard', a: '/accounts', t: '/transactions',
          b: '/budget',    r: '/reports',  s: '/smart',
        }
        const target = map[e.key.toLowerCase()]
        chord.current = null
        if (chordTimer.current) window.clearTimeout(chordTimer.current)
        if (target) {
          e.preventDefault()
          navigate(target)
          if (!hinted.current) {
            hinted.current = true
            toast.info('Pro tip: press ? for all shortcuts', { duration: 3500 })
          }
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (chordTimer.current) window.clearTimeout(chordTimer.current)
    }
  }, [navigate, location.pathname])

  return null
}
