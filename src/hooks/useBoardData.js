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
    if (selectedProject.columns) {
      console.log(selectedProject.columns) // DEBUGGING
      data.tasks = Object.assign({}, tasks)
      data.columns = {}
      for (const column of selectedProject.columns) {
        data.columns[column.id] = {
          id: column.id,
          title: column.title,
          columnTasks: getColumnTasks(column.id),
        }
      }
      data.columnOrder = selectedProject.columns.map((column) => column.id)

      setBoardData(data)
    }
  }, [tasks])

  return boardData
}
