import { useTasks } from 'hooks'
import { useEffect, useState } from 'react'

export const useBoardData = (selectedProject) => {
  const { tasks } = useTasks(
    selectedProject.selectedProjectId ?? selectedProject.selectedProjectName,
  )
  const data = {}
  const [boardData, setBoardData] = useState(null)
  const getColumnTasks = (column) => {
    return tasks.filter((task) => task.boardStatus === column)
  }
  useEffect(() => {
    data.tasks = Object.assign({}, tasks)
    let todoTasks = getColumnTasks('TODO')
    let completeTasks = getColumnTasks('COMPLETE')
    let inprogressTasks = getColumnTasks('INPROGRESS')
    data.columns = {
      TODO: {
        id: 'TODO',
        title: 'To do',
        columnTasks: todoTasks,
      },
      INPROGRESS: {
        id: 'INPROGRESS',
        title: 'In Progress',
        columnTasks: inprogressTasks,
      },
      COMPLETE: {
        id: 'COMPLETE',
        title: 'Complete',
        columnTasks: completeTasks,
      },
    }
    data.columnOrder = ['TODO', 'INPROGRESS', 'COMPLETE']

    setBoardData(data)
  }, [tasks])

  return boardData
}
