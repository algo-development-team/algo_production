import React from 'react'
import './App.css'

import {
  AuthProvider,
  SignInStatusContextProvider,
  GoogleContextProvider,
} from 'context'
import { BrowserRouter as Router } from 'react-router-dom'
import { Views } from 'components/Views'
import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
  return (
    <Router>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
        <AuthProvider>
          <SignInStatusContextProvider>
            <GoogleContextProvider>
              <Views />
            </GoogleContextProvider>
          </SignInStatusContextProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  )
}

export default App
