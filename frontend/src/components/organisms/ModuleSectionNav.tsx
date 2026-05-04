import { Typography } from 'antd'
import { NavLink } from 'react-router-dom'
import { Card } from '../ui/Card'

export type ModuleSectionNavItem = {
  label: string
  description: string
  to: string
  end?: boolean
}

type ModuleSectionNavProps = {
  title?: string
  description?: string
  items: ModuleSectionNavItem[]
}

export function ModuleSectionNav({
  title = 'Module sections',
  description = 'Split each module into stable work areas so users can move by intention instead of scanning one overloaded page.',
  items,
}: ModuleSectionNavProps) {
  return (
    <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
      <div>
        <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
          {title}
        </Typography.Text>
        <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
          {description}
        </Typography.Paragraph>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'rounded-[var(--as-radius-lg)] border px-4 py-3 transition-colors',
                isActive
                  ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)]'
                  : 'border-[var(--as-border-default)] bg-[var(--as-bg-primary)] hover:border-[var(--as-border-strong)]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <div className="space-y-1.5">
                <p
                  className={[
                    'font-mono text-[11px] font-semibold uppercase tracking-[0.14em]',
                    isActive ? 'text-[var(--as-accent)]' : 'text-[var(--as-text-primary)]',
                  ].join(' ')}
                >
                  {item.label}
                </p>
                <p className="text-xs leading-5 text-[var(--as-text-secondary)]">{item.description}</p>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </Card>
  )
}
