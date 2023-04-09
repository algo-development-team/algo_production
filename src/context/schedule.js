import { useState } from 'react'

import { createContext, useContext } from 'react'
export const ScheduleContext = createContext()

export const ScheduleContextProvider = ({children}) => {
  const [Schedule, setSchedule] = useState(null);

  return (
    <ScheduleContext.Provider value={{ Schedule, setSchedule }}>
      {children}
    </ScheduleContext.Provider>
  )
}

export const useScheduleValue = () => useContext(ScheduleContext)