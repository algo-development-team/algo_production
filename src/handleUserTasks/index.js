import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '_firebase'

/*
 * Description: fetches all tasks and separates them into arrays of completed and non-completed tasks
 * Return Type: {nonCompleted: task[], completed: task[]}
 * task: firestore task document data
 */
export const getAllUserTasks = async (userId) => {
  const taskQuery = await query(
    collection(db, 'user', `${userId}/tasks`),
    orderBy('index', 'asc'),
  )
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

/*
 * Description: fetches all taskDocs in a project column that are not completed
 * Return Type: taskDoc[]
 * task: firestore task document
 */
export const getTaskDocsInProjectColumnNotCompleted = async (
  userId,
  projectId,
  boardStatus,
) => {
  const projectColumnTaskQuery = await query(
    collection(db, 'user', `${userId}/tasks`),
    where('projectId', '==', projectId),
    where('boardStatus', '==', boardStatus),
    where('completed', '==', false),
  )
  const projectColumnTaskDocs = await getDocs(projectColumnTaskQuery)
  return projectColumnTaskDocs
}

/*
 * Description: fetches all taskDocs in a project column that are completed
 * Return Type: taskDoc[]
 * task: firestore task document
 */
export const getTaskDocsInProjectColumnCompleted = async (
  userId,
  projectId,
  boardStatus,
) => {
  const projectColumnTaskQuery = await query(
    collection(db, 'user', `${userId}/tasks`),
    where('projectId', '==', projectId),
    where('boardStatus', '==', boardStatus),
    where('completed', '==', true),
  )
  const projectColumnTaskDocs = await getDocs(projectColumnTaskQuery)
  return projectColumnTaskDocs
}
