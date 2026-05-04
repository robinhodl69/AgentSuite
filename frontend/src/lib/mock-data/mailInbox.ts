export type MailFolder =
  | 'inbox'
  | 'needsReview'
  | 'agentDraft'
  | 'waitingApproval'
  | 'executed'
  | 'exceptions'

export type MailModule = 'Finance' | 'Procurement' | 'HR' | 'Tasks'

export type AgentStatus =
  | 'Unclassified'
  | 'Ready to run'
  | 'Needs approval'
  | 'Draft prepared'
  | 'Executed'
  | 'Blocked'

export type MailThread = {
  id: string
  sender: string
  senderEmail: string
  subject: string
  preview: string
  receivedAt: string
  unread: boolean
  folder: MailFolder
  module: MailModule
  intent: string
  suggestedWorkflow: string
  confidence: string
  risk: 'Low' | 'Medium' | 'High'
  agentStatus: AgentStatus
  summary: string
  body: string[]
  attachments: string[]
  linkedEntities: string[]
  missingData: string[]
}

export const mailFolders: Array<{ key: MailFolder; label: string; count: number }> = [
  { key: 'inbox', label: 'Inbox', count: 18 },
  { key: 'needsReview', label: 'Needs review', count: 6 },
  { key: 'agentDraft', label: 'Agent draft', count: 4 },
  { key: 'waitingApproval', label: 'Waiting approval', count: 3 },
  { key: 'executed', label: 'Executed', count: 9 },
  { key: 'exceptions', label: 'Exceptions', count: 2 },
]

export const mailModuleFilters: Array<MailModule> = ['Finance', 'Procurement', 'HR', 'Tasks']

