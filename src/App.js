import React from 'react'
import './App.css'

import {
  AuthProvider,
  SignInStatusContextProvider,
  GoogleContextProvider,
  AvailableTimesContextProvider,
} from 'context'
import { BrowserRouter as Router } from 'react-router-dom'
import { Views } from 'components/Views'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ExternalEventsContextProvider } from './context/external-events-context'
import { CalendarsEventsContextProvider } from './context/calendars-events-context'
import { CopyContextProvider } from './context/CopyContext.js'
import { AutoScheduleButtonClickedContextProvider } from './context/auto-schedule-button-clicked-context'
import { TaskListContextProvider } from 'context/tasklist-context'

function App() {
  return (
    <Router>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
        <AuthProvider>
          <SignInStatusContextProvider>
            <GoogleContextProvider>
              <ExternalEventsContextProvider>
                <CalendarsEventsContextProvider>
                  <CopyContextProvider>
                    <AutoScheduleButtonClickedContextProvider>
                      <AvailableTimesContextProvider>
                        <TaskListContextProvider>
                      <Views />
                      </TaskListContextProvider>
                      </AvailableTimesContextProvider>
                    </AutoScheduleButtonClickedContextProvider>
                  </CopyContextProvider>
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
