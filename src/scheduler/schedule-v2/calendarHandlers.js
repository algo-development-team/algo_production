import moment from 'moment'

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
