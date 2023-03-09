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
import { ExternalEventsContextProvider } from './context/external-events-context'
import { CalendarsEventsContextProvider } from './context/calendars-events-context'

function App() {
  return (
    <Router>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
        <AuthProvider>
          <SignInStatusContextProvider>
            <GoogleContextProvider>
              <ExternalEventsContextProvider>
                <CalendarsEventsContextProvider>
                  <Views />
                </CalendarsEventsContextProvider>
              </ExternalEventsContextProvider>
            </GoogleContextProvider>
          </SignInStatusContextProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  )
}

export default App
