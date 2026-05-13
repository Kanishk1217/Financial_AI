import { type CSSProperties, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  style?: CSSProperties
  className?: string
  /** "subtle" = white → grey (default), "vivid" = colorful */
  variant?: 'subtle' | 'vivid' | 'success' | 'danger'
}

const variants: Record<NonNullable<Props['variant']>, string> = {
  subtle:  'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)',
  vivid:   'linear-gradient(135deg, #ffffff 0%, #c8b4ff 50%, #8ed4ff 100%)',
  success: 'linear-gradient(180deg, #c4f9d6 0%, rgba(120,230,160,0.7) 100%)',
  danger:  'linear-gradient(180deg, #ffcfcf 0%, rgba(255,140,140,0.75) 100%)',
}

export function GradientText({ children, style, className, variant = 'subtle' }: Props) {
  return (
    <span
      className={className}
      style={{
        background: variants[variant],
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
