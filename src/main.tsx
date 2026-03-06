import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import SminexDemo from './pages/SminexDemo'

const PerfMonitor = lazy(() => import('./pages/PerfMonitor'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sminex" element={<SminexDemo />} />
        <Route path="/perf/monitor" element={<Suspense fallback={null}><PerfMonitor /></Suspense>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
