import { AppstoreOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { Divider, Typography } from 'antd'
import { Link } from 'react-router-dom'
import type { ErpModule } from '../../lib/mock-data/erpModules'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ModuleIcon } from '../ui/ModuleIcon'

type ModuleCatalogProps = {
  title: string
  description?: string
  modules: ErpModule[]
  variant: 'live' | 'upcoming'
}

function ModuleCard({ module, variant }: { module: ErpModule; variant: 'live' | 'upcoming' }) {
  return (
    <Card
      hover
      className={[
        'flex h-full flex-col',
        variant === 'upcoming' ? 'border-dashed bg-[var(--as-bg-secondary)]/60' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex h-10 w-10 items-center justify-center rounded-[var(--as-radius-md)] border',
              variant === 'live'
                ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]'
                : 'border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] text-[var(--as-text-muted)]',
            ].join(' ')}
          >
            <ModuleIcon slug={module.slug} className="h-5 w-5" />
          </div>
          <div>
            <Typography.Title level={5} className="!mb-1 !text-[var(--as-text-primary)]">
              {module.title}
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
              {module.description}
            </Typography.Paragraph>
          </div>
        </div>
        <Badge variant={variant === 'live' ? 'success' : 'muted'}>
          {variant === 'live' ? 'Live' : module.status}
        </Badge>
      </div>

      {module.processes?.length ? (
        <>
          <Divider className="!my-4 !border-[var(--as-border-default)]" />
          <div className="space-y-2">
            {module.processes.slice(0, 3).map((process) => (
              <div
                key={process}
                className="flex items-start gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2"
              >
                <AppstoreOutlined className="mt-0.5 text-[11px] text-[var(--as-text-muted)]" />
                <Typography.Text className="!text-xs !leading-5 !text-[var(--as-text-secondary)]">
                  {process}
                </Typography.Text>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="mt-auto pt-4">
        <Link to={module.href}>
          <Button variant={variant === 'live' ? 'primary' : 'secondary'} size="sm">
            {module.cta}
            <ArrowRightOutlined />
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export function ModuleCatalog({ title, description, modules, variant }: ModuleCatalogProps) {
  return (
    <section className="space-y-5">
      <div>
        <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
          {title}
        </Typography.Text>
        {description ? (
          <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
            {description}
          </Typography.Paragraph>
        ) : null}
      </div>

      <div className="grid gap-4 xl:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} variant={variant} />
        ))}
      </div>
    </section>
  )
}
