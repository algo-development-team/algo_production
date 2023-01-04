import React from 'react'
import './App.css'

import { AuthProvider, SignInStatusContextProvider } from 'context'
import { BrowserRouter as Router } from 'react-router-dom'
import { Views } from 'components/Views'

function App() {
  return (
    <Router>
      <AuthProvider>
        <SignInStatusContextProvider>
          <Views />
        </SignInStatusContextProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
