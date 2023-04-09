
import { useState } from 'react'

import { createContext, useContext } from 'react'
export const AutoScheduleButtonClickedContext = createContext()

export const AutoScheduleButtonClickedContextProvider = ({children}) => {
  const [AutoScheduleButtonClicked, setAutoScheduleButtonClicked] = useState(false);

  return (
    <AutoScheduleButtonClickedContext.Provider value={{ AutoScheduleButtonClicked, setAutoScheduleButtonClicked }}>
      {children}
    </AutoScheduleButtonClickedContext.Provider>
  )
}

export const useAutoScheduleButtonClickedValue = () => useContext(AutoScheduleButtonClickedContext)