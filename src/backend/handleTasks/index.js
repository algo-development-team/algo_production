import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  addDoc,
} from 'firebase/firestore'
import { db } from '_firebase'
import { updateUserInfo } from '../handleUserInfo'
import moment from 'moment'

export const getTask = async (userId, taskId) => {
  try {
    const taskQuery = await query(collection(db, 'task', `${taskId}`))
    const taskDocs = await getDocs(taskQuery)
    return taskDocs.docs[0].data()
  } catch (error) {
    console.log(error)
  }
}
const getValidStartDate = (startDate, endDate) => {
  if (startDate === '') {
    return ''
  } else {
    if (
      moment(startDate, 'DD-MM-YYYY').isAfter(moment(endDate, 'DD-MM-YYYY'))
    ) {
      return endDate
    } else {
      return startDate
    }
  }
}

export const getAllUserTasks = async (userId) => {
  const nonCompletedTasks = []
  const completedTasks = []
  const userQuery = query(collection(db, 'userInfo', `${userId}`))
  const userDocs = await getDocs(userQuery)
  userDocs.forEach(async (userDoc) => {
    const userData = userDoc.data()
    const userId = userData.userId
    const teams = userData.teams
    const teamIds = [...teams, userId]
    for (const teamId of teamIds) {
      const teamQuery = query(collection(db, 'team', `${teamId}`))
      const teamDocs = await getDocs(teamQuery)
      teamDocs.forEach(async (teamDoc) => {
        const teamData = teamDoc.data()
        const projects = teamData.projects
        for (const projectId of projects) {
          const projectQuery = query(collection(db, 'project', `${projectId}`))
          const projectDocs = await getDocs(projectQuery)
          projectDocs.forEach(async (projectDoc) => {
            const projectData = projectDoc.data()
            const tasks = projectData.projects
            for (const taskId of tasks) {
              const taskQuery = query(collection(db, 'task', `${taskId}`))
              const taskDocs = await getDocs(taskQuery)
              taskDocs.forEach((taskDoc) => {
                const task = taskDoc.data()
                if (!task.completed) {
                  nonCompletedTasks.push(task)
                } else {
                  completedTasks.push(task)
                }
              })
            }
          })
        }
      })
    }
  })
  return {
    nonCompleted: nonCompletedTasks,
    completed: completedTasks,
  }
}

export const getTaskDocsInProjectColumnNotCompleted = async (
  userId,
  projectId,
  boardStatus,
) => {
  const projectColumnTaskQuery = await query(
    collection(db, 'task'),
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
    collection(db, 'task'),
    where('projectId', '==', projectId),
    where('boardStatus', '==', boardStatus),
    where('completed', '==', true),
  )
  const projectColumnTaskDocs = await getDocs(projectColumnTaskQuery)
  return projectColumnTaskDocs
}

export const completeTask = async (
  userId,
  projectId,
  columnId,
  taskId,
  taskIndex,
) => {
  try {
    const columnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
      projectId,
      columnId,
    )

    columnTaskDocs.forEach(async (taskDoc) => {
      if (taskDoc.data().index > taskIndex) {
        await updateDoc(taskDoc.ref, {
          index: taskDoc.data().index - 1,
        })
      }
    })

    const columnTasksDocsCompleted = await getTaskDocsInProjectColumnCompleted(
      projectId,
      columnId,
    )

    const columnTasksCompleted = []
    columnTasksDocsCompleted.forEach((taskDoc) => {
      columnTasksCompleted.push(taskDoc.data())
    })

    let newIndex = 0
    if (columnTasksCompleted.length > 0) {
      const maxIndex = Math.max(
        ...columnTasksCompleted.map((task) => task.index),
      )
      newIndex = maxIndex + 1
    }

    const taskQuery = await query(
      collection(db, 'task'),
      // changed above line
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(taskQuery)
    taskDocs.forEach(async (taskDoc) => {
      await updateDoc(taskDoc.ref, {
        completed: true,
        index: newIndex,
      })
    })
    // TASK INDEX HERE (COMPLETED)
  } catch (error) {
    console.log(error)
  }
}

export const updateBoardStatus = async (
  userId,
  draggableId,
  selectedProjectId,
  sourceDroppableId,
  sourceIndex,
  destinationDroppableId,
  destinationIndex,
) => {
  try {
    const oldColumnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
      selectedProjectId,
      sourceDroppableId,
    )

    oldColumnTaskDocs.forEach(async (taskDoc) => {
      if (taskDoc.data().index > sourceIndex) {
        await updateDoc(taskDoc.ref, {
          index: taskDoc.data().index - 1,
        })
      }
    })

    const newColumnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
      selectedProjectId,
      destinationDroppableId,
    )

    newColumnTaskDocs.forEach(async (taskDoc) => {
      if (taskDoc.data().index >= destinationIndex) {
        await updateDoc(taskDoc.ref, {
          index: taskDoc.data().index + 1,
        })
      }
    })

    const taskQuery = await query(
      collection(db, 'task'),
      // changed above line
      where('taskId', '==', draggableId),
    )
    const taskDocs = await getDocs(taskQuery)
    taskDocs.forEach(async (taskDoc) => {
      await updateDoc(taskDoc.ref, {
        boardStatus: destinationDroppableId,
        index: destinationIndex,
      })
    })
    // UPDATE TASK INDEX HERE (COMPLETED)

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const columnTaskDelete = async (userId, projectId, columnId) => {
  try {
    const taskQuery = await query(
      collection(db, 'task'),
      // changed above line
      where('projectId', '==', projectId),
      where('boardStatus', '==', columnId),
    )
    const taskDocs = await getDocs(taskQuery)
    taskDocs.forEach(async (taskDoc) => {
      await deleteDoc(taskDoc.ref)
    })
  } catch (error) {
    console.log(error)
  }
}

