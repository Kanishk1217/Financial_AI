import { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard, Wallet, Landmark, PiggyBank, TrendingUp, Building2,
  Loader2, RefreshCw, Unplug, AlertCircle,
} from 'lucide-react'
import { usePlaidLink } from 'react-plaid-link'
import { plaidAPI } from '@/lib/api'
import { GlowCard } from '@/components/ui/GlowCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

type PlaidAccount = {
  account_id: string
  name: string
  type: string
  subtype: string | null
  balance: number
  currency: string
  institution?: string
  item_id?: string
}

type PlaidItem = {
  item_id: string
  institution: string
  connected_at: string
}

const ICONS: Record<string, typeof Wallet> = {
  depository: Wallet,
  credit: CreditCard,
  loan: Landmark,
  investment: TrendingUp,
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

function ConnectInline({ onConnected }: { onConnected: () => void }) {
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
    try {
      await plaidAPI.exchangeToken(publicToken)
      onConnected()
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Could not connect bank')
    } finally { setLinkToken(null) }
  }, [onConnected])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: () => setLinkToken(null),
  })

  useEffect(() => { if (linkToken && ready) open() }, [linkToken, ready, open])

  return (
    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={fetchToken} disabled={loading}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 12, border: 'none', cursor: loading ? 'default' : 'pointer', background: 'var(--electric)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Building2 size={15} />}
      Connect a Bank
      {error && <span style={{ fontSize: 11, color: 'var(--rose)', marginLeft: 8 }}>{error}</span>}
    </motion.button>
  )
}

