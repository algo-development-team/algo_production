import { createContext, useContext, useRef } from 'react'

export const ExternalEventsContext = createContext()

export const ExternalEventsContextProvider = ({ children }) => {
  const externalEventsRef = useRef(null)

  return (
    <ExternalEventsContext.Provider value={{ externalEventsRef }}>
      {children}
    </ExternalEventsContext.Provider>
  )
}

export const useExternalEventsContextValue = () =>
  useContext(ExternalEventsContext)
