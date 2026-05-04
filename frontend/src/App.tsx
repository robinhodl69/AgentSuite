import { Navigate, Route, Routes } from 'react-router-dom'
import { CreateTaskPage } from './pages/CreateTaskPage'
import { ErpPage } from './pages/ErpPage'
import { FinanceHistoryPage } from './pages/FinanceHistoryPage'
import { FinanceModuleLayout } from './pages/FinanceModuleLayout'
import { FinanceOverviewPage } from './pages/FinanceOverviewPage'
import { FinanceOperationsPage } from './pages/FinancePage'
import { FinanceRunDetailPage } from './pages/FinanceRunDetailPage'
import { HomePage } from './pages/HomePage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { IntegrationsPage } from './pages/IntegrationsPage'
import { LoginPage } from './pages/LoginPage'
import { PublicIntegrationsPage } from './pages/PublicIntegrationsPage'
import { MailPage } from './pages/MailPage'
import { ModulePreviewPage } from './pages/ModulePreviewPage'
import { SecurityPage } from './pages/SecurityPage'
import { BookDemoPage } from './pages/BookDemoPage'
import { UseCasesPage } from './pages/UseCasesPage'
import { RequireAuth } from './lib/auth'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/use-cases" element={<UseCasesPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/integrations" element={<PublicIntegrationsPage />} />
      <Route path="/book-demo" element={<BookDemoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/erp/integrations" element={<IntegrationsPage />} />
        <Route path="/erp" element={<ErpPage />} />
        <Route path="/erp/create-task" element={<CreateTaskPage />} />
        <Route path="/erp/mail" element={<MailPage />} />
        <Route path="/erp/finance" element={<FinanceModuleLayout />}>
          <Route index element={<FinanceOverviewPage />} />
          <Route path="operations" element={<FinanceOperationsPage />} />
          <Route path="history" element={<FinanceHistoryPage />} />
          <Route path="history/:runId" element={<FinanceRunDetailPage />} />
        </Route>
        <Route path="/erp/procurement" element={<ModulePreviewPage moduleSlug="procurement" />} />
        <Route path="/erp/inventory" element={<ModulePreviewPage moduleSlug="inventory" />} />
        <Route path="/erp/sales" element={<ModulePreviewPage moduleSlug="sales" />} />
        <Route path="/erp/operations" element={<ModulePreviewPage moduleSlug="operations" />} />
        <Route path="/erp/hr" element={<ModulePreviewPage moduleSlug="hr" />} />
        <Route path="/erp/projects" element={<ModulePreviewPage moduleSlug="projects" />} />
        <Route path="/erp/analytics" element={<ModulePreviewPage moduleSlug="analytics" />} />
      </Route>
      <Route path="/erp/finanzas" element={<Navigate to="/erp/finance" replace />} />
      <Route path="/erp/finanzas/historial" element={<Navigate to="/erp/finance/history" replace />} />
      <Route path="/integraciones" element={<Navigate to="/integrations" replace />} />
      <Route path="/erp/integraciones" element={<Navigate to="/erp/integrations" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
