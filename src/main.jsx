import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyThemeToDocument, getStoredTheme } from './theme.js'

import { ConfirmProvider } from './components/ConfirmProvider.jsx'
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx'

applyThemeToDocument(getStoredTheme())

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppErrorBoundary>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </AppErrorBoundary>
    </StrictMode>,
)
