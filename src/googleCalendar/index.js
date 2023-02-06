/***
 * Wrapper functions for gapi handler functions
 * Handles input and output
 * ***/

import {
  getCalendarEvents,
  insertCalenderEvent,
  updateCalenderEvent,
  deleteCalenderEvent,
} from 'gapiHandlers'

/***
 * requirements:
 * timeMin and timeMax are in ISO Date String format
 * timeMin and timeMax should already be formatted
 * use the following code for formatting: (automatically handles timezone as well, so no need to worry about that)
 * const timeMin = moment('2022-11-13T00:00:00').toISOString()
 * const timeMax = moment('2022-11-14T00:00:00').toISOString()
 * ***/
export const fetchEvents = async (timeMin, timeMax, calendarId = 'primary') => {
  const fetchOption = {
    calendarId: calendarId,
    timeMin: timeMin,
    timeMax: timeMax,
    showDeleted: false,
    singleEvents: true,
    orderBy: 'startTime',
  }
  const events = await getCalendarEvents(fetchOption)
  return events
}

export const fetchAllEvents = async (timeMin, timeMax, calendarIds) => {
  const events = []
  for (const calendarId of calendarIds) {
    const fetchedEvents = await fetchEvents(timeMin, timeMax, calendarId)
    events.push(...fetchedEvents)
  }
  return events
}

export const fetchAllEventsByType = async (timeMin, timeMax, calendarIds) => {
  const events = await fetchAllEvents(timeMin, timeMax, calendarIds)
  const eventsByType = { timeBlocked: [], allDay: [] }
  for (const event of events) {
    if (event.start.dateTime) {
      eventsByType.timeBlocked.push(event)
    } else {
      eventsByType.allDay.push(event)
    }
  }
  return eventsByType
}

/***
 * requirements:
 * the passed dateTimes should already be in the correct format
 * dateTime format example: '2015-05-28T09:00:00-07:00'
 * ***/
export const insertEvent = async (
  calendarId,
  startDateTime,
  endDateTime,
  timeZone,
  summary,
  description,
  colorId,
) => {
  const insertOption = {
    calendarId: calendarId,
    start: {
      dateTime: startDateTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timeZone,
    },
    summary: summary,
    description: description,
    colorId: colorId,
  }

  const newEvent = await insertCalenderEvent(insertOption)
  return newEvent
}

export const updateEvent = async (calendarId, eventId, updatedEvent) => {
  const updateOption = {
    calendarId: calendarId,
    eventId: eventId,
    resource: updatedEvent,
  }

  const newEvent = await updateCalenderEvent(updateOption)
  return newEvent
}

export const deleteEvent = async (calendarId, eventId) => {
  const deleteOption = {
    calendarId: calendarId,
    eventId: eventId,
  }

  const result = await deleteCalenderEvent(deleteOption)
  return result
}
