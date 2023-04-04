
import { useState } from 'react'

import { createContext, useContext } from 'react'
export const TaskListContext = createContext()

export const TaskListContextProvider = ({children}) => {
  const [TaskList, setTaskList] = useState(false);

  return (
    <TaskListContext.Provider value={{ TaskList, setTaskList }}>
      {children}
    </TaskListContext.Provider>
  )
}

export const useTaskListValue = () => useContext(TaskListContext)