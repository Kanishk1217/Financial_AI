/**
 * FinanceAI logo mark — a money coin.
 * Gold tile with an espresso coin + currency stroke. Quiet-luxe palette.
 */
export function LogoMark({
  size = 36,
  radius = 10,
}: {
  size?: number
  radius?: number
}) {
  const ink = '#1A1407' // espresso, for contrast on gold
  return (
    <div style={{
      width: size, height: size,
      borderRadius: radius,
      background: '#C9A24B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(201,162,75,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
    }}>
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62} height={size * 0.62}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Coin */}
        <circle cx="12" cy="12" r="8" stroke={ink} strokeWidth="1.9" />
        {/* Currency stroke — the dollar bar + S */}
        <path
          d="M12 6.6 L12 17.4"
          stroke={ink}
          strokeWidth="1.9"
        />
        <path
          d="M14.4 9 C14.4 7.9 13.3 7.4 12 7.4 C10.5 7.4 9.6 8.1 9.6 9.2 C9.6 10.3 10.7 10.7 12 11 C13.3 11.3 14.4 11.8 14.4 12.9 C14.4 14 13.5 14.7 12 14.7 C10.7 14.7 9.6 14.2 9.6 13.1"
          stroke={ink}
          strokeWidth="1.9"
        />
      </svg>
    </div>
  )
}
