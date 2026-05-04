import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

type MetricItem = {
  label: string
  value: ReactNode
  helper?: ReactNode
}

export function MetricStrip({ items }: { items: MetricItem[] }) {
  return (
    <section className="grid gap-4 xl:gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} padding="md">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
            {item.label}
          </p>
          <div className="mt-1.5 text-2xl font-semibold text-[var(--as-text-primary)]">{item.value}</div>
          {item.helper ? (
            <div className="mt-1.5 text-xs leading-5 text-[var(--as-text-secondary)]">{item.helper}</div>
          ) : null}
        </Card>
      ))}
    </section>
  )
}
