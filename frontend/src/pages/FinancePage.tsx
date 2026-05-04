import { Link } from 'react-router-dom'
import { FinanceDashboard } from '../components/finance/FinanceDashboard'
import { ModuleSectionIntro } from '../components/templates/ModuleSectionIntro'
import { WorkbenchTemplate } from '../components/templates/WorkbenchTemplate'
import { Button } from '../components/ui/Button'

export function FinanceOperationsPage() {
  return (
    <WorkbenchTemplate
      intro={
        <ModuleSectionIntro
          eyebrow="Finance operations"
          title="Operational workbench"
          description="Run reconciliation, supplier payments, and budget control from the execution surface of the Finance module."
          actions={
            <Link to="/erp/finance/history">
              <Button variant="secondary" size="sm">View history</Button>
            </Link>
          }
        />
      }
    >
      <FinanceDashboard />
    </WorkbenchTemplate>
  )
}
