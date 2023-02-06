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
      if (eventIdToTimeLengthMap[eventId]) {
        allocatedTimeLength += eventIdToTimeLengthMap[eventId]
      }
    }
    taskToAllocatedTimeLengthMap[taskId] = allocatedTimeLength
  }
  return taskToAllocatedTimeLengthMap
}

/* categorize the tasks based on priority and startDate */
/***
 * requirements:
 * tasks: { priority, startDate, date, allocatableTimeLength, taskId, name, description }[]
 * today: moment.Moment
 * ***/
export const categorizeTasks = (tasks, timeRange) => {
  /* get day categories (0~N) */
  const timeRangeNumeric = [0, timeRange[1].diff(timeRange[0], 'days')]
  const dayCategories = new Array(timeRangeNumeric[1] + 1)

  for (let i = 0; i < dayCategories.length; i++) {
    dayCategories[i] = {
      low: [],
      average: [],
      high: [],
      veryHigh: [],
    }
  }

  /* get task diff days info */
  const tasksDiffDaysInfo = []
  for (const task of tasks) {
    const hasStartDate = task.startDate !== null
    const hasDate = task.date !== null
    const diffDaysStartDate = hasStartDate
      ? task.startDate.diff(timeRange[0], 'days')
      : timeRangeNumeric[0]
    const diffDaysEndDate = hasDate
      ? task.date.diff(timeRange[0], 'days')
      : timeRangeNumeric[1]
    tasksDiffDaysInfo.push({
      ...task,
      diffDaysStartDate: diffDaysStartDate,
      diffDaysDate: diffDaysEndDate,
      hasStartDate: hasStartDate,
      hasDate: hasDate,
    })
  }

  // START FROM HERE
  for (const taskDiffDaysInfo of tasksDiffDaysInfo) {
    for (let i = 0; i < dayCategories.length; i++) {
      if (
        taskDiffDaysInfo.diffDaysStartDate <= i &&
        i <= taskDiffDaysInfo.diffDaysDate
      ) {
        if (taskDiffDaysInfo.priority === 1) {
          dayCategories[i].low.push({
            taskId: taskDiffDaysInfo.taskId,
            hasStartDate: taskDiffDaysInfo.hasStartDate,
            hasDate: taskDiffDaysInfo.hasDate,
            dayDate: taskDiffDaysInfo.diffDaysDate,
          })
        } else if (taskDiffDaysInfo.priority === 2) {
          dayCategories[i].average.push({
            taskId: taskDiffDaysInfo.taskId,
            hasStartDate: taskDiffDaysInfo.hasStartDate,
            hasDate: taskDiffDaysInfo.hasDate,
            dayDate: taskDiffDaysInfo.diffDaysDate,
          })
        } else if (taskDiffDaysInfo.priority === 3) {
          dayCategories[i].high.push({
            taskId: taskDiffDaysInfo.taskId,
            hasStartDate: taskDiffDaysInfo.hasStartDate,
            hasDate: taskDiffDaysInfo.hasDate,
            dayDate: taskDiffDaysInfo.diffDaysDate,
          })
        } else if (taskDiffDaysInfo.priority === 4) {
          dayCategories[i].veryHigh.push({
            taskId: taskDiffDaysInfo.taskId,
            hasStartDate: taskDiffDaysInfo.hasStartDate,
            hasDate: taskDiffDaysInfo.hasDate,
            dayDate: taskDiffDaysInfo.diffDaysDate,
          })
        }
      }
    }
  }

  return dayCategories
}
