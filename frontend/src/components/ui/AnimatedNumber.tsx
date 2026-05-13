import NumberFlow from '@number-flow/react'

/**
 * Premium animated number with morphing digits (Linear / Vercel style).
 * Wraps @number-flow/react with our standard styling.
 * Use the `gradient` prop to render the number with a subtle white→grey gradient
 * (a CSS background-clip:text trick that NumberFlow inherits correctly).
 */
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
  gradient = false,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  style?: React.CSSProperties
  gradient?: 'subtle' | 'success' | 'danger' | 'vivid' | boolean
}) {
  const grads = {
    subtle:  'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)',
    vivid:   'linear-gradient(135deg, #ffffff 0%, #c8b4ff 50%, #8ed4ff 100%)',
    success: 'linear-gradient(180deg, #c4f9d6 0%, rgba(120,230,160,0.7) 100%)',
    danger:  'linear-gradient(180deg, #ffcfcf 0%, rgba(255,140,140,0.75) 100%)',
  }
  const gradStyle: React.CSSProperties = gradient
    ? {
        backgroundImage: grads[gradient === true ? 'subtle' : gradient],
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }
    : {}
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap', ...gradStyle, ...style }}>
      {prefix && <span>{prefix}</span>}
      <NumberFlow
        value={value}
        format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals }}
        transformTiming={{ duration: 700, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        spinTiming={{ duration: 700, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      />
      {suffix && <span>{suffix}</span>}
    </span>
  )
}
