import { EVENT_UPDATE } from './calendarHandlers'

const handleNewEventIds = (
  taskToEventIdsMap,
  eventIdToTaskMap,
  taskToNewEventIdsMap,
) => {
  for (const taskId in taskToNewEventIdsMap) {
    for (const eventIdInfo of taskToNewEventIdsMap[taskId]) {
      if (eventIdInfo.type === EVENT_UPDATE) {
        const oldTaskId = eventIdToTaskMap[eventIdInfo.id]
        taskToEventIdsMap[oldTaskId] = taskToEventIdsMap[oldTaskId].filter(
          (eventId) => eventId !== eventIdInfo.id,
        )
      }
      taskToEventIdsMap[taskId].push(eventIdInfo.id)
    }
  }
}

const handleDuplicatedEventIds = (
  taskToEventIdsMap,
  eventIdToTaskMap,
  duplicatedEventIds,
) => {
  for (const oldEventId in duplicatedEventIds) {
    const newEventId = duplicatedEventIds[oldEventId]
    const taskId = eventIdToTaskMap[oldEventId]
    taskToEventIdsMap[taskId].push(newEventId)
  }
}

export const modifyTasksToEventIdsMap = (
  taskToEventIdsMap,
  eventIdToTaskMap,
  taskToNewEventIdsMap,
  duplicatedEventIds,
) => {
  handleNewEventIds(taskToEventIdsMap, eventIdToTaskMap, taskToNewEventIdsMap)
  handleDuplicatedEventIds(
    taskToEventIdsMap,
    eventIdToTaskMap,
    duplicatedEventIds,
  )
}
