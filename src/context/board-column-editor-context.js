import { useState, createContext, useContext } from 'react'

export const ColumnEditorContext = createContext()

export const ColumnEditorContextProvider = ({ children }) => {
  const [columnEditorToShow, setColumnEditorToShow] = useState(null)

  return (
    <ColumnEditorContext.Provider
      value={{ columnEditorToShow, setColumnEditorToShow }}
    >
      {children}
    </ColumnEditorContext.Provider>
  )
}

export const useColumnEditorContextValue = () => useContext(ColumnEditorContext)
