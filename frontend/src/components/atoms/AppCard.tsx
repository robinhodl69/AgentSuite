import { Card as AntCard } from 'antd'
import type { ReactNode } from 'react'

interface AppCardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'density'
  hover?: boolean
}

type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'density'

const paddingMap: Record<Exclude<CardPadding, 'density'>, number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 20,
}

export function AppCard({
  children,
  className = '',
  padding = 'density',
  hover = false,
}: AppCardProps) {
  const bodyPadding =
    padding === 'density' ? 'var(--as-density-pad-card)' : `${paddingMap[padding ?? 'md']}px`

  return (
    <AntCard
      bordered
      hoverable={hover}
      className={[
        'overflow-hidden rounded-[var(--as-radius-lg)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)]',
        className,
      ].join(' ')}
      styles={{
        body: {
          padding: bodyPadding,
        },
      }}
    >
      {children}
    </AntCard>
  )
}
