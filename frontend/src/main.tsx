import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ClerkAuthProvider } from './providers/ClerkAuthProvider'
import '@blossom-carousel/react/style.css'
import 'leaflet/dist/leaflet.css'
import './styles/global.css'
import './register-sw'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkAuthProvider><App /></ClerkAuthProvider>
  </StrictMode>,
)
