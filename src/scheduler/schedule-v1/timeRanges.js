import moment from 'moment'
import { roundUp15Min, roundDown15Min } from 'handleMoment'
import { timeType } from 'enums'

/***
 * requirements:
 * events must not be all day events (must have start.dateTime and end.dateTime)
 * ***/
export const getTimesWithInfo = (events) => {
  const timesWithInfo = []
  for (const event of events) {
    const timeStartEvent = roundDown15Min(moment(event.start.dateTime))
    const timeEndEvent = roundUp15Min(moment(event.end.dateTime))
    timesWithInfo.push({
      time: timeStartEvent,
      type: timeType.startEvent,
      id: event.id,
    })
    timesWithInfo.push({
      time: timeEndEvent,
      type: timeType.endEvent,
      id: event.id,
    })
  }
  return timesWithInfo
}

/***
 * requirements:
 * timesWithInfo: { time: moment object, type: timeType }
 * ***/
export const getTimesWithInfoSorted = (timesWithInfo) => {
  const timesWithInfoSorted = timesWithInfo.sort((a, b) =>
    a.time > b.time ? 1 : a.time < b.time ? -1 : 0,
  )
  return timesWithInfoSorted
}

/***
 * requirements:
 * timesWithInfo: { time: moment object, type: timeType }
 * timesWithInfo must be sorted by time
 * ***/
export const getAvailableTimeRanges = (timesWithInfo) => {
  const availableTimeRanges = []
  let dayStarted = false
  let startAvailableTimeRangeIdx = -1
  for (let i = 0; i < timesWithInfo.length; i++) {
    // makes sure only time ranges within the day are considered
    if (timesWithInfo[i].type === timeType.startDay) {
      dayStarted = true
      startAvailableTimeRangeIdx = i
    } else if (timesWithInfo[i].type === timeType.endDay) {
      if (startAvailableTimeRangeIdx !== -1) {
        availableTimeRanges.push({
          start: timesWithInfo[startAvailableTimeRangeIdx].time,
          end: timesWithInfo[i].time,
        })
      }
      startAvailableTimeRangeIdx = -1

      dayStarted = false
    } else if (timesWithInfo[i].type === timeType.endEvent) {
      if (dayStarted) {
        startAvailableTimeRangeIdx = i
      }
    } else if (timesWithInfo[i].type === timeType.startEvent) {
      if (startAvailableTimeRangeIdx !== -1) {
        availableTimeRanges.push({
          start: timesWithInfo[startAvailableTimeRangeIdx].time,
          end: timesWithInfo[i].time,
        })
      }
      startAvailableTimeRangeIdx = -1
    }
  }
  return availableTimeRanges
}
