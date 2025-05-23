import React from 'react'
import Display from './Display'
// import { AppProvider } from './context/AppContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppsProvider } from './context/AppsContext'

const App = () => {
  return (
    <AppsProvider>
      <Router>
        <Display/>
      </Router>
    </AppsProvider>
  )
}

export default App
