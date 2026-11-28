import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'
import './styles/bootstrap-overrides.css'
import './styles/mobile.css'
import './styles/backoffice.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} basename={import.meta.env.BASE_URL} />
  </StrictMode>
)