export const taskDelete = async (
  userId,
  projectId,
  columnId,
  taskIndex,
  taskId,
) => {
  try {
    const columnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
      projectId,
      columnId,
    )

    columnTaskDocs.forEach(async (taskDoc) => {
      if (taskDoc.data().index > taskIndex) {
        await updateDoc(taskDoc.ref, {
          index: taskDoc.data().index - 1,
        })
      }
    })
    // UPDATE TASK INDEX HERE (COMPLETED)
    const q = await query(
      collection(db, 'task'),
      // changed above line
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(q)
    taskDocs.forEach(async (taskDoc) => {
      await deleteDoc(taskDoc.ref)
    })
  } catch (error) {
    console.log(error)
  }
}

export const check = async (checklist, userId, taskId) => {
  try {
    const newChecklist = Array.from(checklist)
    newChecklist.push(taskId)
    await updateUserInfo(userId, {
      checklist: newChecklist,
    })
  } catch (error) {
    console.log(error)
  }
}

export const addTask = async (
  userId,
  selectedProjectId,
  startScheduleDate,
  endScheduleDate,
  taskName,
  taskId,
  boardStatus,
  defaultGroup,
  taskDescription,
  taskPriority,
  taskTimeLength,
  index,
  scheduleCreated,
) => {
  try {
    await addDoc(collection(db, 'task'), {
      projectId: selectedProjectId || userId,
      startDate: getValidStartDate(startScheduleDate, endScheduleDate),
      date: endScheduleDate,
      name: taskName,
      taskId: taskId,
      completed: false,
      boardStatus: boardStatus,
      important: defaultGroup === 'Important' ? true : false,
      description: taskDescription ? taskDescription : '', // string
      priority: taskPriority, // number (int) (range: 1-3)
      timeLength: taskTimeLength, // number (int) (range: 15-480)
      index: index,
    })
    // UPDATE TASK INDEX HERE (COMPLETED)
    if (scheduleCreated) {
      updateUserInfo(userId, {
        scheduleCreated: false,
      })
    }
  } catch (error) {
    console.log(error)
  }
}

const getNewProjectId = (
  defaultGroup,
  projectId,
  selectedProjectName,
  selectedProjectId,
) => {
  if (defaultGroup === 'Checklist' || defaultGroup === 'Scheduled') {
    return projectId
  } else if (selectedProjectName !== projectId) {
    return selectedProjectId
  } else {
    return projectId
  }
}

export const updateFireStore = async (
  userId,
  taskId,
  projectId,
  boardStatus,
  index,
  projects,
  taskName,
  taskDescription,
  taskPriority,
  taskTimeLength,
  scheduleCreated,
  endScheduleDate,
  startScheduleDate,
  defaultGroup,
  selectedProjectName,
  selectedProjectId,
) => {
  try {
    const taskQuery = await query(
      collection(db, 'task'),
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(taskQuery)
    const newProjectId = getNewProjectId(
      defaultGroup,
      projectId,
      selectedProjectName,
      selectedProjectId,
    )
    // UPDATE BOARDSTATUS HERE (COMPLETED)
    let newBoardStatus = boardStatus
    let newIndex = index

    if (projectId !== newProjectId) {
      const newProjectIsInbox = newProjectId === ''

      if (newProjectIsInbox) {
        newBoardStatus = 'NOSECTION'
      } else {
        const currentProject = projects.find(
          (project) => project.projectId === projectId,
        )
        const newProject = projects.find(
          (project) => project.projectId === newProjectId,
        )
        let currentColumnTitle = '(No Section)'
        if (projectId !== '') {
          currentColumnTitle = currentProject.columns.find(
            (column) => column.id === boardStatus,
          ).title
        }
        const columnTitleInNewProject = newProject.columns
          .map((column) => column.title)
          .includes(currentColumnTitle)
        if (!columnTitleInNewProject) {
          newBoardStatus = 'NOSECTION'
        } else {
          newBoardStatus = newProject.columns.find(
            (column) => column.title === currentColumnTitle,
          ).id
        }
      }

      const newProjectTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
        newProjectId,
        newBoardStatus,
      )

      const newProjectTasks = []
      newProjectTaskDocs.forEach((taskDoc) => {
        newProjectTasks.push(taskDoc.data())
      })

      newIndex = 0
      if (newProjectTasks.length > 0) {
        const maxIndex = Math.max(...newProjectTasks.map((task) => task.index))
        newIndex = maxIndex + 1
      }

      const currentProjectTaskDocs =
        await getTaskDocsInProjectColumnNotCompleted(projectId, boardStatus)

      currentProjectTaskDocs.forEach(async (taskDoc) => {
        if (taskDoc.data().index > index) {
          await updateDoc(taskDoc.ref, {
            index: taskDoc.data().index - 1,
          })
        }
      })
    }

    taskDocs.forEach(async (taskDoc) => {
      await updateDoc(taskDoc.ref, {
        name: taskName,
        startDate: getValidStartDate(startScheduleDate, endScheduleDate),
        date: endScheduleDate,
        projectId: newProjectId,
        description: taskDescription, // string
        priority: taskPriority, // number (int) (range: 1-3)
        timeLength: taskTimeLength, // number (int) (range: 15-480)
        boardStatus: newBoardStatus,
        index: newIndex,
      })
    })

    if (scheduleCreated) {
      updateUserInfo(userId, {
        scheduleCreated: false,
      })
    }
  } catch (error) {
    console.log(error)
  }
}