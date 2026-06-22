import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { motion } from 'motion/react'
import { useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import {
  Plus, Search, RefreshCw, ArrowUpRight, ArrowDownRight,
  Loader2, ArrowLeftRight, Pencil, Trash2, Building2, Unplug,
  FileText as FileIcon, CalendarDays, X as XIcon, Upload, Tag,
  CheckSquare, Square,
} from 'lucide-react'
import { usePlaidLink } from 'react-plaid-link'
import { txAPI, plaidAPI } from '@/lib/api'
import { formatDate, categoryColor } from '@/lib/utils'
import { Dropdown } from '@/components/ui/Dropdown'
import { TxDetailPanel } from '@/components/ui/TxDetailPanel'
import { Tooltip } from '@/components/ui/Tooltip'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { toast } from '@/lib/toast'

function dateGroupLabel(d: Date): string {
  const today = new Date(); today.setHours(0,0,0,0)
  const tx = new Date(d); tx.setHours(0,0,0,0)
  const diff = Math.round((today.getTime() - tx.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)   return tx.toLocaleDateString('en-US', { weekday: 'long' })
  if (diff < 14)  return 'Last week'
  if (tx.getFullYear() === today.getFullYear())
    return tx.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return tx.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const fireConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.3 },
    colors: ['#ffffff', '#8cf0aa', '#7bb6ff', '#ffd770'],
    disableForReducedMotion: true,
  })
}

const PAGE_SIZE = 50

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Housing', 'Income', 'Other'] as const
type Category = typeof CATEGORIES[number]

const RANGES = [
  { label: 'This month', days: 0 },
  { label: '3 months',   days: 90 },
  { label: '6 months',   days: 180 },
  { label: 'All',        days: 365 },
] as const

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `$${Math.round(amount).toLocaleString('en-US')}`
  }
}

type TxFormState = {
  amount: string
  category: Category
  description: string
  date: string
  type: 'expense' | 'income'
}

function getRange(days: number) {
  const end = new Date()
  const start = days === 0
    ? new Date(end.getFullYear(), end.getMonth(), 1)
    : new Date(end.getTime() - days * 86400000)
  return {
    start: start.toISOString().split('T')[0],
    end:   end.toISOString().split('T')[0],
  }
}

/* ── Focused search input ─────────────────────── */
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
      <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.75)', pointerEvents: 'none' }} />
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search transactions…"
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
          borderRadius: 11, fontSize: 13, color: 'var(--ink)', outline: 'none',
          background: f ? 'var(--parchment)' : 'var(--surface)',
          border: `1px solid ${f ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
          transition: 'border-color 0.2s, background 0.2s',
        }}
      />
    </div>
  )
}

/* ── Modal text input ─────────────────────────── */
function Field(props: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  step?: string
  autoFocus?: boolean
}) {
  const { label, type = 'text', value, onChange, placeholder = '', step, autoFocus } = props
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={value} step={step} placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 12,
          background: f ? 'var(--parchment)' : 'var(--surface)',
          border: `1px solid ${f ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
          color: 'var(--ink)', fontSize: 14, outline: 'none',
          transition: 'border-color 0.2s, background 0.2s', 
        }} />
    </div>
  )
}

