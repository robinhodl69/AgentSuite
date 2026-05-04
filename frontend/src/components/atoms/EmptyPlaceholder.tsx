import { Empty } from 'antd'
import type { ReactNode } from 'react'

interface EmptyPlaceholderProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyPlaceholder({
  title = 'No data available',
  description = 'There is nothing to show here yet.',
  icon,
  action,
}: EmptyPlaceholderProps) {
  return (
    <div className="rounded-[var(--as-radius-lg)] border border-dashed border-[var(--as-border-default)] bg-[var(--as-bg-primary)]/60 p-6">
      <Empty
        image={icon ?? Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold text-[var(--as-text-secondary)]">{title}</p>
            <p className="text-xs text-[var(--as-text-muted)]">{description}</p>
          </div>
        }
      />
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  )
}
