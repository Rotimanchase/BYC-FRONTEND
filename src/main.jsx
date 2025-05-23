import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppsProvider } from './context/AppsContext.jsx'

createRoot(document.getElementById('root')).render(
  <AppsProvider>
    <App />
  </AppsProvider>
)
