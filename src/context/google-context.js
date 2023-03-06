import { useAuth } from 'hooks'
import { getUserGoogleCalendarList } from '../google'
import { useState, useEffect } from 'react'

import { createContext, useContext } from 'react'
export const GoogleContext = createContext()

export const GoogleContextProvider = ({ children }) => {
  const { currentUser, isUserGoogleAuthenticated } = useAuth()
  const [googleCalendars, setGoogleCalendars] = useState([])

  useEffect(() => {
    const fetchGoogleCalendars = async () => {
      const fetchedGoogleCalendars = await getUserGoogleCalendarList(
        currentUser.id,
      )
      setGoogleCalendars(fetchedGoogleCalendars)
    }
    if (currentUser && isUserGoogleAuthenticated) {
      fetchGoogleCalendars()
    }
  }, [currentUser, isUserGoogleAuthenticated])

  return (
    <GoogleContext.Provider value={{ googleCalendars }}>
      {children}
    </GoogleContext.Provider>
  )
}

export const useGoogleValue = () => useContext(GoogleContext)
