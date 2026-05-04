import { ApiOutlined, LinkOutlined } from '@ant-design/icons'
import { Divider, Typography } from 'antd'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export type IntegrationItem = {
  name: string
  description: string
}

export function IntegrationCatalog({ integrations }: { integrations: readonly IntegrationItem[] }) {
  return (
    <section className="grid gap-4 xl:gap-5 md:grid-cols-2 xl:grid-cols-3">
      {integrations.map((integration) => (
        <Card key={integration.name} className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] text-[var(--as-text-secondary)]">
                <ApiOutlined />
              </div>
              <div>
                <Typography.Title level={5} className="!mb-1 !text-[var(--as-text-primary)]">
                  {integration.name}
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
                  {integration.description}
                </Typography.Paragraph>
              </div>
            </div>
            <Badge variant="muted">Mock</Badge>
          </div>

          <Divider className="!my-4 !border-[var(--as-border-default)]" />

          <div className="mt-auto flex items-center gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
            <LinkOutlined className="text-[11px] text-[var(--as-text-muted)]" />
            <span className="text-xs text-[var(--as-text-secondary)]">
              Enterprise connector surface planned
            </span>
          </div>
        </Card>
      ))}
    </section>
  )
}
