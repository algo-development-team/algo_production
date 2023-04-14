import { useState, useEffect } from 'react'

import { createContext, useContext } from 'react'
export const CalendarsEventsContext = createContext()

export const CalendarsEventsContextProvider = ({ children }) => {
  const [calendarsEvents, setCalendarsEvents] = useState({ custom: [] })
  const [calendarsEventsFetched, setCalendarsEventsFetched] = useState(false)

  const getCalendarsEventsFetched = () => {
    // If calendarsEvents is not default value, then it has been fetched
    return JSON.stringify(calendarsEvents) !== JSON.stringify({ custom: [] })
  }

  useEffect(() => {
    if (!calendarsEventsFetched) {
      setCalendarsEventsFetched(getCalendarsEventsFetched())
    }
  }, [calendarsEvents])

  return (
    <CalendarsEventsContext.Provider
      value={{ calendarsEvents, setCalendarsEvents, calendarsEventsFetched }}
    >
      {children}
    </CalendarsEventsContext.Provider>
  )
}

export const useCalendarsEventsValue = () => useContext(CalendarsEventsContext)