export const mailThreads: MailThread[] = [
  {
    id: 'mail-001',
    sender: 'Laura Gomez',
    senderEmail: 'ap@northwind-supplies.com',
    subject: 'Urgent payment release for INV-2038',
    preview: 'Sharing the invoice PDF and asking if payment can be released before Thursday due to shipping hold.',
    receivedAt: '08:42',
    unread: true,
    folder: 'needsReview',
    module: 'Finance',
    intent: 'Supplier payment request',
    suggestedWorkflow: 'Finance > Supplier payments > Evaluate batch',
    confidence: '94%',
    risk: 'Medium',
    agentStatus: 'Ready to run',
    summary: 'The agent identified a supplier payment request with enough context to trigger the supplier payments evaluation flow.',
    body: [
      'Hi team, we need confirmation that invoice INV-2038 can be released before Thursday. Logistics is blocking the shipment until payment status is updated.',
      'Attached are the invoice PDF and bank details. Please let us know if anything else is needed from our side.',
    ],
    attachments: ['INV-2038.pdf', 'bank-details.pdf'],
    linkedEntities: ['Vendor: Northwind Supplies', 'Invoice: INV-2038', 'Finance policy: supplier-payments'],
    missingData: [],
  },
  {
    id: 'mail-002',
    sender: 'Treasury Bot',
    senderEmail: 'notifications@bank-sync.example',
    subject: 'Statement file available for reconciliation',
    preview: 'Daily statement export is ready and can be attached to the reconciliation workflow.',
    receivedAt: '07:55',
    unread: false,
    folder: 'inbox',
    module: 'Finance',
    intent: 'Bank statement intake',
    suggestedWorkflow: 'Finance > Reconciliation > Run reconciliation',
    confidence: '97%',
    risk: 'Low',
    agentStatus: 'Ready to run',
    summary: 'The message matches the reconciliation intake pattern and can prefill the statement import flow.',
    body: [
      'Daily statement export is ready for account MX-OPERATIONS-01.',
      'The file can be passed to the reconciliation agent along with open invoices and posted expense records.',
    ],
    attachments: ['statement-2026-05-04.csv'],
    linkedEntities: ['Bank account: MX-OPERATIONS-01', 'Process: reconciliation'],
    missingData: ['Expense records snapshot'],
  },
  {
    id: 'mail-003',
    sender: 'Monica Ruiz',
    senderEmail: 'procurement@agentsuite.internal',
    subject: 'Draft PO approval reply prepared',
    preview: 'The agent drafted a reply for the procurement exception and is waiting for your approval before sending.',
    receivedAt: 'Yesterday',
    unread: false,
    folder: 'agentDraft',
    module: 'Procurement',
    intent: 'Approval response draft',
    suggestedWorkflow: 'Create task > Approval follow-up',
    confidence: '86%',
    risk: 'Low',
    agentStatus: 'Draft prepared',
    summary: 'The agent prepared an outbound reply explaining the procurement exception and proposing next steps.',
    body: [
      'A draft reply has been prepared for the delayed PO approval request.',
      'The message proposes a temporary approval path and requests missing contract renewal context before final execution.',
    ],
    attachments: ['draft-reply.txt'],
    linkedEntities: ['Task: approval-follow-up', 'Vendor: Helix Components'],
    missingData: [],
  },
  {
    id: 'mail-004',
    sender: 'CFO Office',
    senderEmail: 'cfo@agentsuite.internal',
    subject: 'Approve emergency supplier payment over threshold',
    preview: 'Needs executive sign-off because the amount is above the automatic policy threshold.',
    receivedAt: 'Yesterday',
    unread: true,
    folder: 'waitingApproval',
    module: 'Finance',
    intent: 'Approval request',
    suggestedWorkflow: 'Finance > Supplier payments > Execute payment',
    confidence: '91%',
    risk: 'High',
    agentStatus: 'Needs approval',
    summary: 'The payment can proceed, but the amount is above policy. The message is waiting for executive approval before execution.',
    body: [
      'This supplier payment exceeds the standard automatic release threshold.',
      'The agent recommends execution due to shipment risk, but approval is required from the CFO office before funds are released.',
    ],
    attachments: ['approval-pack.pdf'],
    linkedEntities: ['Approval rule: treasury-threshold', 'Invoice batch: MAY-04-URGENT'],
    missingData: [],
  },
  {
    id: 'mail-005',
    sender: 'People Ops',
    senderEmail: 'hr@agentsuite.internal',
    subject: 'Expense reimbursement exception for review',
    preview: 'A reimbursement request arrived without policy code and needs classification.',
    receivedAt: 'Mon',
    unread: false,
    folder: 'exceptions',
    module: 'HR',
    intent: 'Expense exception',
    suggestedWorkflow: 'Create task > Manual review',
    confidence: '62%',
    risk: 'Medium',
    agentStatus: 'Blocked',
    summary: 'The message likely belongs to an expense exception flow, but required policy metadata is missing.',
    body: [
      'An employee reimbursement email arrived without a cost center or policy code.',
      'The agent cannot classify it confidently enough to route it automatically, so it was sent to exceptions.',
    ],
    attachments: ['receipt.jpg'],
    linkedEntities: ['Employee: Daniela P.', 'Policy group: expenses'],
    missingData: ['Policy code', 'Cost center'],
  },
  {
    id: 'mail-006',
    sender: 'Execution Agent',
    senderEmail: 'agent@agentsuite.internal',
    subject: 'Supplier payment batch executed successfully',
    preview: 'The payment instruction was executed and the audit trail has been persisted.',
    receivedAt: 'Mon',
    unread: false,
    folder: 'executed',
    module: 'Finance',
    intent: 'Execution confirmation',
    suggestedWorkflow: 'Finance > History > Run detail',
    confidence: '99%',
    risk: 'Low',
    agentStatus: 'Executed',
    summary: 'The payment batch completed and the email acts as a durable execution confirmation with traceability.',
    body: [
      'The supplier payment batch was executed successfully and the run has been stored in Finance history.',
      'Use the linked run detail to inspect the audit trail, payment credentials, and final output.',
    ],
    attachments: ['run-summary.json'],
    linkedEntities: ['Run: pay-2026-05-03-001', 'Finance history'],
    missingData: [],
  },
]
