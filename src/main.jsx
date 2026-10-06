import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import SituationDashboard from './SituationDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SituationDashboard />
  </StrictMode>,
)
