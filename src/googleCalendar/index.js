/***
 * Wrapper functions for gapi handler functions
 * Handles input and output
 * ***/

import {
  getCalendarEvents,
  insertCalenderEvent,
  updateCalenderEvent,
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
  }

  const item = await insertCalenderEvent(insertOption)
  return item
}

export const updateEvent = async (calendarId, eventId, updatedEvent) => {
  const updateOption = {
    calendarId: calendarId,
    eventId: eventId,
    resource: updatedEvent,
  }

  const item = await updateCalenderEvent(updateOption)
  return item
}
