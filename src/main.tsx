import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'

const PerfMonitor = lazy(() => import('./pages/PerfMonitor'))
const Architecture = lazy(() => import('./pages/Architecture'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/perf/monitor" element={<Suspense fallback={null}><PerfMonitor /></Suspense>} />
        <Route path="/architecture" element={<Suspense fallback={null}><Architecture /></Suspense>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
