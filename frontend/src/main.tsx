import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './lib/auth.tsx'
import { DensityProvider } from './lib/density.tsx'
import { AppThemeProvider } from './lib/ui-theme.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <AuthProvider>
          <DensityProvider>
            <App />
          </DensityProvider>
        </AuthProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
