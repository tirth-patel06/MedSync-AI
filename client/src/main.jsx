import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.jsx'
import { MedicineProvider } from '../src/context/medicationContext.jsx'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
   <MedicineProvider>

    <App />
   </MedicineProvider>
    </BrowserRouter>
  </StrictMode>,
)