/* ── Add / Edit Transaction modal ─────────────── */
function TxModal(props: {
  open: boolean
  initial: Tx | null
  onClose: () => void
  onSaved: () => void
}) {
  const { open, initial, onClose, onSaved } = props
  const today = new Date().toISOString().split('T')[0]

  const buildInitial = (): TxFormState => {
    if (!initial) {
      return { amount: '', category: 'Food', description: '', date: today, type: 'expense' }
    }
    const isIncome = initial.amount < 0
    return {
      amount: String(Math.abs(initial.amount)),
      category: (CATEGORIES.includes(initial.category as Category) ? initial.category : 'Other') as Category,
      description: initial.description,
      date: initial.date,
      type: isIncome ? 'income' : 'expense',
    }
  }

  const [form, setForm] = useState<TxFormState>(buildInitial)
  const [submitting, setSub] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setForm(buildInitial())
      setErr('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = <K extends keyof TxFormState>(k: K, v: TxFormState[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) { setErr('Enter a valid amount.'); return }
    setSub(true)
    try {
      const final = form.type === 'income' ? -Math.abs(amount) : Math.abs(amount)
      const payload = { amount: final, category: form.category, description: form.description, date: form.date }
      if (initial) {
        await txAPI.update(initial.id, payload)
        toast.success('Transaction updated')
      } else {
        await txAPI.create(payload)
        toast.success('Transaction added')
        fireConfetti()
      }
      onSaved(); onClose()
    } catch {
      const msg = initial ? 'Failed to update transaction.' : 'Failed to add transaction.'
      setErr(msg)
      toast.error(msg)
    } finally { setSub(false) }
  }

  if (!open) return null
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(24,21,16,0.55)',  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        style={{ width: '100%', maxWidth: 420, borderRadius: 24, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)', padding: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
              {initial ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '3px 0 0' }}>
              {initial ? 'Update this entry' : 'Record a new entry'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--parchment)', cursor: 'pointer', color: 'var(--ink-secondary)', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'var(--parchment)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18 }}>
          {(['expense', 'income'] as const).map(t => (
            <button key={t} type="button"
              onClick={() => setForm(p => ({ ...p, type: t, category: t === 'income' ? 'Income' : 'Food' }))}
              style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: form.type === t ? '#fff' : 'transparent', color: form.type === t ? '#000' : 'rgba(255,255,255,0.6)', transition: 'background 0.2s, color 0.2s' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Amount ($)" type="number" step="0.01" value={form.amount} onChange={v => set('amount', v)} placeholder="0.00" autoFocus />
          <Field label="Description" value={form.description} onChange={v => set('description', v)} placeholder="Coffee, salary, rent…" />
          <Field label="Date" type="date" value={form.date} onChange={v => set('date', v)} />

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Category</label>
            <Dropdown<Category>
              value={form.category}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              onChange={v => set('category', v)}
            />
          </div>

          {err && <p style={{ fontSize: 12, color: 'rgba(255,120,120,1)', margin: 0 }}>{err}</p>}

          <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ marginTop: 4, padding: '13px', borderRadius: 14, border: 'none', cursor: submitting ? 'default' : 'pointer', background: submitting ? 'rgba(255,255,255,0.08)' : '#fff', color: submitting ? 'rgba(255,255,255,0.5)' : '#000', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting ? <><Loader2 size={14} className="animate-spin" />{initial ? 'Saving…' : 'Adding…'}</> : (initial ? 'Save Changes' : 'Add Transaction')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

/* ── Confirm Delete dialog ──────────────────── */
function ConfirmDelete(props: { open: boolean; tx: Tx | null; onCancel: () => void; onConfirm: () => void; busy: boolean }) {
  const { open, tx, onCancel, onConfirm, busy } = props
  if (!open || !tx) return null
  return (
    <div onClick={e => e.target === e.currentTarget && onCancel()}
      style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(24,21,16,0.55)',  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: 380, borderRadius: 22, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)', padding: '26px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>Delete transaction?</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-secondary)', margin: '0 0 4px' }}>{tx.description}</p>
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '0 0 20px' }}>This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} disabled={busy} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--parchment)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} disabled={busy} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: busy ? 'rgba(255,100,100,0.3)' : 'rgba(255,100,100,0.95)', color: 'var(--ink)', fontSize: 13, fontWeight: 700, cursor: busy ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Plaid Connect Bank button ──────────────── */
function ConnectBank(props: { connected: { institution: string } | null; onChanged: () => void; onSyncing: (b: boolean) => void }) {
  const { connected, onChanged, onSyncing } = props
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchToken = async () => {
    setLoading(true); setError('')
    try {
      const res = await plaidAPI.createLinkToken()
      setLinkToken(res.data.link_token)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Could not start bank connect')
    } finally { setLoading(false) }
  }

  const onSuccess = useCallback(async (publicToken: string) => {
    onSyncing(true)
    const id = toast.loading('Connecting your bank…')
    try {
      const res = await plaidAPI.exchangeToken(publicToken)
      toast.dismiss(id)
      const inst = res?.data?.institution || 'Bank'
      const n = res?.data?.synced_transactions || 0
      toast.success(`Connected to ${inst}`, { description: `${n} transactions imported` })
      fireConfetti()
      onChanged()
    } catch (e: any) {
      toast.dismiss(id)
      const msg = e?.response?.data?.detail || 'Could not connect bank'
      setError(msg); toast.error(msg)
    } finally {
      onSyncing(false)
      setLinkToken(null)
    }
  }, [onChanged, onSyncing])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: () => setLinkToken(null),
  })

  useEffect(() => {
    if (linkToken && ready) open()
  }, [linkToken, ready, open])

  const disconnect = async () => {
    onSyncing(true)
    try {
      await plaidAPI.disconnect()
      toast.success('Bank disconnected')
      onChanged()
    } catch {
      toast.error('Could not disconnect')
    } finally { onSyncing(false) }
  }

  if (connected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 11, background: 'rgba(80,220,120,0.12)', border: '1px solid rgba(80,220,120,0.25)' }}>
          <Building2 size={13} style={{ color: 'rgba(120,230,160,1)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(180,240,200,1)' }}>{connected.institution}</span>
        </div>
        <button onClick={disconnect} title="Disconnect bank"
          style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--parchment)', cursor: 'pointer', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Unplug size={13} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={fetchToken} disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.14)', background: 'var(--parchment)', cursor: loading ? 'default' : 'pointer', color: 'var(--ink)', fontSize: 12, fontWeight: 600 }}>
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Building2 size={13} />}
        Connect Bank
      </motion.button>
      {error && <span style={{ fontSize: 11, color: 'rgba(255,120,120,0.95)' }}>{error}</span>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
export default function Transactions() {
  const today = new Date().toISOString().split('T')[0]
  const [txs, setTxs]           = useState<Tx[]>([])
  const [filtered, setFiltered] = useState<Tx[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [rangeIdx, setRangeIdx] = useState(1) // -1 = custom
  const [customStart, setCustomStart] = useState(today)
  const [customEnd, setCustomEnd]     = useState(today)
  const [catFilter, setCat]     = useState('All')
  const [modalOpen, setModal]   = useState(false)
  const [editing, setEditing]   = useState<Tx | null>(null)
  const [deleting, setDeleting] = useState<Tx | null>(null)
  const [deleteBusy, setDelBusy]= useState(false)
  const [refreshing, setRef]    = useState(false)
  const [plaid, setPlaid]       = useState<{ connected: boolean; institution?: string; count?: number } | null>(null)
  const [detailTx, setDetailTx] = useState<Tx | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isMobile = useMediaQuery('(max-width: 720px)')

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const clearSelection = () => setSelected(new Set())
  const selectAll = (ids: number[]) => setSelected(new Set(ids))

  const bulkDelete = async () => {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    const victims = txs.filter(t => selected.has(t.id))
    setBulkBusy(true)
    setTxs(prev => prev.filter(t => !selected.has(t.id)))
    clearSelection()
    setBulkBusy(false)
    const undone = await toast.undoable(
      `Deleted ${ids.length} transaction${ids.length === 1 ? '' : 's'}`,
      () => setTxs(prev => [...victims, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    )
    if (undone) return
    try { await txAPI.bulkRemove(ids) }
    catch { toast.error('Bulk delete failed — restoring'); setTxs(prev => [...victims, ...prev].sort((a, b) => b.date.localeCompare(a.date))) }
  }

  const bulkTag = async (tag: string) => {
    if (selected.size === 0 || !tag.trim()) return
    const ids = Array.from(selected)
    setBulkBusy(true)
    try {
      const res = await txAPI.bulkTag(ids, tag)
      const cleanTag = res.data.tag
      setTxs(prev => prev.map(t => ids.includes(t.id)
        ? { ...t, tags: t.tags?.includes(cleanTag) ? t.tags : [...(t.tags || []), cleanTag] }
        : t))
      toast.success(`Tagged ${res.data.tagged} with #${cleanTag}`)
      clearSelection()
    } catch {
      toast.error('Bulk tag failed')
    } finally { setBulkBusy(false) }
  }

  const onCSVUpload = async (file: File | null) => {
    if (!file) return
    setImporting(true)
    const id = toast.loading(`Importing ${file.name}…`)
    try {
      const res = await txAPI.importCSV(file)
      toast.dismiss(id)
      const n = res.data.inserted
      const errors = res.data.errors as string[]
      if (n > 0) toast.success(`Imported ${n} transactions`, { description: errors.length ? `${errors.length} rows skipped` : undefined })
      else toast.error('No rows imported', { description: errors[0] })
      await load()
    } catch (e: any) {
      toast.dismiss(id); toast.error(e?.response?.data?.detail || 'Import failed')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const load = useCallback(() => {
    setLoading(true)
    let start: string, end: string
    if (rangeIdx === -1) {
      start = customStart; end = customEnd
    } else {
      const r = getRange(RANGES[rangeIdx].days)
      start = r.start; end = r.end
    }
    return txAPI.list(start, end)
      .then(res => setTxs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTxs([]))
      .finally(() => setLoading(false))
  }, [rangeIdx, customStart, customEnd])

  const loadPlaid = useCallback(() => {
    plaidAPI.status()
      .then(res => setPlaid(res.data))
      .catch(() => setPlaid({ connected: false }))
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadPlaid() }, [loadPlaid])

  // Open Add modal via ?add=1 (e.g. from command palette / keyboard shortcut)
  const [params, setParams] = useSearchParams()
  useEffect(() => {
    if (params.get('add') === '1') {
      setEditing(null); setModal(true)
      params.delete('add'); setParams(params, { replace: true })
    }
  }, [params, setParams])

  useEffect(() => {
    let out = txs
    if (search) out = out.filter(t =>
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(search.toLowerCase())
    )
    if (catFilter !== 'All') out = out.filter(t => t.category === catFilter)
    setFiltered(out)
    setVisibleCount(PAGE_SIZE) // reset pagination when filters change
  }, [txs, search, catFilter])

  const refresh = async () => {
    setRef(true)
    try {
      if (plaid?.connected) {
        const id = toast.loading('Syncing with bank…')
        try {
          const res = await plaidAPI.sync()
          toast.dismiss(id)
          const n = res?.data?.synced_transactions || 0
          if (n > 0) toast.success(`Synced ${n} new transaction${n === 1 ? '' : 's'}`)
          else toast.success('Up to date')
        } catch {
          toast.dismiss(id)
          toast.error('Sync failed')
        }
      }
      await load()
    } finally { setRef(false) }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    const victim = deleting
    setDelBusy(true)

    // Optimistic: remove from UI immediately
    setTxs(prev => prev.filter(t => t.id !== victim.id))
    setDeleting(null)
    setDelBusy(false)

    let undone = false
    const wasUndone = await toast.undoable(
      `Deleted "${victim.description}"`,
      () => { undone = true; setTxs(prev => [victim, ...prev].sort((a, b) => b.date.localeCompare(a.date))) }
    )
    if (wasUndone || undone) return

    // No undo within 5s → commit to server
    try {
      await txAPI.remove(victim.id)
    } catch {
      toast.error('Failed to delete — restoring transaction')
      setTxs(prev => [victim, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    }
  }

  const income   = txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const expenses = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const cats     = ['All', ...Array.from(new Set(txs.map(t => t.category))).sort()]

  const visible = filtered.slice(0, visibleCount)
  const tableCols = isMobile ? '1fr auto' : '1fr 130px 110px 130px 90px'

  // Group visible txs by date label (Today / Yesterday / weekday / date)
  const grouped = useMemo(() => {
    const groups: { label: string; items: typeof visible }[] = []
    for (const tx of visible) {
      const label = dateGroupLabel(new Date(tx.date))
      const last = groups[groups.length - 1]
      if (last && last.label === label) last.items.push(tx)
      else groups.push({ label, items: [tx] })
    }
    return groups
  }, [visible])

  const hasActiveFilters = !!search || catFilter !== 'All' || rangeIdx === -1
  const clearFilters = () => {
    setSearch('')
    setCat('All')
    setRangeIdx(1)
  }

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '36px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--parchment-deep)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeftRight size={19} style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-secondary)', margin: '3px 0 0' }}>{filtered.length} entries · {rangeIdx === -1 ? `${customStart} → ${customEnd}` : RANGES[rangeIdx].label}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <ConnectBank
            connected={plaid?.connected ? { institution: (plaid.count && plaid.count > 1) ? `${plaid.count} banks` : (plaid.institution || 'Bank') } : null}
            onChanged={() => { loadPlaid(); load() }}
            onSyncing={setRef}
          />
          <button onClick={refresh} title="Refresh"
            style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--parchment)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.75)' }}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <Tooltip content="Import CSV (Date, Description, Amount, Category)">
            <button onClick={() => fileInputRef.current?.click()} disabled={importing}
              style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--parchment)', cursor: importing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.75)' }}>
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            </button>
          </Tooltip>
          <input type="file" accept=".csv,text/csv" ref={fileInputRef} style={{ display: 'none' }}
            onChange={e => onCSVUpload(e.target.files?.[0] || null)} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { setEditing(null); setModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'var(--electric)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
            <Plus size={14} strokeWidth={2.5} />Add
          </motion.button>
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Income',   value: income,             bg: 'rgba(80,220,120,0.10)',  border: 'rgba(80,220,120,0.22)',  text: 'rgba(180,240,200,1)',  dotShadow: 'rgba(140,240,170,0.6)' },
          { label: 'Expenses', value: expenses,           bg: 'rgba(255,140,140,0.08)', border: 'rgba(255,140,140,0.20)', text: 'rgba(255,200,200,1)',  dotShadow: 'rgba(255,180,180,0.5)' },
          { label: 'Net',      value: income - expenses,  bg: 'rgba(180,140,255,0.08)', border: 'rgba(180,140,255,0.20)', text: '#fff',                  dotShadow: 'rgba(200,180,255,0.5)' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '9px 16px', borderRadius: 12,
            background: s.bg,
            border: `1px solid ${s.border}`,
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', gap: 9,
            boxShadow: `inset 0 1px 0 rgba(24,21,16,0.04)`,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.text, boxShadow: `0 0 10px ${s.dotShadow}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: s.text, letterSpacing: '-0.02em' }}>${Math.round(s.value).toLocaleString('en-US')}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBox value={search} onChange={setSearch} />
        <div style={{ display: 'inline-flex', gap: 2, padding: 3, borderRadius: 11, background: 'var(--surface-hover)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {RANGES.map((r, i) => (
            <button key={r.label} onClick={() => setRangeIdx(i)}
              style={{ padding: '6px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: rangeIdx === i ? '#fff' : 'transparent', color: rangeIdx === i ? '#000' : 'rgba(255,255,255,0.65)', transition: 'background 0.2s, color 0.2s' }}>
              {r.label}
            </button>
          ))}
          <button onClick={() => setRangeIdx(-1)}
            style={{ padding: '6px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: rangeIdx === -1 ? '#fff' : 'transparent', color: rangeIdx === -1 ? '#000' : 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.2s, color 0.2s' }}>
            <CalendarDays size={12} />Custom
          </button>
        </div>

        {rangeIdx === -1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 11, background: 'var(--parchment)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <input type="date" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)}
              style={{ padding: '5px 8px', borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: 12, outline: 'none',  }} />
            <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>→</span>
            <input type="date" value={customEnd} min={customStart} onChange={e => setCustomEnd(e.target.value)}
              style={{ padding: '5px 8px', borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: 12, outline: 'none',  }} />
          </div>
        )}

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
            onClick={clearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 11, border: '1px solid rgba(255,180,180,0.18)', background: 'rgba(255,180,180,0.06)', cursor: 'pointer', color: 'rgba(255,200,200,0.95)', fontSize: 12, fontWeight: 600 }}>
            <XIcon size={12} />Clear filters
          </motion.button>
        )}
      </div>

      {/* Category filter */}
      {cats.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: catFilter === c ? '#fff' : 'rgba(255,255,255,0.06)', color: catFilter === c ? '#000' : 'rgba(255,255,255,0.7)', transition: 'background 0.2s, color 0.2s' }}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ borderRadius: 18, background: 'rgba(20,20,22,0.5)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid var(--warm-border)', overflow: 'hidden' }}>
        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: tableCols, padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Transaction', 'Category', 'Date', 'Amount', ''].map((h, i) => (
              <span key={h || String(i)} style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 3 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
        )}

        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: tableCols, padding: '14px 16px', borderBottom: '1px solid rgba(24,21,16,0.04)', gap: 12 }}>
              {(isMobile ? [180, 60] : [180, 80, 60, 60, 40]).map((w, j) => (
                <div key={j} style={{ height: 12, borderRadius: 6, background: 'var(--parchment)', width: `${w}px`, maxWidth: '100%' }} />
              ))}
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ padding: '72px 24px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--parchment)', border: '1px solid var(--warm-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              {txs.length === 0 ? <Building2 size={24} style={{ color: 'var(--ink-muted)' }} /> : <FileIcon size={22} style={{ color: 'var(--ink-muted)' }} />}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {txs.length === 0 ? (plaid?.connected ? 'No transactions in this range' : 'Nothing here yet') : 'No matches'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '0 0 20px', maxWidth: 360, marginInline: 'auto' }}>
              {txs.length === 0
                ? (plaid?.connected ? 'Try widening the date range or refreshing the sync.' : 'Connect a bank to import transactions automatically, or add one manually.')
                : 'No transactions match your search and filters.'}
            </p>
            {txs.length === 0 && (
              <div style={{ display: 'inline-flex', gap: 8 }}>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { setEditing(null); setModal(true) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--parchment)', cursor: 'pointer', color: 'var(--ink)', fontSize: 13, fontWeight: 600 }}>
                  <Plus size={13} strokeWidth={2.5} />Add manually
                </motion.button>
                {!plaid?.connected && (
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={refresh}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'var(--electric)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                    <RefreshCw size={13} />Try refresh
                  </motion.button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {grouped.map((group, gi) => (
              <div key={`${group.label}-${gi}`}>
                <div style={{ padding: isMobile ? '14px 16px 8px' : '14px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: gi === 0 ? 'none' : '1px solid rgba(24,21,16,0.04)', background: 'rgba(24,21,16,0.015)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{group.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)' }}>{group.items.length} {group.items.length === 1 ? 'tx' : 'txs'}</span>
                </div>
                {group.items.map((tx, i) => {
                  const isIncome = tx.amount < 0
                  const absAmt   = Math.abs(tx.amount)
                  const color    = categoryColor(tx.category)
                  const currency = tx.currency || 'USD'
                  const isSelected = selected.has(tx.id)
                  return (
                    <motion.div key={tx.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.012, 0.15) }}
                      onClick={(e) => {
                        // shift-click or any click while in bulk mode → toggle selection
                        if (selected.size > 0 || (e as any).shiftKey) { toggleSelect(tx.id); return }
                        setDetailTx(tx)
                      }}
                      style={{ display: 'grid', gridTemplateColumns: tableCols, padding: isMobile ? '13px 16px' : '13px 20px', borderBottom: '1px solid rgba(24,21,16,0.05)', alignItems: 'center', opacity: tx.pending ? 0.78 : 1, cursor: 'pointer', transition: 'background 0.15s', gap: isMobile ? 12 : 0, background: isSelected ? 'rgba(24,21,16,0.04)' : 'transparent' }}
                      whileHover={{ background: isSelected ? 'rgba(24,21,16,0.05)' : 'rgba(255,255,255,0.025)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    {isSelected ? (
                      <div onClick={(e) => { e.stopPropagation(); toggleSelect(tx.id) }}
                        style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <CheckSquare size={15} style={{ color: '#000' }} strokeWidth={2.5} />
                      </div>
                    ) : tx.logo_url ? (
                      <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--warm-border)' }}>
                        <img src={tx.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: isIncome ? 'rgba(80,220,120,0.1)' : `${color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isIncome ? <ArrowUpRight size={13} style={{ color: 'rgba(120,230,160,1)' }} /> : <ArrowDownRight size={13} style={{ color }} />}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
                      <Tooltip content={tx.description}>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, display: 'block' }}>{tx.description}</span>
                      </Tooltip>
                      {isMobile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 16, background: `${color}22`, color }}>{tx.category}</span>
                          <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{formatDate(tx.date)}</span>
                          {tx.pending && <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,200,100,0.95)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pending</span>}
                        </div>
                      ) : (
                        tx.pending && <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,200,100,0.95)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pending</span>
                      )}
                    </div>
                  </div>
                  {!isMobile && (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: `${color}22`, color, width: 'fit-content' }}>{tx.category}</span>
                      <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{formatDate(tx.date)}</span>
                    </>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 700, color: isIncome ? 'rgba(140,240,170,1)' : '#fff', textAlign: 'right', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                    {isIncome ? '+' : '-'}{formatMoney(absAmt, currency)}
                  </span>
                  {!isMobile && (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditing(tx); setModal(true) }} title="Edit"
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--warm-border-strong)', background: 'var(--surface-hover)', cursor: 'pointer', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleting(tx) }} title="Delete"
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--warm-border-strong)', background: 'var(--surface-hover)', cursor: 'pointer', color: 'rgba(255,150,150,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                    </motion.div>
                  )
                })}
              </div>
            ))}
            {visible.length < filtered.length && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--parchment)', cursor: 'pointer', color: 'var(--ink)', fontSize: 12, fontWeight: 600 }}>
                  Load {Math.min(PAGE_SIZE, filtered.length - visible.length)} more · {visible.length} of {filtered.length}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 180,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px 10px 18px',
            borderRadius: 16,
            background: 'var(--surface)',
            border: '1px solid rgba(255,255,255,0.14)',
            
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{selected.size} selected</span>
          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)' }} />
          <button onClick={() => selectAll(filtered.map(t => t.id))}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--warm-border-strong)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', fontSize: 12, fontWeight: 600 }}>
            <Square size={11} />Select all ({filtered.length})
          </button>
          <button onClick={() => {
            const tag = window.prompt('Add tag to selected transactions:')
            if (tag) bulkTag(tag)
          }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--warm-border-strong)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', fontSize: 12, fontWeight: 600 }}>
            <Tag size={11} />Tag
          </button>
          <button onClick={bulkDelete} disabled={bulkBusy}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,120,120,0.25)', background: 'rgba(255,120,120,0.1)', cursor: bulkBusy ? 'default' : 'pointer', color: 'rgba(255,160,160,1)', fontSize: 12, fontWeight: 600 }}>
            {bulkBusy ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}Delete
          </button>
          <button onClick={clearSelection} title="Clear selection"
            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--warm-border-strong)', background: 'transparent', cursor: 'pointer', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon size={12} />
          </button>
        </motion.div>
      )}

      <TxModal open={modalOpen} initial={editing} onClose={() => { setModal(false); setEditing(null) }} onSaved={load} />
      <ConfirmDelete open={!!deleting} tx={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} busy={deleteBusy} />
      <TxDetailPanel
        tx={detailTx}
        open={!!detailTx}
        onClose={() => setDetailTx(null)}
        onSaved={(updates) => {
          if (!detailTx) return
          setTxs(prev => prev.map(t => t.id === detailTx.id ? { ...t, ...updates } : t))
          setDetailTx(prev => prev ? { ...prev, ...updates } : null)
        }}
      />
    </div>
  )
}
