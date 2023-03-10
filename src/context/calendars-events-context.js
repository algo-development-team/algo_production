import { useState } from 'react'

import { createContext, useContext } from 'react'
export const CalendarsEventsContext = createContext()

export const CalendarsEventsContextProvider = ({ children }) => {
  const [calendarsEvents, setCalendarsEvents] = useState({ custom: [] })

  return (
    <CalendarsEventsContext.Provider
      value={{ calendarsEvents, setCalendarsEvents }}
    >
      {children}
    </CalendarsEventsContext.Provider>
  )
}

export const useCalendarsEventsValue = () => useContext(CalendarsEventsContext)
