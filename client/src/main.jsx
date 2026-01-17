import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.jsx'
import { MedicineProvider } from '../src/context/medicationContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './context/notificationContext.jsx'
import { SocketProvider } from './context/socketContext.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
    <SocketProvider>
    <NotificationProvider>
   <MedicineProvider>

    <App />
   </MedicineProvider>
   </NotificationProvider>
   </SocketProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)







