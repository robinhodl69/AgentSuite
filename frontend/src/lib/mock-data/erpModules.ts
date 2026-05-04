export type ErpModule = {
  slug: string
  title: string
  description: string
  status: string
  processes?: string[]
  href: string
  cta: string
  featured?: boolean
  icon: string
}

export const erpModules: ErpModule[] = [
  {
    slug: 'mail',
    title: 'Mail',
    description:
      'Email-first intake, message triage, and agent-triggered workflow routing across the ERP.',
    href: '/erp/mail',
    cta: 'Open',
    status: 'Live',
    featured: true,
    icon: 'mail',
    processes: [
      'Inbound request classification',
      'Trigger agent workflows from email',
      'Approval and exception routing',
    ],
  },
  {
    slug: 'finance',
    title: 'Finance',
    description:
      'Treasury, bank reconciliation, supplier payments, and budget control operated by agents.',
    href: '/erp/finance',
    cta: 'Operate',
    status: 'Live',
    featured: true,
    icon: 'finance',
    processes: [
      'AI-assisted bank reconciliation',
      'Supplier payment evaluation and execution',
      'Budget control with preventive alerts',
    ],
  },
  {
    slug: 'procurement',
    title: 'Procurement',
    description:
      'Intelligent sourcing, vendor scoring, and purchase order optimization.',
    status: 'In development',
    href: '/erp/procurement',
    cta: 'Preview',
    icon: 'procurement',
    processes: [
      'Purchase order evaluation by policy',
      'Automatic vendor scoring',
      'Contract renewal and compliance tracking',
    ],
  },
  {
    slug: 'inventory',
    title: 'Inventory',
    description:
      'Demand forecasting, automatic replenishment, and stock reconciliation.',
    status: 'In development',
    href: '/erp/inventory',
    cta: 'Preview',
    icon: 'inventory',
    processes: [
      'SKU-level demand forecasting',
      'Automatic replenishment with thresholds',
      'Cycle count reconciliation',
    ],
  },
  {
    slug: 'sales',
    title: 'Sales & CRM',
    description:
      'Lead scoring, quote generation, and pipeline risk detection.',
    status: 'In development',
    href: '/erp/sales',
    cta: 'Preview',
    icon: 'sales',
    processes: [
      'Lead scoring and enrichment',
      'Quote generation with policy',
      'Opportunity risk detection',
    ],
  },
  {
    slug: 'operations',
    title: 'Operations',
    description:
      'Production planning, quality control, and predictive maintenance.',
    status: 'In development',
    href: '/erp/operations',
    cta: 'Preview',
    icon: 'operations',
    processes: [
      'Production planning and capacity',
      'Quality control with rejection threshold',
      'Predictive maintenance by asset',
    ],
  },
  {
    slug: 'hr',
    title: 'Human Resources',
    description:
      'Payroll validation, expense compliance, and headcount forecasting.',
    status: 'In development',
    href: '/erp/hr',
    cta: 'Preview',
    icon: 'hr',
    processes: [
      'Payroll and deduction validation',
      'Expense policy compliance',
      'Headcount and turnover forecasting',
    ],
  },
  {
    slug: 'projects',
    title: 'Projects',
    description:
      'Budget vs. actual tracking, milestone risk, and resource allocation.',
    status: 'In development',
    href: '/erp/projects',
    cta: 'Preview',
    icon: 'projects',
    processes: [
      'Budget vs. actual tracking',
      'Milestone risk detection',
      'Optimal resource allocation',
    ],
  },
  {
    slug: 'analytics',
    title: 'Analytics',
    description:
      'Natural language queries, anomaly detection, and predictive alerts.',
    status: 'In development',
    href: '/erp/analytics',
    cta: 'Preview',
    icon: 'analytics',
    processes: [
      'Natural language data queries',
      'Automatic anomaly detection',
      'Predictive KPI alerts',
    ],
  },
]

export function getErpModule(slug: ErpModule['slug']) {
  return erpModules.find((module) => module.slug === slug)
}
