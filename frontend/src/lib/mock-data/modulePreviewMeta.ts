import type { ErpModule } from './erpModules'

type ModulePreviewMeta = {
  futureLayout: 'Operational workbench' | 'List workspace' | 'Control center'
  primaryPersona: string
  requiredIntegrations: string[]
  readinessNotes: string[]
  roadmap: string[]
}

const modulePreviewMeta: Record<Exclude<ErpModule['slug'], 'finance' | 'mail'>, ModulePreviewMeta> = {
  procurement: {
    futureLayout: 'Operational workbench',
    primaryPersona: 'Procurement manager',
    requiredIntegrations: ['ERP vendors', 'Contracts', 'Email approvals'],
    readinessNotes: [
      'Needs supplier master data and purchase policy thresholds.',
      'Requires approval chains and contract renewal context.',
    ],
    roadmap: [
      'Finalize process catalog and approval checkpoints.',
      'Connect vendor scoring and sourcing data inputs.',
      'Promote to full operational workbench.',
    ],
  },
  inventory: {
    futureLayout: 'Operational workbench',
    primaryPersona: 'Inventory planner',
    requiredIntegrations: ['Warehouse system', 'Demand signals', 'Supplier lead times'],
    readinessNotes: [
      'Needs SKU master data and replenishment thresholds.',
      'Requires inventory snapshots and cycle count events.',
    ],
    roadmap: [
      'Define replenishment and cycle count views.',
      'Integrate demand forecasting inputs.',
      'Promote to full operational workbench.',
    ],
  },
  sales: {
    futureLayout: 'List workspace',
    primaryPersona: 'Revenue operations',
    requiredIntegrations: ['CRM', 'Email', 'Quote engine'],
    readinessNotes: [
      'Needs account, opportunity, and activity data.',
      'Requires quote policy and lead scoring criteria.',
    ],
    roadmap: [
      'Define lead and quote list surfaces.',
      'Add detail layout for opportunity review.',
      'Promote to list + detail workspace.',
    ],
  },
  operations: {
    futureLayout: 'Operational workbench',
    primaryPersona: 'Operations lead',
    requiredIntegrations: ['Production data', 'Quality logs', 'Asset telemetry'],
    readinessNotes: [
      'Needs production orders and capacity constraints.',
      'Requires maintenance and quality event feeds.',
    ],
    roadmap: [
      'Map core production flows and exceptions.',
      'Add quality and maintenance control blocks.',
      'Promote to full operational workbench.',
    ],
  },
  hr: {
    futureLayout: 'List workspace',
    primaryPersona: 'HR operations',
    requiredIntegrations: ['Payroll', 'Expense platform', 'People data'],
    readinessNotes: [
      'Needs employee master data and payroll calendars.',
      'Requires expense policy and compliance rules.',
    ],
    roadmap: [
      'Define payroll and expense review lists.',
      'Add employee detail inspector layout.',
      'Promote to list + detail workspace.',
    ],
  },
  projects: {
    futureLayout: 'Control center',
    primaryPersona: 'PMO',
    requiredIntegrations: ['Project plans', 'Budget tracking', 'Resource allocation'],
    readinessNotes: [
      'Needs milestone, budget, and staffing baselines.',
      'Requires variance and risk alert logic.',
    ],
    roadmap: [
      'Define portfolio overview and risk surfaces.',
      'Add project detail and allocation views.',
      'Promote to control center layout.',
    ],
  },
  analytics: {
    futureLayout: 'Control center',
    primaryPersona: 'Business analyst',
    requiredIntegrations: ['Warehouse', 'BI sources', 'Alert channels'],
    readinessNotes: [
      'Needs semantic metric layer and anomaly rules.',
      'Requires alert routing and saved query model.',
    ],
    roadmap: [
      'Define metric explorer and anomaly overview.',
      'Add saved views and alert control center.',
      'Promote to control center layout.',
    ],
  },
}

export function getModulePreviewMeta(slug: Exclude<ErpModule['slug'], 'finance' | 'mail'>) {
  return modulePreviewMeta[slug]
}
