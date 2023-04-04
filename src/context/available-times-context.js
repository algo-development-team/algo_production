
import { useState } from 'react'

import { createContext, useContext } from 'react'
export const AvailableTimesContext = createContext()

export const AvailableTimesContextProvider = ({children}) => {
  const [AvailableTimes, setAvailableTimes] = useState(false);

  return (
    <AvailableTimesContext.Provider value={{ AvailableTimes, setAvailableTimes }}>
      {children}
    </AvailableTimesContext.Provider>
  )
}

export const useAvailableTimesValue = () => useContext(AvailableTimesContext)