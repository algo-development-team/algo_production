import moment from 'moment'
import { insertEvent, updateEvent, deleteEvent } from 'googleCalendar'
import { getTaskColorId } from '../../handleColorId'
import { timeZone } from '../../handleCalendars'

export const EVENT_INSERT = 'EVENT_INSERT'
export const EVENT_UPDATE = 'EVENT_UPDATE'

export const getEventsInRange = (events, start, end) => {
  const between = []
  const startOuter = []
  const endOuter = []
  const bothOuter = []
  for (const event of events) {
    const eventStart = moment(event.start.dateTime)
    const eventEnd = moment(event.end.dateTime)
    // validStart when: start <= eventStart < end
    const validStart =
      (eventStart.isAfter(start) || eventStart.isSame(start)) &&
      eventStart.isBefore(end)
    // validEnd when: start < eventEnd <= end
    const validEnd =
      eventEnd.isAfter(start) &&
      (eventEnd.isBefore(end) || eventEnd.isSame(end))
    if (validStart && validEnd) {
      between.push(event)
    } else if (validStart) {
      endOuter.push(event)
    } else if (validEnd) {
      startOuter.push(event)
    } else {
      if (eventStart.isBefore(start) && eventEnd.isAfter(end)) {
        bothOuter.push(event)
      }
    }
  }
  return {
    between: between,
    startOuter: startOuter,
    endOuter: endOuter,
    bothOuter: bothOuter,
  }
}

/***
 * mutates taskToNewEventIdsMap
 * ***/
export const handleEventsOutOfRange = async (
  now,
  endOfWeek,
  eventsInRange,
  calendarId,
) => {
  const duplicatedEventIds = {}
  for (const event of eventsInRange.startOuter) {
    event.end.dateTime = now.toISOString()
    await updateEvent(calendarId, event.id, event)
  }

  for (const event of eventsInRange.endOuter) {
    event.start.dateTime = endOfWeek.toISOString()
    await updateEvent(calendarId, event.id, event)
  }

  for (const event of eventsInRange.bothOuter) {
    // insert new eventId into taskToNewEventIdsMap
    const newEvent = await insertEvent(
      calendarId,
      endOfWeek.toISOString(),
      event.end.dateTime,
      event.start.timeZone,
      event.summary,
      event.description,
      parseInt(event.colorId),
    )
    event.end.dateTime = now.toISOString()
    await updateEvent(calendarId, event.id, event)
    duplicatedEventIds[event.id] = newEvent?.id
  }
  return duplicatedEventIds
}

/***
 * mutates taskToNewEventIdsMap
 * ***/
export const changeAlgoCalendarSchedule = async (
  timeBlocks,
  events,
  calendarId,
  taskToNewEventIdsMap,
) => {
  for (let i = 0; i < Math.min(events.length, timeBlocks.length); i++) {
    const event = events[i]
    const timeBlock = timeBlocks[i]
    event.start.dateTime = timeBlock.start.toISOString()
    event.start.timeZone = timeZone
    event.end.dateTime = timeBlock.end.toISOString()
    event.end.timeZone = timeZone
    event.summary = timeBlock.name
    event.description = timeBlock.description
    event.colorId = getTaskColorId(timeBlock.priority)
    const newEvent = await updateEvent(calendarId, event.id, event)
    taskToNewEventIdsMap[timeBlock.taskId].push({
      id: newEvent?.id,
      type: EVENT_UPDATE,
    })
  }
  if (events.length > timeBlocks.length) {
    for (let i = timeBlocks.length; i < events.length; i++) {
      const event = events[i]
      await deleteEvent(calendarId, event.id)
    }
  }
  if (events.length < timeBlocks.length) {
    for (let i = events.length; i < timeBlocks.length; i++) {
      const timeBlock = timeBlocks[i]
      const newEvent = await insertEvent(
        calendarId,
        timeBlock.start.toISOString(),
        timeBlock.end.toISOString(),
        timeZone,
        timeBlock.name,
        timeBlock.description,
        getTaskColorId(timeBlock.priority),
      )
      taskToNewEventIdsMap[timeBlock.taskId].push({
        id: newEvent?.id,
        type: EVENT_INSERT,
      })
    }
  }
}
