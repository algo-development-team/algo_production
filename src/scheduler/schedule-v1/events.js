import { fetchEvents } from 'googleCalendar'

/***
 * description:
 * fetches all events according to user's specified day range
 * considers buffer time to include events that are in the edge of the day range
 * requirements:
 * timeMin and timeMax are in ISO Date String format
 * ***/
export const fetchAllEvents = async (timeMin, timeMax, calendarIds) => {
  const events = []
  for (const calendarId of calendarIds) {
    const fetchedEvents = await fetchEvents(timeMin, timeMax, calendarId)
    events.push(...fetchedEvents)
  }
  return events
}
