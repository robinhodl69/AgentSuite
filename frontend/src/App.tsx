import { Navigate, Route, Routes } from 'react-router-dom'
import { ErpPage } from './pages/ErpPage'
import { FinancePage } from './pages/FinancePage'
import { FinanceHistoryPage } from './pages/FinanceHistoryPage'
import { FinanceRunDetailPage } from './pages/FinanceRunDetailPage'
import { HomePage } from './pages/HomePage'
import { IntegrationsPage } from './pages/IntegrationsPage'
import { ModulePreviewPage } from './pages/ModulePreviewPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/integraciones" element={<IntegrationsPage />} />
      <Route path="/erp" element={<ErpPage />} />
      <Route path="/erp/finanzas" element={<FinancePage />} />
      <Route path="/erp/finanzas/historial" element={<FinanceHistoryPage />} />
      <Route path="/erp/finanzas/historial/:runId" element={<FinanceRunDetailPage />} />
      <Route path="/erp/compras" element={<ModulePreviewPage moduleSlug="compras" />} />
      <Route path="/erp/operaciones" element={<ModulePreviewPage moduleSlug="operaciones" />} />
      <Route path="/erp/rrhh" element={<ModulePreviewPage moduleSlug="rrhh" />} />
      <Route path="/erp/finance" element={<Navigate to="/erp/finanzas" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
