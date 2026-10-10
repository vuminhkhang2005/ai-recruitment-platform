import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { MyApplicationsProvider } from './context/MyApplicationsContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'

import { RealtimeProvider } from './realtime/RealtimeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <RealtimeProvider>
              <ToastProvider>
                <MyApplicationsProvider>
                  <App />
                </MyApplicationsProvider>
              </ToastProvider>
            </RealtimeProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
