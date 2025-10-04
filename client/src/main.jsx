import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.jsx'
import { MedicineProvider } from '../src/context/medicationContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './context/notificationContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <NotificationProvider>
   <MedicineProvider>

    <App />
   </MedicineProvider>
   </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)







