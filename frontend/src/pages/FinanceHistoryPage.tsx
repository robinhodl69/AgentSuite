import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Input, Select, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RunStatusBadge } from '../components/finance/RunPresentation'
import { formatDate, formatLabel } from '../components/finance/runPresentationUtils'
import { FilterRail } from '../components/templates/FilterRail'
import { ListWorkspaceTemplate } from '../components/templates/ListWorkspaceTemplate'
import { MetricStrip } from '../components/templates/MetricStrip'
import { ModuleSectionIntro } from '../components/templates/ModuleSectionIntro'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import {
  type AgentRunRecord,
  type ProcessType,
  type RunStatus,
  listRuns,
} from '../lib/api/agent'

const pageSize = 6

const processOptions: Array<{ label: string; value: 'all' | ProcessType }> = [
  { label: 'All processes', value: 'all' },
  { label: 'Reconciliation', value: 'reconciliation' },
  { label: 'Supplier payments', value: 'supplier_payments' },
  { label: 'Budget control', value: 'budget_control' },
]

const statusOptions: Array<{ label: string; value: 'all' | RunStatus }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Queued', value: 'queued' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
  { label: 'Requires review', value: 'requires_review' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Failed', value: 'failed' },
]

export function FinanceHistoryPage() {
  const [runs, setRuns] = useState<AgentRunRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [processFilter, setProcessFilter] = useState<'all' | ProcessType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | RunStatus>('all')

  async function loadRuns(mode: 'initial' | 'refresh' = 'initial') {
    if (mode === 'refresh') {
      setRefreshing(true)
    }

    try {
      const response = await listRuns()
      const sortedRuns = [...response].sort(
        (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at),
      )
      setRuns(sortedRuns)
      setError(null)
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load history.')
    } finally {
      if (mode === 'refresh') {
        setRefreshing(false)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    void listRuns()
      .then((response) => {
        if (cancelled) {
          return
        }

        const sortedRuns = [...response].sort(
          (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at),
        )
        setRuns(sortedRuns)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load history.')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(
    () => ({
      total: runs.length,
      completed: runs.filter((run) => run.status === 'completed').length,
      requiresReview: runs.filter((run) => run.status === 'requires_review').length,
      blocked: runs.filter((run) => run.status === 'blocked').length,
      failed: runs.filter((run) => run.status === 'failed').length,
    }),
    [runs],
  )

  const filteredRuns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return runs.filter((run) => {
      const summary =
        typeof run.final_output?.summary === 'string' ? run.final_output.summary.toLowerCase() : ''

      const matchesSearch =
        normalizedSearch.length === 0 ||
        run.run_id.toLowerCase().includes(normalizedSearch) ||
        run.process_type.toLowerCase().includes(normalizedSearch) ||
        summary.includes(normalizedSearch)

      const matchesProcess = processFilter === 'all' || run.process_type === processFilter
      const matchesStatus = statusFilter === 'all' || run.status === statusFilter

      return matchesSearch && matchesProcess && matchesStatus
    })
  }, [processFilter, runs, search, statusFilter])

  const hasActiveFilters =
    search.trim().length > 0 || processFilter !== 'all' || statusFilter !== 'all'

  const columns = useMemo<ProColumns<AgentRunRecord>[]>(
    () => [
      {
        title: 'Process',
        dataIndex: 'process_type',
        width: 220,
        render: (_, run) => (
          <div className="space-y-1">
            <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.16em] !text-[var(--as-text-muted)]">
              {formatLabel(run.process_type)}
            </Typography.Text>
            <Typography.Text className="block font-mono !text-[var(--as-text-primary)]">
              {run.run_id}
            </Typography.Text>
          </div>
        ),
      },
      {
        title: 'Summary',
        dataIndex: ['final_output', 'summary'],
        ellipsis: true,
        render: (_, run) => (
          <Typography.Paragraph className="!mb-0 max-w-3xl !text-xs !leading-6 !text-[var(--as-text-secondary)]">
            {typeof run.final_output?.summary === 'string'
              ? run.final_output.summary
              : 'No summary available.'}
          </Typography.Paragraph>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 180,
        render: (_, run) => <RunStatusBadge status={run.status} />,
      },
      {
        title: 'Created at',
        dataIndex: 'created_at',
        width: 200,
        sorter: (left, right) => Date.parse(left.created_at) - Date.parse(right.created_at),
        defaultSortOrder: 'descend',
        render: (_, run) => (
          <span className="font-mono text-[11px] text-[var(--as-text-muted)]">
            {formatDate(run.created_at)}
          </span>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 150,
        render: (_, run) => (
          <Link to={`/erp/finance/history/${run.run_id}`}>
            <Button variant="secondary" size="sm">
              View detail
            </Button>
          </Link>
        ),
      },
    ],
    [],
  )

  function resetFilters() {
    setSearch('')
    setProcessFilter('all')
    setStatusFilter('all')
  }

  const emptyState = hasActiveFilters ? (
    <EmptyState
      title="No runs match the current filters"
      description="Try a broader search or clear the filters to recover the full Finance history."
      action={
        <Button size="sm" onClick={resetFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      title="No runs yet"
      description="No Finance runs have been recorded in this workspace yet. Operate a process to build durable history."
      action={
        <Link to="/erp/finance/operations">
          <Button size="sm">Open operations</Button>
        </Link>
      }
    />
  )

  return (
    <ListWorkspaceTemplate
      intro={
        <ModuleSectionIntro
          eyebrow="Finance history"
          title="Run history"
          description="Review durable Finance activity, narrow the execution history with operational filters, and open the full detail of each process run."
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void loadRuns('refresh')}
                isLoading={refreshing}
              >
                Refresh history
              </Button>
              <Link to="/erp/finance/operations">
                <Button variant="secondary" size="sm">
                  Open operations
                </Button>
              </Link>
            </>
          }
        />
      }
      metrics={
        <MetricStrip
          items={[
            { label: 'Total', value: stats.total },
            { label: 'Completed', value: stats.completed },
            { label: 'Requires review', value: stats.requiresReview },
            { label: 'Blocked / Failed', value: stats.blocked + stats.failed },
          ]}
        />
      }
      filters={
        <FilterRail
          description="Search by run ID, process or summary and narrow the visible operational history."
          actions={
            hasActiveFilters ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : null
          }
          footer={
            <>
              <span>
                Showing {filteredRuns.length} run(s)
                {hasActiveFilters ? ` filtered from ${runs.length}` : ''}
              </span>
              <span>Enterprise table view</span>
            </>
          }
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.7fr)]">
            <label className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono">
                Search
              </span>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search run ID, process or summary"
                allowClear
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono">
                Process
              </span>
              <Select
                value={processFilter}
                options={processOptions}
                onChange={(value) => setProcessFilter(value)}
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono">
                Status
              </span>
              <Select
                value={statusFilter}
                options={statusOptions}
                onChange={(value) => setStatusFilter(value)}
              />
            </label>
          </div>
        </FilterRail>
      }
      side={
        <Card padding="md" className="space-y-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
              View context
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--as-text-secondary)]">
              Use this list workspace to review execution posture before opening a run detail.
            </p>
          </div>
          <div className="space-y-2 text-xs text-[var(--as-text-secondary)]">
            <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
              Active filters: {hasActiveFilters ? 'Yes' : 'No'}
            </div>
            <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
              Page size: {pageSize}
            </div>
            <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
              Review queue: {stats.requiresReview + stats.blocked + stats.failed}
            </div>
          </div>
        </Card>
      }
    >
      {error ? (
        <EmptyState
          title="Error loading history"
          description={error}
          action={
            <Button
              size="sm"
              onClick={() => {
                setLoading(true)
                void loadRuns('initial')
              }}
            >
              Retry
            </Button>
          }
        />
      ) : (
        <ProTable<AgentRunRecord>
          rowKey="run_id"
          loading={loading || refreshing}
          search={false}
          options={false}
          toolBarRender={false}
          pagination={{
            pageSize,
            showSizeChanger: false,
          }}
          columns={columns}
          dataSource={filteredRuns}
          cardBordered
          tableStyle={{ background: 'transparent' }}
          locale={{ emptyText: emptyState }}
        />
      )}
    </ListWorkspaceTemplate>
  )
}
