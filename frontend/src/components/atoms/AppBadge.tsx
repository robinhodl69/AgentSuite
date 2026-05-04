import { Tag } from 'antd'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted'

interface AppBadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]',
  success: 'border-[var(--as-success)]/15 bg-[var(--as-success-subtle)] text-[var(--as-success)]',
  warning: 'border-[var(--as-warning)]/15 bg-[var(--as-warning-subtle)] text-[var(--as-warning)]',
  error: 'border-[var(--as-error)]/15 bg-[var(--as-error-subtle)] text-[var(--as-error)]',
  info: 'border-[rgba(86,156,214,0.2)] bg-[rgba(86,156,214,0.08)] text-[#569CD6]',
  muted: 'border-[var(--as-border-default)] bg-transparent text-[var(--as-text-muted)]',
}

export function AppBadge({ variant = 'default', children, className = '' }: AppBadgeProps) {
  return (
    <Tag
      bordered
      className={[
        'm-0 rounded-[var(--as-radius-sm)] px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
