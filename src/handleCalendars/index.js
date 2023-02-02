import { fetchAllCalendars } from 'gapiHandlers'

/* runtime: 0.2s */
export const getCalendarIdsInfo = async (calendarIdsInfo) => {
  const unfilteredNewCalendars = await fetchAllCalendars()
  const newCalendars = unfilteredNewCalendars.filter(
    (calendar) => calendar.id.split('@')[1] !== 'group.v.calendar.google.com',
  )
  const newCalendarIds = newCalendars.map((calendar) => calendar.id)
  const calendarIds = calendarIdsInfo.map((calendar) => calendar.id)
  const calendarIdsInfoInNewCalendars = calendarIdsInfo.filter((calendar) =>
    newCalendarIds.includes(calendar.id),
  )
  const newCalendarsNotInCalendarIdsInfo = newCalendars.filter(
    (calendar) => !calendarIds.includes(calendar.id),
  )
  const newCalendarIdsInfo = newCalendarsNotInCalendarIdsInfo.map(
    (calendar) => {
      return {
        id: calendar.id,
        summary: calendar.summary,
        colorId: parseInt(calendar.colorId),
        selected: calendar.selected,
      }
    },
  )
  const combinedCalendarIdsInfo = [
    ...calendarIdsInfoInNewCalendars,
    ...newCalendarIdsInfo,
  ]
  return combinedCalendarIdsInfo
}

export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