export default function Accounts() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<PlaidAccount[] | null>(null)
  const [status, setStatus] = useState<{ connected: boolean; institution?: string; items?: PlaidItem[]; count?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([plaidAPI.status(), plaidAPI.accounts()])
      setStatus(s.data)
      setAccounts(Array.isArray(a.data) ? a.data : [])
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = async () => {
    setRefreshing(true)
    try {
      await plaidAPI.sync().catch(() => null)
      await load()
    } finally { setRefreshing(false) }
  }

  const disconnectItem = async (item_id?: string) => {
    setDisconnectingId(item_id || 'all')
    try { await plaidAPI.disconnect(item_id); await load() }
    finally { setDisconnectingId(null) }
  }

  // Aggregate by account type
  const grouped = (accounts || []).reduce<Record<string, PlaidAccount[]>>((acc, a) => {
    const k = a.type
    ;(acc[k] = acc[k] || []).push(a)
    return acc
  }, {})

  const assetTypes = new Set(['depository', 'investment'])
  const liabilityTypes = new Set(['credit', 'loan'])

  const totalAssets = (accounts || [])
    .filter(a => assetTypes.has(a.type))
    .reduce((s, a) => s + a.balance, 0)
  const totalLiabilities = (accounts || [])
    .filter(a => liabilityTypes.has(a.type))
    .reduce((s, a) => s + a.balance, 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <div style={{ padding: 36, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--parchment-deep)', border: '1px solid var(--warm-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={19} style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>Accounts</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-secondary)', margin: '3px 0 0' }}>
              {status?.connected
                ? `${status.count} bank${status.count === 1 ? '' : 's'} · ${(accounts || []).length} account${(accounts || []).length === 1 ? '' : 's'}`
                : 'No bank connected'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {status?.connected && (
            <button onClick={refresh} disabled={refreshing} title="Refresh from bank"
              style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid var(--warm-border)', background: 'var(--parchment)', cursor: refreshing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-secondary)' }}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
          )}
          <ConnectInline onConnected={load} />
        </div>
      </div>

      {/* Connected banks list */}
      {status?.connected && (status.items?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {status.items!.map(item => (
            <div key={item.item_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px 7px 12px', borderRadius: 11, background: 'var(--emerald-dim)', border: '1px solid rgba(31,157,99,0.22)' }}>
              <Building2 size={13} style={{ color: 'var(--emerald)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--emerald)' }}>{item.institution}</span>
              <button onClick={() => disconnectItem(item.item_id)} disabled={disconnectingId === item.item_id} title="Disconnect this bank"
                style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'var(--rose-dim)', cursor: disconnectingId === item.item_id ? 'default' : 'pointer', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {disconnectingId === item.item_id ? <Loader2 size={11} className="animate-spin" /> : <Unplug size={11} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Net Worth Hero */}
      {!loading && status?.connected && (accounts || []).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
          <GlowCard padding={32} radius={22} glowColor={netWorth < 0 ? 'rgba(255,140,140,0.18)' : 'rgba(140,240,170,0.18)'}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Net Worth</p>
            <p style={{ fontSize: 48, fontWeight: 900, color: netWorth < 0 ? 'var(--rose)' : 'var(--ink)', letterSpacing: '-0.045em', margin: '8px 0 22px', lineHeight: 1 }}>
              {netWorth < 0 ? '-' : ''}$<AnimatedNumber value={Math.abs(netWorth)} decimals={2} />
            </p>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 10, color: 'var(--ink-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Assets</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--emerald)', margin: '5px 0 0', letterSpacing: '-0.025em' }}>
                  $<AnimatedNumber value={totalAssets} decimals={2} />
                </p>
              </div>
              <div style={{ width: 1, background: 'var(--parchment-deep)', margin: '0 4px' }} />
              <div>
                <p style={{ fontSize: 10, color: 'var(--ink-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Liabilities</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--rose)', margin: '5px 0 0', letterSpacing: '-0.025em' }}>
                  $<AnimatedNumber value={totalLiabilities} decimals={2} />
                </p>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 124, borderRadius: 18, background: 'var(--surface-hover)', border: '1px solid var(--warm-border)' }} />
          ))}
        </div>
      )}

      {/* No connection empty state */}
      {!loading && !status?.connected && (
        <div style={{ padding: '80px 24px', textAlign: 'center', borderRadius: 22, background: 'rgba(24,21,16,0.02)', border: '1px dashed var(--warm-border-strong)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--parchment)', border: '1px solid var(--warm-border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Building2 size={28} style={{ color: 'var(--ink-muted)' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Connect your first bank</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '0 0 20px', maxWidth: 420, marginInline: 'auto' }}>
            Link your accounts via Plaid to see live balances, sync transactions automatically, and track your real net worth.
          </p>
          <ConnectInline onConnected={load} />
        </div>
      )}

      {/* Accounts grouped by type */}
      {!loading && status?.connected && (accounts || []).length > 0 && (
        <>
          {(['depository', 'credit', 'loan', 'investment'] as const).map(type => {
            const list = grouped[type]
            if (!list || list.length === 0) return null
            const Icon = ICONS[type] || PiggyBank
            const label = type === 'depository' ? 'Cash & Savings'
                        : type === 'credit'     ? 'Credit Cards'
                        : type === 'loan'       ? 'Loans'
                        : 'Investments'
            return (
              <div key={type} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Icon size={14} style={{ color: 'var(--ink-muted)' }} />
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</h2>
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>· {list.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {list.map((a, i) => {
                    const glow = type === 'credit' ? 'rgba(255,180,120,0.20)'
                               : type === 'loan'   ? 'rgba(255,150,150,0.20)'
                               : type === 'investment' ? 'rgba(180,140,255,0.20)'
                               :                      'rgba(150,210,255,0.20)'
                    return (
                      <motion.div key={a.account_id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => navigate(`/transactions?account=${a.account_id}`)}
                        style={{ cursor: 'pointer' }}>
                        <GlowCard padding={20} radius={18} glowColor={glow}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 11,
                              background: type === 'credit' ? 'rgba(255,180,120,0.12)'
                                       : type === 'loan'   ? 'rgba(255,150,150,0.12)'
                                       : type === 'investment' ? 'rgba(180,140,255,0.12)'
                                       :                      'rgba(150,210,255,0.12)',
                              border: `1px solid ${glow}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
                            }}>
                              <Icon size={17} style={{
                                color: type === 'credit' ? 'var(--amber)'
                                     : type === 'loan'   ? 'var(--rose)'
                                     : type === 'investment' ? '#7A52CC'
                                     :                      'var(--electric)',
                              }} />
                            </div>
                            {a.subtype && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 6, background: 'var(--parchment)', border: '1px solid var(--warm-border)' }}>
                                {a.subtype.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--ink-secondary)', margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>{a.name}</p>
                          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', margin: '6px 0 0', letterSpacing: '-0.035em', lineHeight: 1 }}>
                            $<AnimatedNumber value={a.balance} decimals={2} />
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--ink-muted)', margin: '6px 0 0', fontWeight: 500 }}>{a.currency}</p>
                        </GlowCard>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Plaid error info */}
          {(accounts || []).length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 18, border: '1px solid var(--amber-border)', background: 'var(--amber-dim)' }}>
              <AlertCircle size={20} style={{ color: 'var(--amber)' }} />
              <p style={{ fontSize: 13, color: 'var(--amber)', margin: '8px 0 0' }}>Connected but no accounts returned. Try refreshing.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
