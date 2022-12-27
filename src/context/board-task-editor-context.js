import { useState, createContext, useContext } from 'react'

export const TaskEditorContext = createContext()

export const TaskEditorContextProvider = ({ children }) => {
  const [taskEditorToShow, setTaskEditorToShow] = useState(null)

  return (
    <TaskEditorContext.Provider
      value={{ taskEditorToShow, setTaskEditorToShow }}
    >
      {children}
    </TaskEditorContext.Provider>
  )
}

export const useTaskEditorContextValue = () => useContext(TaskEditorContext)
