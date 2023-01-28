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
    const formattedTask = {
      taskId: task.taskId,
      name: task.name,
      description: task.description,
      priority: task.priority,
      startDate: formattedStartDate,
      date: formattedDate,
      timeLength: formattedTimeLength,
      allocatedTimeLength: formmatedAllocatedTimeLength,
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
