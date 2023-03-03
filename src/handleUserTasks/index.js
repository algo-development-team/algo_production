import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore'
import { db } from '_firebase'

/*
 * Description: fetches all tasks and separates them into arrays of completed and non-completed tasks
 * Return Type: {nonCompleted: task[], completed: task[]}
 * task: firestore task document data
 */
export const getAllUserTasks = async (userId) => {
  try {
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
  } catch (error) {
    console.log(error)
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
  try {
    const projectColumnTaskQuery = await query(
      collection(db, 'user', `${userId}/tasks`),
      where('projectId', '==', projectId),
      where('boardStatus', '==', boardStatus),
      where('completed', '==', false),
    )
    const projectColumnTaskDocs = await getDocs(projectColumnTaskQuery)
    return projectColumnTaskDocs
  } catch (error) {
    console.log(error)
  }
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
  try {
    const projectColumnTaskQuery = await query(
      collection(db, 'user', `${userId}/tasks`),
      where('projectId', '==', projectId),
      where('boardStatus', '==', boardStatus),
      where('completed', '==', true),
    )
    const projectColumnTaskDocs = await getDocs(projectColumnTaskQuery)
    return projectColumnTaskDocs
  } catch (error) {
    console.log(error)
  }
}

export const getTask = async (userId, taskId) => {
  try {
    const taskQuery = await query(
      collection(db, 'user', `${userId}/tasks`),
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(taskQuery)
    return taskDocs.docs[0].data()
  } catch (error) {
    console.log(error)
  }
}

export const updateTask = async (userId, taskId, newTask) => {
  try {
    const taskQuery = await query(
      collection(db, 'user', `${userId}/tasks`),
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(taskQuery)
    taskDocs.forEach(async (task) => {
      await updateDoc(task.ref, newTask)
    })
  } catch (error) {
    console.log(error)
  }
}
