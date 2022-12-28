import { useTasks } from 'hooks'
import { useEffect, useState } from 'react'

export const useBoardData = (selectedProject) => {
  const { tasks } = useTasks(
    selectedProject.selectedProjectId ?? selectedProject.selectedProjectName,
  )
  const data = {}
  const [boardData, setBoardData] = useState(null)

  const getColumnTasks = (columnId) => {
    return tasks.filter((task) => task.boardStatus === columnId)
  }

  useEffect(() => {
    if (selectedProject.columns) {
      data.tasks = Object.assign({}, tasks)
      data.columns = {}
      data.columnOrder = []
      for (const column of selectedProject.columns) {
        if (
          column.id === 'NOSECTION' &&
          getColumnTasks(column.id).length === 0
        ) {
          continue
        }
        data.columns[column.id] = {
          id: column.id,
          title: column.title,
          columnTasks: getColumnTasks(column.id),
        }
        data.columnOrder.push(column.id)
      }

      setBoardData(data)
    }
  }, [tasks])

  return boardData
}
