import moment from 'moment'
import { preferenceType } from 'components/enums'

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

/***
 * requirements:
 * priority: number (1-4)
 * startDate: moment object
 * date: moment object
 * timeLength: number (1-64)
 * ***/
const calculatePreference = (priority, startDate, date, timeLength) => {
  // const isShort = timeLength <= 4 // 1h or less
  // const isImportant =
  //   priority === 3 ? true : priority === 2 && !isShort ? true : false
  // if (isUrgent && isImportant) {
  //   return 0 // urgent
  // } else if (isUrgent && !isImportant) {
  //   return 2 // shallow
  // } else if (!isUrgent && isImportant) {
  //   return 1 // deep
  // } else {
  //   return 2 // shallow
  // }
  return preferenceType.SHALLOW
}

/***
 * requirements:
 * tasks: task[] (from firestore)
 * projects: project[] (from firestore)
 * ***/
export const formatTasks = (tasks, projects) => {
  const projectIdToIsWork = {}
  for (const project of projects) {
    projectIdToIsWork[project.projectId] = project.projectIsWork
  }
  const formattedWorkTasks = []
  const formattedPersonalTasks = []
  for (const task of tasks) {
    const formattedTimeLength = task.timeLength / 15
    const formmatedAllocatedTimeLength = task.allocatedTimeLength / 15
    const formattedStartDate =
      task.startDate !== '' ? moment(task.startDate, 'DD-MM-YYYY') : null
    const formattedDate =
      task.date !== '' ? moment(task.date, 'DD-MM-YYYY') : null
    const preference = calculatePreference(
      task.priority,
      formattedStartDate,
      formattedDate,
      formattedTimeLength,
    )
    const formattedTask = {
      taskId: task.taskId,
      name: task.name,
      description: task.description,
      priority: task.priority,
      startDate: formattedStartDate,
      date: formattedDate,
      timeLength: formattedTimeLength,
      allocatedTimeLength: formmatedAllocatedTimeLength,
      preference: preference,
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
 * tasks: { priority, deadline, timeLength, preference, taskId, name, description }[]
 * ***/
export const getTaskMap = (tasks) => {
  const taskMap = {}
  for (const task of tasks) {
    taskMap[task.taskId] = task
  }
  return taskMap
}
