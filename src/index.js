import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { OverlayContextProvider } from './context/overlay-context'
import { ThemeContextProvider } from './context/theme-context'
import { ExternalEventsContextProvider } from './context/external-events-context'

ReactDOM.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <OverlayContextProvider>
        <ExternalEventsContextProvider>
          <App />
        </ExternalEventsContextProvider>
      </OverlayContextProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
