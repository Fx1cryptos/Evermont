import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { App } from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

const root = document.getElementById('root')!
// Prerendered HTML is replaced (not hydrated) so auth-dependent UI never mismatches.
root.innerHTML = ''
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
)
