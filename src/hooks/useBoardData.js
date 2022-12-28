import { useTasks } from 'hooks'
import { useEffect, useState } from 'react'

export const useBoardData = (selectedProject) => {
  const { tasks } = useTasks(
    selectedProject.selectedProjectId ?? selectedProject.selectedProjectName,
  )
  const data = {}
  const [boardData, setBoardData] = useState(null)

  const getColumnTasksInOrder = (columnId) => {
    // UPDATE THIS TO SORT BY TASK INDEX (COMPLETED)
    const currentColumnTasks = tasks.filter(
      (task) => task.boardStatus === columnId,
    )
    const currentColumnSortedTasks = currentColumnTasks.sort((a, b) => {
      if (a.index > b.index) {
        return 1
      }
      if (a.index < b.index) {
        return -1
      }
      return 0
    })
    return currentColumnSortedTasks
  }

  useEffect(() => {
    if (selectedProject.columns) {
      data.tasks = Object.assign({}, tasks)
      data.columns = {}
      data.columnOrder = []
      for (const column of selectedProject.columns) {
        if (
          column.id === 'NOSECTION' &&
          getColumnTasksInOrder(column.id).length === 0
        ) {
          continue
        }
        data.columns[column.id] = {
          id: column.id,
          title: column.title,
          columnTasks: getColumnTasksInOrder(column.id),
        }
        data.columnOrder.push(column.id)
      }

      setBoardData(data)
    }
  }, [tasks])

  return boardData
}
