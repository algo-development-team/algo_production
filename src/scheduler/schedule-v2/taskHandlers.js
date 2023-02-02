import moment from 'moment'

/***
 * requirements:
 * tasks: task[] (from firestore)
 * today: moment object
 * ***/
export const filterTaskNotPassedDeadline = (tasks, today) => {
  return tasks.filter((task) => {
    if (task.date === '') return true
    const deadline = moment(task.date, 'DD-MM-YYYY')
    return deadline.diff(today, 'days') >= 0
  })
}

export const filterTaskNotNoneTimeLength = (tasks) => {
  return tasks.filter((task) => task.timeLength > 0)
}

/***
 * requirements:
 * tasks: task[] (from firestore)
 * projects: project[] (from firestore)
 * ***/
export const formatTasks = (tasks, taskToAllocatedTimeLengthMap, projects) => {
  const projectIdToIsWork = {}
  for (const project of projects) {
    projectIdToIsWork[project.projectId] = project.projectIsWork
  }
  const formattedWorkTasks = []
  const formattedPersonalTasks = []
  for (const task of tasks) {
    const formattedStartDate =
      task.startDate !== '' ? moment(task.startDate, 'DD-MM-YYYY') : null
    const formattedDate =
      task.date !== '' ? moment(task.date, 'DD-MM-YYYY') : null
    const allocatableTimeLength =
      task.timeLength - taskToAllocatedTimeLengthMap[task.taskId]
    const formattedTask = {
      taskId: task.taskId,
      name: task.name,
      description: task.description,
      priority: task.priority,
      startDate: formattedStartDate,
      date: formattedDate,
      allocatableTimeLength: allocatableTimeLength,
    }
    if (projectIdToIsWork[task.projectId]) {
      formattedWorkTasks.push(formattedTask)
    } else {
      formattedPersonalTasks.push(formattedTask)
    }
  }
  return {
    work: formattedWorkTasks,
    personal: formattedPersonalTasks,
  }
}

/***
 * requirements:
 * tasks: task[] (from firestore)
 * ***/
export const getTaskToEventIdsMap = (tasks) => {
  const taskToEventIdsMap = {}
  for (const task of tasks) {
    taskToEventIdsMap[task.taskId] = task.eventIds
  }
  return taskToEventIdsMap
}

/***
 * requirements:
 * tasks: { priority, startDate, date, allocatableTimeLength, taskId, name, description }[]
 * ***/
export const getTaskMap = (tasks) => {
  const taskMap = {}
  for (const task of tasks) {
    taskMap[task.taskId] = task
  }
  return taskMap
}

export const getTaskToAllocatedTimeLengthMap = (
  taskToEventIdsMap,
  eventIdToTimeLengthMap,
) => {
  const taskToAllocatedTimeLengthMap = {}
  for (const taskId in taskToEventIdsMap) {
    const eventIds = taskToEventIdsMap[taskId]
    let allocatedTimeLength = 0
    for (const eventId of eventIds) {
      allocatedTimeLength += eventIdToTimeLengthMap[eventId]
    }
    taskToAllocatedTimeLengthMap[taskId] = allocatedTimeLength
  }
  return taskToAllocatedTimeLengthMap
}

/* categorize the tasks based on priority and startDate */
/***
 * requirements:
 * tasks: { priority, startDate, date, allocatableTimeLength, taskId, name, description }[]
 * ***/
export const categorizeTasks = (tasks) => {
  /* group tasks by their priority (range 1-4), group 1 and 2 together */
  const categorizedTasks = { lowOrAverage: [], high: [], veryHigh: [] }
  for (const task of tasks) {
    if (task.priority === 1 || task.priority === 2) {
      categorizedTasks.lowOrAverage.push(task)
    } else if (task.priority === 3) {
      categorizedTasks.high.push(task)
    } else if (task.priority === 4) {
      categorizedTasks.veryHigh.push(task)
    }
  }
  return categorizedTasks
}
