import moment from 'moment'

export const getFormattedEventTime = (start, allDay) => {
  if (!allDay) {
    return moment.utc(start).format('YYYYMMDDTHHmmss[Z]')
  } else {
    return moment(start).format('YYYYMMDD')
  }
}

export const formatEventTimeLength = (timeLength) => {
  const minutes = timeLength

  // Calculate hours and minutes
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  // Format as HH:MM
  const formattedHours = ('0' + hours).slice(-2)
  const formattedMinutes = ('0' + remainingMinutes).slice(-2)

  return formattedHours + ':' + formattedMinutes
}

export const getRecurringEventDuration = (eventStart, eventEnd) => {
  return Math.floor(
    moment.duration(moment(eventEnd).diff(moment(eventStart))).asMinutes(),
  )
}
