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

export const updateTask = async (userId, taskId, task) => {
  try {
    const taskQuery = await query(
      collection(db, 'user', `${userId}/tasks`),
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(taskQuery)
    taskDocs.forEach(async (taskDoc) => {
      await updateDoc(taskDoc.ref, task)
    })
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

export const completeTask = async (
  userId,
  projectId,
  columnId,
  taskId,
  taskIndex,
) => {
  try {
    const columnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
      userId,
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
      userId,
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
      collection(db, 'user', `${userId}/tasks`),
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

export const handleCheckTask = async (userId, taskId) => {
  try {
    const taskQuery = await query(
      collection(db, 'user', `${userId}/tasks`),
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(taskQuery)
    taskDocs.forEach(async (taskDoc) => {
      await updateDoc(taskDoc.ref, {
        boardStatus: 'COMPLETE',
        index: 0, // UPDATE THIS LATER, ALSO STORE THE CURRENT BOARD STATUS LATER
      })
    })
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
      userId,
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
      userId,
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
      collection(db, 'user', `${userId}/tasks`),
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
      collection(db, 'user', `${userId}/tasks`),
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
      userId,
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
      collection(db, 'user', `${userId}/tasks`),
      where('taskId', '==', taskId),
    )
    const taskDocs = await getDocs(q)
    taskDocs.forEach(async (taskDoc) => {
      const task = taskDoc.data()
      // removes current taskId from blockingTask's taskId's blocks array
      task.isBlockedBy.forEach(async (blockingTask) => {
        const taskIsBlockedByQuery = await query(
          collection(db, 'user', `${userId}/tasks`),
          where('taskId', '==', blockingTask),
        )
        const taskIsBlockedByDocs = await getDocs(taskIsBlockedByQuery)
        taskIsBlockedByDocs.forEach(async (taskIsBlockedByDoc) => {
          await updateDoc(taskIsBlockedByDoc.ref, {
            blocks: taskIsBlockedByDoc
              .data()
              .blocks.filter((blocksTaskId) => blocksTaskId !== taskId),
          })
        })
      })

      // removes current taskId from blockedTask's isBlockedBy array
      task.blocks.forEach(async (blockedTask) => {
        const taskBlocksQuery = await query(
          collection(db, 'user', `${userId}/tasks`),
          where('taskId', '==', blockedTask),
        )
        const taskBlocksDocs = await getDocs(taskBlocksQuery)
        taskBlocksDocs.forEach(async (taskBlocksDoc) => {
          await updateDoc(taskBlocksDoc.ref, {
            isBlockedBy: taskBlocksDoc
              .data()
              .isBlockedBy.filter(
                (isBlockedByTaskId) => isBlockedByTaskId !== taskId,
              ),
          })
        })
      })
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

export const quickAddTask = async (
  userId,
  taskName,
  taskId,
  taskDescription,
  taskTimeLength,
  projectId, // 'REMINDER'
) => {
  try {
    await addDoc(collection(db, 'user', `${userId}/tasks`), {
      projectId: projectId,
      startDate: '',
      date: '',
      name: taskName,
      taskId: taskId,
      completed: false,
      boardStatus: '',
      important: false,
      description: taskDescription ? taskDescription : '', // string
      priority: 1, // number (int) (range: 1-3)
      timeLength: taskTimeLength, // number (int) (range: 15-2400)
      deadlineType: 'HARD', // string (range: 'HARD', 'SOFT', 'NONE')
      blocks: [], // array of taskIds
      isBlockedBy: [], // array of taskIds
      index: -1,
      eventIds: [],
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
  taskDeadlineType,
  taskBlocks,
  taskIsBlockedBy,
  index,
  scheduleCreated,
) => {
  try {
    await addDoc(collection(db, 'user', `${userId}/tasks`), {
      projectId: selectedProjectId || '',
      startDate: getValidStartDate(startScheduleDate, endScheduleDate),
      date: endScheduleDate,
      name: taskName,
      taskId: taskId,
      completed: false,
      boardStatus: boardStatus,
      important: defaultGroup === 'Important' ? true : false,
      description: taskDescription ? taskDescription : '', // string
      priority: taskPriority, // number (int) (range: 1-3)
      timeLength: taskTimeLength, // number (int) (range: 15-2400)
      deadlineType: taskDeadlineType, // string (range: 'HARD', 'SOFT', 'NONE')
      blocks: taskBlocks, // array of taskIds
      isBlockedBy: taskIsBlockedBy, // array of taskIds
      index: index,
      eventIds: [],
    })
    // UPDATE TASK INDEX HERE (COMPLETED)

    // adds current taskId to linked blocks taskId's isBlockedBy array
    taskIsBlockedBy.forEach(async (linkedTask) => {
      const taskBlocksQuery = await query(
        collection(db, 'user', `${userId}/tasks`),
        where('taskId', '==', linkedTask),
      )
      const taskBlocksDocs = await getDocs(taskBlocksQuery)
      taskBlocksDocs.forEach(async (taskBlocksDoc) => {
        await updateDoc(taskBlocksDoc.ref, {
          blocks: [...taskBlocksDoc.data().isBlockedBy, taskId],
        })
      })
    })

    // adds current taskId to linked isBlockedBy taskId's blocks array
    taskBlocks.forEach(async (linkedTask) => {
      const taskIsBlockedByQuery = await query(
        collection(db, 'user', `${userId}/tasks`),
        where('taskId', '==', linkedTask),
      )
      const taskIsBlockedByDocs = await getDocs(taskIsBlockedByQuery)
      taskIsBlockedByDocs.forEach(async (taskIsBlockedByDoc) => {
        await updateDoc(taskIsBlockedByDoc.ref, {
          isBlockedBy: [...taskIsBlockedByDoc.data().blocks, taskId],
        })
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

export const updateTaskFromFields = async (
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
  taskDeadlineType,
  taskBlocks,
  taskIsBlockedBy,
  linkedTaskBlocks,
  linkedTaskIsBlockedBy,
  removedTaskBlocks,
  removedTaskIsBlockedBy,
  scheduleCreated,
  endScheduleDate,
  startScheduleDate,
  defaultGroup,
  selectedProjectName,
  selectedProjectId,
) => {
  try {
    const taskQuery = await query(
      collection(db, 'user', `${userId}/tasks`),
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
        userId,
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
        await getTaskDocsInProjectColumnNotCompleted(
          userId,
          projectId,
          boardStatus,
        )

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
        timeLength: taskTimeLength, // number (int) (range: 15-2400)
        deadlineType: taskDeadlineType, // string (range: 'HARD', 'SOFT', 'NONE')
        blocks: taskBlocks, // array of taskIds
        isBlockedBy: taskIsBlockedBy, // array of taskIds
        boardStatus: newBoardStatus,
        index: newIndex,
      })
    })

    // adds current taskId to linked isBlockedBy taskId's blocks array
    linkedTaskIsBlockedBy.forEach(async (linkedTask) => {
      const taskIsBlockedByQuery = await query(
        collection(db, 'user', `${userId}/tasks`),
        where('taskId', '==', linkedTask),
      )
      const taskIsBlockedByDocs = await getDocs(taskIsBlockedByQuery)
      taskIsBlockedByDocs.forEach(async (taskIsBlockedByDoc) => {
        await updateDoc(taskIsBlockedByDoc.ref, {
          blocks: [...taskIsBlockedByDoc.data().blocks, taskId],
        })
      })
    })

    // adds current taskId to linked blocks taskId's isBlockedBy array
    linkedTaskBlocks.forEach(async (linkedTask) => {
      const taskBlocksQuery = await query(
        collection(db, 'user', `${userId}/tasks`),
        where('taskId', '==', linkedTask),
      )
      const taskBlocksDocs = await getDocs(taskBlocksQuery)
      taskBlocksDocs.forEach(async (taskBlocksDoc) => {
        await updateDoc(taskBlocksDoc.ref, {
          isBlockedBy: [...taskBlocksDoc.data().isBlockedBy, taskId],
        })
      })
    })

    // removes current taskId from removed isBlockedBy taskId's blocks array
    removedTaskIsBlockedBy.forEach(async (removedTask) => {
      const taskIsBlockedByQuery = await query(
        collection(db, 'user', `${userId}/tasks`),
        where('taskId', '==', removedTask),
      )
      const taskIsBlockedByDocs = await getDocs(taskIsBlockedByQuery)
      taskIsBlockedByDocs.forEach(async (taskIsBlockedByDoc) => {
        await updateDoc(taskIsBlockedByDoc.ref, {
          blocks: taskIsBlockedByDoc
            .data()
            .blocks.filter((blocksTaskId) => blocksTaskId !== taskId),
        })
      })
    })

    // removes current taskId from removed blocks taskId's isBlockedBy array
    removedTaskBlocks.forEach(async (removedTask) => {
      const taskBlocksQuery = await query(
        collection(db, 'user', `${userId}/tasks`),
        where('taskId', '==', removedTask),
      )
      const taskBlocksDocs = await getDocs(taskBlocksQuery)
      taskBlocksDocs.forEach(async (taskBlocksDoc) => {
        await updateDoc(taskBlocksDoc.ref, {
          isBlockedBy: taskBlocksDoc
            .data()
            .isBlockedBy.filter(
              (isBlockedByTaskId) => isBlockedByTaskId !== taskId,
            ),
        })
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
