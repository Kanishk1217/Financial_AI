import { type CSSProperties, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  style?: CSSProperties
  className?: string
  variant?: 'subtle' | 'vivid' | 'amber' | 'success' | 'danger'
}

const variants: Record<NonNullable<Props['variant']>, string> = {
  subtle:  'linear-gradient(180deg, #F0EDE6 0%, rgba(240,237,230,0.6) 100%)',
  vivid:   'linear-gradient(135deg, #ffffff 0%, #3382F7 60%, #1F9D63 100%)',
  amber:   'linear-gradient(135deg, #D4A84B 0%, #B8882A 100%)',
  success: 'linear-gradient(180deg, #4ADE80 0%, #1F9D63 100%)',
  danger:  'linear-gradient(180deg, #F87171 0%, #C4362A 100%)',
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
