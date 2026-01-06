import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.jsx'
import { MedicineProvider } from '../src/context/medicationContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './context/notificationContext.jsx'
import { SocketProvider } from './context/socketContext.jsx'
import { NetworkProvider } from './context/NetworkContext.jsx'
import {
  enqueueAction,
  getAllActions,
  removeAction,
} from "./services/offline/actionQueue";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <NotificationProvider>
          <MedicineProvider>
            <NetworkProvider>

              <App />
            </NetworkProvider>
          </MedicineProvider>
        </NotificationProvider>
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>,
)







