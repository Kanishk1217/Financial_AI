import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, CreditCard, Tag, FileText, Calendar, Hash, Loader2, Plus, Check } from 'lucide-react'
import { txAPI } from '@/lib/api'
import { formatDate, categoryColor } from '@/lib/utils'

type Tx = {
  id: number
  amount: number
  category: string
  description: string
  date: string
  logo_url?: string | null
  currency?: string
  pending?: boolean
  account_id?: string | null
  notes?: string | null
  tags?: string[]
  is_plaid?: boolean
}

function formatMoney(amount: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

type Props = {
  tx: Tx | null
  open: boolean
  onClose: () => void
  onSaved: (updates: Partial<Tx>) => void
  accountName?: (id: string | null | undefined) => string | undefined
}

export function TxDetailPanel({ tx, open, onClose, onSaved, accountName }: Props) {
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    if (tx) {
      setNotes(tx.notes || '')
      setTags(tx.tags || [])
      setTagInput('')
      setSaving('idle')
    }
  }, [tx?.id])

  // Save on close if there are changes
  const hasChanges = (): boolean => {
    if (!tx) return false
    if ((tx.notes || '') !== notes) return true
    const a = tx.tags || []
    if (a.length !== tags.length) return true
    return a.some((t, i) => t !== tags[i])
  }

  const save = async () => {
    if (!tx || !hasChanges()) return
    setSaving('saving')
    try {
      await txAPI.patch(tx.id, { notes: notes || undefined, tags })
      onSaved({ notes, tags })
      setSaving('saved')
      setTimeout(() => setSaving('idle'), 900)
    } catch {
      setSaving('idle')
    }
  }

  const closeAndSave = async () => {
    await save()
    onClose()
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (!t || tags.includes(t)) return
    setTags(prev => [...prev, t])
    setTagInput('')
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAndSave() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, notes, tags])

  if (!tx) return null
  const isIncome = tx.amount < 0
  const absAmt = Math.abs(tx.amount)
  const cColor = categoryColor(tx.category)
  const acct = accountName ? accountName(tx.account_id) : undefined

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAndSave}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', zIndex: 250 }}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px, 100vw)',
              background: '#0a0a0a', borderLeft: '1px solid rgba(255,255,255,0.1)',
              zIndex: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transaction</span>
                {saving !== 'idle' && (
                  <span style={{ fontSize: 11, color: saving === 'saved' ? 'rgba(140,240,170,1)' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {saving === 'saving' ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                    {saving === 'saving' ? 'Saving' : 'Saved'}
                  </span>
                )}
              </div>
              <button onClick={closeAndSave} style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>

            {/* Hero */}
            <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                {tx.logo_url ? (
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={tx.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                  </div>
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${cColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Hash size={20} style={{ color: cColor }} />
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 16, background: `${cColor}22`, color: cColor }}>{tx.category}</span>
                    {tx.pending && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 16, background: 'rgba(255,200,100,0.15)', color: 'rgba(255,200,100,0.95)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending</span>
                    )}
                    {tx.is_plaid && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 16, background: 'rgba(120,180,255,0.12)', color: 'rgba(160,200,255,0.95)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bank Sync</span>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: isIncome ? 'rgba(140,240,170,1)' : '#fff', margin: 0, letterSpacing: '-0.04em' }}>
                {isIncome ? '+' : '-'}{formatMoney(absAmt, tx.currency || 'USD')}
              </p>
            </div>

            {/* Metadata */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Row icon={Calendar} label="Date" value={formatDate(tx.date)} />
              {acct && <Row icon={CreditCard} label="Account" value={acct} />}
              {tx.account_id && !acct && <Row icon={CreditCard} label="Account ID" value={tx.account_id.slice(0, 12) + '…'} mono />}
              {tx.currency && tx.currency !== 'USD' && <Row icon={MapPin} label="Currency" value={tx.currency} />}
            </div>

            {/* Notes */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <FileText size={13} style={{ color: 'rgba(255,255,255,0.55)' }} />
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notes</label>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={save}
                placeholder="Add a note…"
                rows={3}
                style={{
                  width: '100%', padding: '11px 13px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.5, colorScheme: 'dark',
                }}
              />
            </div>

            {/* Tags */}
            <div style={{ padding: '20px 24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Tag size={13} style={{ color: 'rgba(255,255,255,0.55)' }} />
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</label>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {tags.map(t => (
                  <span key={t}
                    onClick={() => setTags(prev => prev.filter(x => x !== t))}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 16,
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                    title="Click to remove">
                    #{t}
                    <X size={10} />
                  </span>
                ))}
                {tags.length === 0 && (
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No tags yet</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); save() } }}
                  placeholder="vacation, work, recurring…"
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 11,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#fff', fontSize: 13, outline: 'none',
                  }}
                />
                <button onClick={() => { addTag(); save() }} disabled={!tagInput.trim()}
                  style={{
                    padding: '0 14px', borderRadius: 11, border: 'none',
                    background: tagInput.trim() ? '#fff' : 'rgba(255,255,255,0.06)',
                    color: tagInput.trim() ? '#000' : 'rgba(255,255,255,0.35)',
                    fontSize: 13, fontWeight: 700, cursor: tagInput.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                  <Plus size={13} strokeWidth={2.5} />Add
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Row({ icon: Icon, label, value, mono = false }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon size={13} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontFamily: mono ? 'ui-monospace, monospace' : 'inherit', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
