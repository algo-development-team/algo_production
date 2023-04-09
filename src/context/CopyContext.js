
import { useState } from 'react'

import { createContext, useContext } from 'react'
export const CopyContext = createContext()

export const CopyContextProvider = ({children}) => {
  const [C, setC] = useState(false)


  return (
    <CopyContext.Provider value={{ C, setC }}>
      {children}
    </CopyContext.Provider>
  )
}

export const CopyValue = () => useContext(CopyContext)