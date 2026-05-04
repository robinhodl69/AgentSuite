import { Input, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  mailFolders,
  mailModuleFilters,
  mailThreads,
  type AgentStatus,
  type MailFolder,
  type MailModule,
} from '../lib/mock-data/mailInbox'
import { MetricStrip } from '../components/templates/MetricStrip'
import { PageIntro } from '../components/templates/PageIntro'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

function statusVariant(status: AgentStatus): 'success' | 'warning' | 'error' | 'info' | 'muted' {
  switch (status) {
    case 'Ready to run':
    case 'Executed':
      return 'success'
    case 'Needs approval':
      return 'warning'
    case 'Blocked':
      return 'error'
    case 'Draft prepared':
      return 'info'
    default:
      return 'muted'
  }
}

function riskVariant(risk: 'Low' | 'Medium' | 'High'): 'success' | 'warning' | 'error' {
  if (risk === 'High') {
    return 'error'
  }
  if (risk === 'Medium') {
    return 'warning'
  }
  return 'success'
}

export function MailPage() {
  const [activeFolder, setActiveFolder] = useState<MailFolder>('inbox')
  const [activeModule, setActiveModule] = useState<'All' | MailModule>('All')
  const [search, setSearch] = useState('')
  const [selectedThreadId, setSelectedThreadId] = useState(mailThreads[0]?.id ?? '')

  const filteredThreads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return mailThreads.filter((thread) => {
      const matchesFolder = thread.folder === activeFolder
      const matchesModule = activeModule === 'All' || thread.module === activeModule
      const matchesSearch =
        normalizedSearch.length === 0 ||
        thread.sender.toLowerCase().includes(normalizedSearch) ||
        thread.subject.toLowerCase().includes(normalizedSearch) ||
        thread.preview.toLowerCase().includes(normalizedSearch)

      return matchesFolder && matchesModule && matchesSearch
    })
  }, [activeFolder, activeModule, search])

  const selectedThread =
    filteredThreads.find((thread) => thread.id === selectedThreadId) ?? filteredThreads[0] ?? mailThreads[0]

  return (
    <AppShell>
      <section className="space-y-7 lg:space-y-8">
        <PageIntro
          eyebrow="Primary workspace"
          title="Mail operations"
          description="Work from a real inbox surface: read inbound messages, let the agent detect intent, and decide whether to run a workflow, create a task, request approval, or route the message into the ERP."
          chips={
            <>
              <Badge variant="success">Live workspace</Badge>
              <Badge variant="info">Agent inbox</Badge>
              <Badge variant="muted">Email-first execution</Badge>
            </>
          }
          actions={
            <>
              <Link to="/erp/integrations">
                <Button variant="secondary" size="sm">
                  Open integrations
                </Button>
              </Link>
              <Link to="/erp/finance/operations">
                <Button size="sm">Trigger Finance</Button>
              </Link>
            </>
          }
        />

        <MetricStrip
          items={[
            { label: 'Unread', value: 12, helper: 'Messages waiting in active queues.' },
            { label: 'Ready to run', value: 5, helper: 'Threads the agent can execute now.' },
            { label: 'Waiting approval', value: 3, helper: 'Detected actions blocked by policy.' },
            { label: 'Blocked', value: 2, helper: 'Exceptions missing context or data.' },
          ]}
        />

        <section className="grid gap-4 xl:grid-cols-[220px_minmax(0,0.95fr)_420px]">
          <Card padding="md" className="space-y-5 bg-[var(--as-bg-secondary)]">
            <div>
              <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                Mailboxes
              </Typography.Text>
              <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
                Move between inbox states like a real email client, but grouped by agent posture.
              </Typography.Paragraph>
            </div>

            <div className="space-y-2">
              {mailFolders.map((folder) => {
                const isActive = folder.key === activeFolder

                return (
                  <button
                    key={folder.key}
                    type="button"
                    onClick={() => setActiveFolder(folder.key)}
                    className={[
                      'flex w-full items-center justify-between rounded-[var(--as-radius-md)] border px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)]'
                        : 'border-[var(--as-border-default)] bg-[var(--as-bg-primary)] hover:border-[var(--as-border-strong)]',
                    ].join(' ')}
                  >
                    <span className="text-sm text-[var(--as-text-primary)]">{folder.label}</span>
                    <span className="font-mono text-[11px] text-[var(--as-text-muted)]">{folder.count}</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-3">
              <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                Module filters
              </Typography.Text>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModule('All')}
                  className={[
                    'rounded-[var(--as-radius-md)] border px-3 py-1.5 text-xs transition-colors',
                    activeModule === 'All'
                      ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]'
                      : 'border-[var(--as-border-default)] text-[var(--as-text-secondary)]',
                  ].join(' ')}
                >
                  All
                </button>
                {mailModuleFilters.map((module) => (
                  <button
                    key={module}
                    type="button"
                    onClick={() => setActiveModule(module)}
                    className={[
                      'rounded-[var(--as-radius-md)] border px-3 py-1.5 text-xs transition-colors',
                      activeModule === module
                        ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]'
                        : 'border-[var(--as-border-default)] text-[var(--as-text-secondary)]',
                    ].join(' ')}
                  >
                    {module}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                  {mailFolders.find((folder) => folder.key === activeFolder)?.label ?? 'Inbox'}
                </Typography.Text>
                <Typography.Title level={4} className="!mb-0.5 !mt-1 !text-[var(--as-text-primary)]">
                  Shared inbox
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
                  Each row behaves like email first, with agent interpretation layered on top.
                </Typography.Paragraph>
              </div>
              <div className="w-full max-w-[280px]">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search sender, subject, or preview"
                  allowClear
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredThreads.length ? (
                filteredThreads.map((thread) => {
                  const isSelected = selectedThread?.id === thread.id

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={[
                        'w-full rounded-[var(--as-radius-md)] border px-4 py-3 text-left transition-colors',
                        isSelected
                          ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)]'
                          : 'border-[var(--as-border-default)] bg-[var(--as-bg-primary)] hover:border-[var(--as-border-strong)]',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {thread.unread ? (
                              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--as-accent)]" />
                            ) : null}
                            <span className="truncate text-sm font-semibold text-[var(--as-text-primary)]">
                              {thread.sender}
                            </span>
                            <span className="text-[11px] text-[var(--as-text-muted)]">{thread.senderEmail}</span>
                          </div>
                          <p className="mt-2 truncate text-sm text-[var(--as-text-primary)]">{thread.subject}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--as-text-secondary)]">
                            {thread.preview}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="muted">{thread.module}</Badge>
                            <Badge variant={statusVariant(thread.agentStatus)}>{thread.agentStatus}</Badge>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--as-text-muted)]">{thread.receivedAt}</span>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-[var(--as-radius-md)] border border-dashed border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-4 py-6 text-center text-xs text-[var(--as-text-muted)]">
                  No emails match the current mailbox and filters.
                </div>
              )}
            </div>
          </Card>

          {selectedThread ? (
            <div className="space-y-4">
              <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                      Message preview
                    </Typography.Text>
                    <Typography.Title level={4} className="!mb-0.5 !mt-1 !text-[var(--as-text-primary)]">
                      {selectedThread.subject}
                    </Typography.Title>
                    <Typography.Paragraph className="!mb-0 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
                      From {selectedThread.sender} · {selectedThread.senderEmail}
                    </Typography.Paragraph>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="muted">{selectedThread.module}</Badge>
                    <Badge variant={statusVariant(selectedThread.agentStatus)}>{selectedThread.agentStatus}</Badge>
                  </div>
                </div>

                <div className="space-y-3 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-4 py-4">
                  {selectedThread.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-[var(--as-text-secondary)]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>

              <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
                <div>
                  <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                    Agent summary
                  </Typography.Text>
                  <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
                    The agent reads the email, detects intent, and suggests the next ERP action before you run anything.
                  </Typography.Paragraph>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--as-text-muted)]">Intent detected</p>
                    <p className="mt-2 text-sm text-[var(--as-text-primary)]">{selectedThread.intent}</p>
                  </div>
                  <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--as-text-muted)]">Suggested workflow</p>
                    <p className="mt-2 text-sm text-[var(--as-text-primary)]">{selectedThread.suggestedWorkflow}</p>
                  </div>
                  <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--as-text-muted)]">Confidence</p>
                    <p className="mt-2 text-sm text-[var(--as-text-primary)]">{selectedThread.confidence}</p>
                  </div>
                  <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--as-text-muted)]">Risk</p>
                    <div className="mt-2">
                      <Badge variant={riskVariant(selectedThread.risk)}>{selectedThread.risk}</Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-[var(--as-radius-md)] border border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] px-3 py-3 text-sm leading-7 text-[var(--as-text-secondary)]">
                  {selectedThread.summary}
                </div>
              </Card>

              <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
                <div>
                  <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                    Agent actions
                  </Typography.Text>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Run agent</Button>
                  <Button variant="secondary" size="sm">Create task</Button>
                  <Button variant="secondary" size="sm">Request approval</Button>
                  <Button variant="secondary" size="sm">Draft reply</Button>
                </div>
                {selectedThread.missingData.length ? (
                  <div className="rounded-[var(--as-radius-md)] border border-[var(--as-warning)]/20 bg-[var(--as-warning-subtle)] px-3 py-3 text-xs leading-6 text-[var(--as-warning)]">
                    Missing data: {selectedThread.missingData.join(', ')}
                  </div>
                ) : null}
              </Card>

              <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
                <div>
                  <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                    Traceability
                  </Typography.Text>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--as-text-muted)]">Attachments</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedThread.attachments.map((attachment) => (
                        <Badge key={attachment} variant="muted">
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--as-text-muted)]">Linked entities</p>
                    <div className="mt-2 space-y-2">
                      {selectedThread.linkedEntities.map((entity) => (
                        <div
                          key={entity}
                          className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-2 text-xs text-[var(--as-text-secondary)]"
                        >
                          {entity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card padding="md" className="bg-[var(--as-bg-secondary)]">
              <div className="rounded-[var(--as-radius-md)] border border-dashed border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-4 py-6 text-center text-xs text-[var(--as-text-muted)]">
                Select a message to preview the email and the agent interpretation.
              </div>
            </Card>
          )}
        </section>
      </section>
    </AppShell>
  )
}
