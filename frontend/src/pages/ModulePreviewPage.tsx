import { Typography } from 'antd'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ModulePreviewBoard } from '../components/organisms/ModulePreviewBoard'
import { ModuleWorkspaceNav, type ModuleWorkspaceTab } from '../components/organisms/ModuleWorkspaceNav'
import { MetricStrip } from '../components/templates/MetricStrip'
import { PageIntro } from '../components/templates/PageIntro'
import { WorkspaceTemplate } from '../components/templates/WorkspaceTemplate'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getErpModule, type ErpModule } from '../lib/mock-data/erpModules'
import { getModulePreviewMeta } from '../lib/mock-data/modulePreviewMeta'

type ModulePreviewPageProps = {
  moduleSlug: Exclude<ErpModule['slug'], 'finance' | 'mail'>
}

export function ModulePreviewPage({ moduleSlug }: ModulePreviewPageProps) {
  const module = getErpModule(moduleSlug)
  const [activeTab, setActiveTab] = useState<ModuleWorkspaceTab>('overview')

  if (!module || !module.processes?.length) {
    return <Navigate to="/erp" replace />
  }

  const moduleData = module
  const processTemplates = moduleData.processes ?? []
  const meta = getModulePreviewMeta(moduleSlug)
  const firstRoadmapStep = meta.roadmap[0]

  const processCards = processTemplates.map((process, index) => ({
    name: process,
    stage: index === 0 ? 'Primary entry point' : index === 1 ? 'Secondary flow' : 'Specialized review',
  }))

  function renderContextRail() {
    return (
      <>
        <Card padding="md" className="space-y-4">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
              Module profile
            </p>
            <Typography.Title level={5} className="!mb-1 !mt-2 !text-[var(--as-text-primary)]">
              Planned for {meta.primaryPersona}
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
              This rail stays stable so users always know the target operator, layout direction, and delivery posture.
            </Typography.Paragraph>
          </div>

          <div className="space-y-2 text-xs text-[var(--as-text-secondary)]">
            <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
              Target layout: {meta.futureLayout}
            </div>
            <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
              Recommended operator: {meta.primaryPersona}
            </div>
            <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
              Module status: {moduleData.status}
            </div>
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Delivery focus
          </p>
          <div className="rounded-[var(--as-radius-md)] border border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] px-3 py-3 text-xs leading-6 text-[var(--as-text-secondary)]">
            {firstRoadmapStep}
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Required integrations
          </p>
          <div className="flex flex-wrap gap-2">
            {meta.requiredIntegrations.map((integration) => (
              <Badge key={integration} variant="muted">
                {integration}
              </Badge>
            ))}
          </div>
        </Card>
      </>
    )
  }

  function renderOverview() {
    return (
      <>
        <div className="pt-2 lg:pt-3">
          <MetricStrip
            items={[
              { label: 'Status', value: moduleData.status },
              { label: 'Processes', value: processTemplates.length },
              { label: 'CTA mode', value: moduleData.cta },
              { label: 'Layout type', value: meta.futureLayout },
            ]}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <Card padding="lg" className="space-y-5">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
                Workspace blueprint
              </p>
              <Typography.Title level={4} className="!mb-1 !mt-2 !text-[var(--as-text-primary)]">
                Reusable floorplan before backend delivery
              </Typography.Title>
              <Typography.Paragraph className="!mb-0 !text-sm !leading-7 !text-[var(--as-text-secondary)]">
                The page now separates orientation, process mapping, readiness, and roadmap so future modules inherit a clear ERP structure instead of a single mixed mockup surface.
              </Typography.Paragraph>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[var(--as-radius-lg)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-4 py-3">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)]">
                  Primary persona
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--as-text-primary)]">{meta.primaryPersona}</p>
              </div>
              <div className="rounded-[var(--as-radius-lg)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-4 py-3">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)]">
                  Future layout
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--as-text-primary)]">{meta.futureLayout}</p>
              </div>
              <div className="rounded-[var(--as-radius-lg)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-4 py-3">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)]">
                  Next milestone
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--as-text-primary)]">{firstRoadmapStep}</p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="space-y-4 bg-[var(--as-bg-secondary)]">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
                User orientation
              </p>
              <Typography.Title level={5} className="!mb-1 !mt-2 !text-[var(--as-text-primary)]">
                What users should understand first
              </Typography.Title>
            </div>

            <div className="space-y-3 text-xs text-[var(--as-text-secondary)]">
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3">
                This module opens with orientation first, instead of mixing roadmap and implementation notes into the same surface.
              </div>
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3">
                Process architecture lives in its own section so operators can scan the flow model quickly.
              </div>
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3">
                Readiness and roadmap are now planning context, not part of the core workspace overview.
              </div>
            </div>
          </Card>
        </div>

        <section className="space-y-4">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
              Process map
            </p>
            <Typography.Paragraph className="!mb-0 !mt-2 !text-sm !leading-7 !text-[var(--as-text-secondary)]">
              This block describes the operating model the module will eventually expose as a real ERP workspace.
            </Typography.Paragraph>
          </div>
          <ModulePreviewBoard module={moduleData} futureLayout={meta.futureLayout} />
        </section>
      </>
    )
  }

  function renderProcesses() {
    return (
      <div className="space-y-5">
        <Card padding="lg" className="space-y-3 bg-[var(--as-bg-secondary)]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Process catalog
          </p>
          <Typography.Title level={4} className="!mb-0 !text-[var(--as-text-primary)]">
            Business flows grouped as reusable surfaces
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 !text-sm !leading-7 !text-[var(--as-text-secondary)]">
            Each process is defined as a future module entry point so the page can evolve into list, detail, or workbench views without redesigning the whole module.
          </Typography.Paragraph>
        </Card>

        <section className="grid gap-4 xl:grid-cols-2">
          {processCards.map((process, index) => (
            <Card key={process.name} padding="md" className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                    {process.stage}
                  </Typography.Text>
                  <Typography.Title level={5} className="!mb-0.5 !mt-1 !text-[var(--as-text-primary)]">
                    {process.name}
                  </Typography.Title>
                  <Typography.Paragraph className="!mb-0 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
                    Planned as a reusable module surface with operational inputs, review outputs, and durable traceability.
                  </Typography.Paragraph>
                </div>
                <Badge variant="muted">Mock {index + 1}</Badge>
              </div>

              <div className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2 text-xs text-[var(--as-text-secondary)]">
                Designed to keep inputs, execution state, and review output visible in stable positions.
              </div>
            </Card>
          ))}
        </section>
      </div>
    )
  }

  function renderReadiness() {
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        <Card padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Implementation readiness
          </p>
          <div className="space-y-2 text-xs text-[var(--as-text-secondary)]">
            {meta.readinessNotes.map((note) => (
              <div
                key={note}
                className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2"
              >
                {note}
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Dependencies
          </p>
          <div className="flex flex-wrap gap-2">
            {meta.requiredIntegrations.map((integration) => (
              <Badge key={integration} variant="muted">
                {integration}
              </Badge>
            ))}
          </div>
          <Typography.Paragraph className="!mb-0 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
            The module should stay in mockup until these data and integration surfaces exist with a stable contract.
          </Typography.Paragraph>
        </Card>
      </div>
    )
  }

  function renderRoadmap() {
    return (
      <div className="space-y-5">
        <Card padding="lg" className="space-y-3 bg-[var(--as-bg-secondary)]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Delivery sequencing
          </p>
          <Typography.Title level={4} className="!mb-0 !text-[var(--as-text-primary)]">
            Promote the module in visible stages
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 !text-sm !leading-7 !text-[var(--as-text-secondary)]">
            The roadmap stays separate from the overview so planning context does not overload the main module surface.
          </Typography.Paragraph>
        </Card>

        <Card padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Roadmap
          </p>
          <div className="space-y-3">
            {meta.roadmap.map((step, index) => (
              <div
                key={step}
                className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-3"
              >
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)]">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-xs leading-6 text-[var(--as-text-secondary)]">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <AppShell>
      <WorkspaceTemplate
        intro={
          <PageIntro
            eyebrow="Planned workspace"
            title={`${module.title} preview`}
            description={moduleData.description}
            chips={
              <>
                <Badge variant="info">Preview workspace</Badge>
                <Badge variant="muted">{processTemplates.length} process templates</Badge>
                <Badge variant="muted">{moduleData.status}</Badge>
              </>
            }
            actions={
              <Link to="/erp">
                <Button variant="secondary" size="sm">View modules</Button>
              </Link>
            }
          />
        }
        secondary={renderContextRail()}
      >
        <ModuleWorkspaceNav value={activeTab} onChange={setActiveTab} />
        {activeTab === 'overview'
          ? renderOverview()
          : activeTab === 'processes'
            ? renderProcesses()
            : activeTab === 'readiness'
              ? renderReadiness()
              : renderRoadmap()}
      </WorkspaceTemplate>
    </AppShell>
  )
}
