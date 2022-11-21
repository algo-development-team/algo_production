import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '_firebase'

export const getAllUserTasks = async (userId) => {
  const taskQuery = await query(collection(db, 'user', `${userId}/tasks`))
  const taskDocs = await getDocs(taskQuery)
  const nonCompletedTasks = []
  const completedTasks = []
  taskDocs.forEach((taskDoc) => {
    const task = taskDoc.data()
    if (!task.completed) {
      nonCompletedTasks.push(task)
    } else {
      completedTasks.push(task)
    }
  })
  return {
    nonCompleted: nonCompletedTasks,
    completed: completedTasks,
  }
}
