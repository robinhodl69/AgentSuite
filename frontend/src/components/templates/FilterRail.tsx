import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

type FilterRailProps = {
  title?: string
  description?: string
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function FilterRail({
  title = 'Filters',
  description,
  actions,
  footer,
  children,
}: FilterRailProps) {
  return (
    <Card padding="md" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
            {title}
          </p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-[var(--as-text-secondary)]">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>

      {children}

      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--as-text-muted)]">
          {footer}
        </div>
      ) : null}
    </Card>
  )
}
