import React from 'react'
import Display from './Display'
// import { AppProvider } from './context/AppContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppProvider } from './context/AppsContext'

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Display/>
      </Router>
    </AppProvider>
  )
}

export default App
