import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Collapse, Descriptions, Typography } from 'antd'
import { ExecutionTimeline, RunOutputPanel, RunStatusBadge } from '../components/finance/RunPresentation'
import {
  formatDate,
  formatLabel,
  mapAuditToLogs,
} from '../components/finance/runPresentationUtils'
import { DetailHeader } from '../components/templates/DetailHeader'
import { DetailWorkspaceTemplate } from '../components/templates/DetailWorkspaceTemplate'
import { InspectorRail } from '../components/templates/InspectorRail'
import { MetricStrip } from '../components/templates/MetricStrip'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { getAudit, getRun, type AgentRunRecord, type AuditEvent } from '../lib/api/agent'

function summarizeValue(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? '' : 's'}`
  }
  if (value && typeof value === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} field(s)`
  }
  if (typeof value === 'string') {
    return value.length > 60 ? `${value.slice(0, 57)}...` : value
  }
  return String(value)
}

export function FinanceRunDetailPage() {
  const { runId } = useParams<{ runId: string }>()
  const [run, setRun] = useState<AgentRunRecord | null>(null)
  const [audit, setAudit] = useState<AuditEvent[] | null>(null)
  const [loading, setLoading] = useState(() => Boolean(runId))
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(() => (runId ? null : 'Invalid run.'))

  async function loadRunDetail(mode: 'initial' | 'refresh' = 'initial') {
    if (!runId) {
      return
    }

    if (mode === 'refresh') {
      setRefreshing(true)
    }

    try {
      const [runResponse, auditResponse] = await Promise.all([getRun(runId), getAudit(runId)])
      setRun(runResponse)
      setAudit(auditResponse)
      setError(null)
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load run.')
    } finally {
      if (mode === 'refresh') {
        setRefreshing(false)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!runId) {
      return
    }

    let cancelled = false

    void Promise.all([getRun(runId), getAudit(runId)])
      .then(([runResponse, auditResponse]) => {
        if (cancelled) {
          return
        }
        setRun(runResponse)
        setAudit(auditResponse)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return
        }
        setError(loadError instanceof Error ? loadError.message : 'Unable to load run.')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [runId])

  const inputSnapshot = useMemo(() => Object.entries(run?.input_payload ?? {}), [run?.input_payload])

  return (
    loading ? (
      <Card>
        <div className="p-5 text-xs text-[var(--as-text-secondary)]">Loading run detail...</div>
      </Card>
    ) : error ? (
      <EmptyState
        title="Unable to load run"
        description={error}
        action={
          runId ? (
            <Button
              size="sm"
              onClick={() => {
                setLoading(true)
                void loadRunDetail()
              }}
            >
              Retry
            </Button>
          ) : undefined
        }
      />
    ) : run ? (
      <DetailWorkspaceTemplate
        header={
          <DetailHeader
            eyebrow="Finance run detail"
            title={run.run_id}
            description="Review the complete result of a Finance run: persisted inputs, audit trace, and final process output."
            status={<RunStatusBadge status={run.status} />}
            metadata={
              <>
                <Badge variant="info">{formatLabel(run.process_type)}</Badge>
                <Badge variant="muted">{run.company_id ?? 'No company'}</Badge>
                <Badge variant="muted">
                  {run.actor_role ? run.actor_role.replace(/_/g, ' ') : 'No actor role'}
                </Badge>
              </>
            }
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void loadRunDetail('refresh')}
                  disabled={!runId}
                  isLoading={refreshing}
                >
                  Refresh detail
                </Button>
                <Link to="/erp/finance/history">
                  <Button variant="secondary" size="sm">
                    Back to history
                  </Button>
                </Link>
              </>
            }
          />
        }
        summary={
          <MetricStrip
            items={[
              { label: 'Process', value: formatLabel(run.process_type) },
              { label: 'Created at', value: formatDate(run.created_at) },
              { label: 'Audit events', value: (audit ?? run.audit_log).length },
              {
                label: 'Actor role',
                value: run.actor_role ? run.actor_role.replace(/_/g, ' ') : 'n/a',
              },
            ]}
          />
        }
        inspector={
          <>
            <InspectorRail
              title="Audit timeline"
              description="Stage-by-stage trace collected for this run."
            >
              <ExecutionTimeline
                logs={mapAuditToLogs(audit ?? run.audit_log)}
                emptyMessage="No audit events for this run."
              />
            </InspectorRail>
            <InspectorRail
              title="Output inspector"
              description="Structured result, decisions, and derived output."
            >
              <RunOutputPanel
                run={run}
                audit={audit}
                emptyMessage="No output available for this run."
              />
            </InspectorRail>
          </>
        }
      >
        <Card padding="md" className="space-y-3">
          <div className="space-y-1.5">
            <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
              Run identity
            </Typography.Text>
            <Typography.Title level={5} className="!mb-0 !font-mono !text-[var(--as-text-primary)]">
              {run.run_id}
            </Typography.Title>
          </div>

          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, md: 2, xl: 3 }}
            items={[
              {
                key: 'company',
                label: 'Company',
                children: run.company_id ?? 'n/a',
              },
              {
                key: 'actor',
                label: 'Actor role',
                children: run.actor_role ? run.actor_role.replace(/_/g, ' ') : 'n/a',
              },
              {
                key: 'events',
                label: 'Audit events',
                children: (audit ?? run.audit_log).length,
              },
            ]}
          />
        </Card>

        <Card padding="md" className="space-y-3">
          <div>
            <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
              Input snapshot
            </Typography.Text>
            <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
              Durable trace of what was submitted to the agent for this run.
            </Typography.Paragraph>
          </div>

          {inputSnapshot.length ? (
            <>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {inputSnapshot.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-3"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono">
                      {formatLabel(key)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--as-text-primary)]">
                      {summarizeValue(value)}
                    </p>
                  </div>
                ))}
              </div>

              <Collapse
                ghost
                items={[
                  {
                    key: 'input-payload',
                    label: 'View full submitted payload',
                    children: (
                      <pre className="overflow-x-auto rounded-[var(--as-radius-sm)] bg-[var(--as-bg-primary)] p-2.5 text-[11px] leading-5 text-[var(--as-text-secondary)] font-mono">
                        {JSON.stringify(run.input_payload, null, 2)}
                      </pre>
                    ),
                  },
                ]}
              />
            </>
          ) : (
            <EmptyState
              title="No input payload recorded"
              description="This run does not expose a persisted input payload yet."
            />
          )}
        </Card>
      </DetailWorkspaceTemplate>
    ) : (
      <EmptyState
        title="Run not found"
        description="The requested run is no longer available in this workspace."
        action={
          <Link to="/erp/finance/history">
            <Button size="sm">Back to history</Button>
          </Link>
        }
      />
    )
  )
}
