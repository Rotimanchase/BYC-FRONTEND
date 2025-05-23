import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppsProvider } from './context/AppsContext.jsx'
// import { AppProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <AppsProvider>
    <App />
  </AppsProvider>
)
