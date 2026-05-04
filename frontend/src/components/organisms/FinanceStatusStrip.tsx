import { Alert, Statistic } from 'antd'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

type FinanceStatusStripProps = {
  agentStatus: 'checking' | 'online' | 'offline'
  agentError: string | null
  configuredAgentUrl: string
}

export function FinanceStatusStrip({
  agentStatus,
  agentError,
  configuredAgentUrl,
}: FinanceStatusStripProps) {
  const statusLabel =
    agentStatus === 'checking' ? 'Checking' : agentStatus === 'online' ? 'Online' : 'Offline'

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={agentStatus === 'online' ? 'success' : agentStatus === 'offline' ? 'error' : 'info'}>
          {agentStatus === 'checking'
            ? 'Checking agent'
            : agentStatus === 'online'
              ? 'Online'
              : 'Agent unavailable'}
        </Badge>
        <Badge variant="muted">{configuredAgentUrl}</Badge>
      </div>

      {agentError ? (
        <Alert
          type="error"
          showIcon
          message="Finance agent unavailable"
          description={
            <span>
              Could not validate the Finance agent. Make sure it is running at{' '}
              <code className="rounded bg-[var(--as-bg-elevated)] px-1.5 py-0.5 text-[var(--as-text-primary)] font-mono">
                {configuredAgentUrl}
              </code>
              .
            </span>
          }
        />
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card padding="md" className="h-full bg-[var(--as-bg-secondary)]">
          <Statistic
            title="Agent status"
            value={statusLabel}
            valueStyle={{ color: 'var(--as-text-primary)', fontSize: 18, fontWeight: 600 }}
          />
        </Card>

        <Card padding="md" className="h-full bg-[var(--as-bg-secondary)]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Agent endpoint
          </p>
          <p className="mt-2 break-all text-sm text-[var(--as-text-primary)]">{configuredAgentUrl}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--as-text-secondary)]">
            Finance actions execute against this workspace endpoint.
          </p>
        </Card>
      </div>
    </section>
  )
}
