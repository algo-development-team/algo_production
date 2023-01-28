import { roundUp15Min, roundDown15Min } from 'handleMoment'
import moment from 'moment'
import { timeType } from 'enums'

/* helper function */
/* returns time and time ranges for today (all immutable) */
/* parameter: sleepTimeRange: string (HH:MM-HH:MM), workTimeRange: string (HH:MM-HH:MM), */
/* return value: { now: moment.Moment (current time rounded up to nearest 15 min), today: moment.Moment (start of today), dayRange: [moment.Moment, moment.Moment], workRange: [moment.Moment, moment.Moment] } */
export const getTodayTimeRanges = (sleepTimeRange, workTimeRange) => {
  const now = Object.freeze(moment())

  const today = now.clone().startOf('day')
  const sleepRange = sleepTimeRange
    .split('-')
    .map((time) => moment(time, 'HH:mm'))
  const workRange = workTimeRange
    .split('-')
    .map((time) => moment(time, 'HH:mm'))
  const dayRange = [sleepRange[1], sleepRange[0]]
  // condition: the end of the day is in the next day
  // action: adjusts the end of the day to the next day
  if (dayRange[0].isAfter(dayRange[1])) {
    dayRange[1].add(1, 'day')
  }
  // condition: the end of the work time is in the next day
  // action: adjusts the end of the work to the next day
  if (workRange[0].isAfter(workRange[1])) {
    workRange[1].add(1, 'day')
  }
  // condition: work starts before the day begins
  // action: adjusts the work range to be within the day range
  if (workRange[0].isBefore(dayRange[0])) {
    workRange[0].add(1, 'day')
    workRange[1].add(1, 'day')
  }
  // full-day adjustments (to previous day)
  // condition: now is before the start of sleep range (i.e. before 11pm of night before)
  // action: adjusts to schedule for the current day
  if (now.isBefore(dayRange[1].clone().subtract(1, 'day'))) {
    today.subtract(1, 'day')
    dayRange[0].subtract(1, 'day')
    dayRange[1].subtract(1, 'day')
    workRange[0].subtract(1, 'day')
    workRange[1].subtract(1, 'day')
  }
  // full-day adjustments (to next day)
  // condition: now is between the start of sleep range and the end of sleep range
  // action: adjusts to schedule for the next day
  else if (
    now.isAfter(dayRange[1]) &&
    now.isBefore(dayRange[0].clone().add(1, 'day'))
  ) {
    today.add(1, 'day')
    dayRange[0].add(1, 'day')
    dayRange[1].add(1, 'day')
    workRange[0].add(1, 'day')
    workRange[1].add(1, 'day')
  }

  const nowRoundedImmutable = Object.freeze(roundUp15Min(now.clone()))
  const todayImmutable = Object.freeze(today)
  const dayRangeImmutable = Object.freeze(dayRange)
  const workRangeImmutable = Object.freeze(workRange)

  return {
    now: nowRoundedImmutable,
    today: todayImmutable,
    dayRange: dayRangeImmutable,
    workRange: workRangeImmutable,
  }
}

/* helper function */
/* returns time and time ranges for remainder of this week or remainder of this week + next week (all immutable) */
export const getWeekTimeRanges = (
  sleepTimeRange,
  workTimeRange,
  startingDay,
) => {
  const { now, today, dayRange, workRange } = getTodayTimeRanges(
    sleepTimeRange,
    workTimeRange,
  )

  const curWeekDay = today.day()
  const curWeekDayAdjusted = curWeekDay === 0 ? 7 : curWeekDay
  const startingDayAdjusted = startingDay === 0 ? 7 : startingDay
  let numDays = null
  if (curWeekDayAdjusted < startingDayAdjusted) {
    /* schedule from today to this Sunday */
    numDays = 7 - curWeekDayAdjusted
  } else {
    /* schedule from today to next Sunday */
    numDays = 14 - curWeekDayAdjusted
  }

  const weekRange = [today.clone(), today.clone().add(numDays, 'day')]
  const dayRanges = []
  for (let i = 0; i <= numDays; i++) {
    dayRanges.push([
      dayRange[0].clone().add(i, 'day'),
      dayRange[1].clone().add(i, 'day'),
    ])
  }
  const workRanges = []
  for (let i = 0; i <= numDays; i++) {
    workRanges.push([
      workRange[0].clone().add(i, 'day'),
      workRange[1].clone().add(i, 'day'),
    ])
  }

  const weekRangeImmutable = Object.freeze(weekRange)
  const dayRangesImmutable = Object.freeze(dayRanges)
  const workRangesImmutable = Object.freeze(workRanges)
  return {
    now: now,
    weekRange: weekRangeImmutable,
    dayRanges: dayRangesImmutable,
    workRanges: workRangesImmutable,
  }
}

/* get buffer range with extra time before and after the given timeRange */
export const getBufferRange = (timeRange) => {
  const timeMin = timeRange[0]
    .clone()
    .subtract(1, 'day')
    .subtract(2, 'hour')
    .subtract(15, 'minute')
  const timeMax = timeRange[1]
    .clone()
    .add(2, 'day')
    .add(2, 'hour')
    .add(15, 'minute')
  return [timeMin, timeMax]
}

/***
 * requirements:
 * events must not be all day events (must have start.dateTime and end.dateTime)
 * startBufferAmount and endBufferAmount must be in minutes
 * ***/
export const getBufferRangeForEvents = (
  events,
  startBufferAmount,
  endBufferAmount,
) => {
  const bufferRanges = []
  for (const event of events) {
    const bufferStartEvent = moment(event.start.dateTime).subtract(
      startBufferAmount,
      'minute',
    )
    const bufferEndEvent = moment(event.end.dateTime).add(
      endBufferAmount,
      'minute',
    )
    const id = event.id
    bufferRanges.push({
      id: id,
      start: bufferStartEvent,
      end: bufferEndEvent,
    })
  }
  return bufferRanges
}

/***
 * requirements:
 * events must not be all day events (must have start.dateTime and end.dateTime)
 * ***/
const getTimesWithInfo = (events) => {
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

const compareDifferentTimeTypes = (a, b) => {
  if (a.type === timeType.endEvent) {
    if (b.type === timeType.startEvent) {
      return -1
    } else if (b.type === timeType.startDay) {
      return -1
    }
  }
  if (a.type === timeType.startDay) {
    if (b.type === timeType.startEvent) {
      return -1
    }
  }
  if (a.type === timeType.endEvent) {
    if (b.type === timeType.endDay) {
      return -1
    }
  }
  if (a.type === timeType.endDay) {
    if (b.type === timeType.startEvent) {
      return -1
    }
  }
  return 0
}

/***
 * requirements:
 * timesWithInfo: { time: moment object, type: timeType }
 * ***/
/* modify to account for different time types */
const getTimesWithInfoSorted = (timesWithInfo) => {
  const timesWithInfoSorted = timesWithInfo.sort((a, b) =>
    a.time > b.time
      ? 1
      : a.time < b.time
      ? -1
      : compareDifferentTimeTypes(a, b),
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

/***
 * requirements:
 * events: Google Calendar API events (time-blocked)
 * timeStartDay: moment object
 * timeEndDay: moment object
 * currently only returns available time ranges, can be expanded in future to return blocked time ranges as well
 * ***/
export const getAvailableTimeRangesSingleDay = async (
  events,
  timeStartDay,
  timeEndDay,
) => {
  const timesWithInfo = getTimesWithInfo(events)
  const timeStartDayWithInfo = {
    time: timeStartDay,
    type: timeType.startDay,
    id: null,
  }
  const timeEndDayWithInfo = {
    time: timeEndDay,
    type: timeType.endDay,
    id: null,
  }
  timesWithInfo.push(timeStartDayWithInfo)
  timesWithInfo.push(timeEndDayWithInfo)
  const timesWithInfoSorted = getTimesWithInfoSorted(timesWithInfo)
  const availableTimeRangesForDay = getAvailableTimeRanges(timesWithInfoSorted)
  return availableTimeRangesForDay
}

export const divideTimeRangeIntoChunkRanges = (timeRanges) => {
  const chunkRanges = []
  for (const timeRange of timeRanges) {
    const chunkRange = []
    const currentChunk = timeRange.start.clone()
    while (currentChunk.isBefore(timeRange.end)) {
      const chunk = {
        start: currentChunk.clone(),
        end: currentChunk.clone().add(15, 'minute'),
      }
      chunkRange.push(chunk)
      currentChunk.add(15, 'minute')
    }
    chunkRanges.push(chunkRange)
  }
  return chunkRanges
}

/***
 * requirements:
 * arr: array of items
 * size: size of each subarr
 * ***/
const sliceIntoSubarr = (arr, size) => {
  const subarrs = []
  for (let i = 0; i < arr.length; i += size) {
    const subarr = arr.slice(i, i + size)
    subarrs.push(subarr)
  }
  return subarrs
}

/***
 * Groups chunk ranges considering both max number of chunks and work range
 * requirements:
 * chunkRanges: { start: moment, end: moment }[]
 * ***/
export const groupChunkRangesIntoBlocks = (
  chunkRanges,
  maxNumChunks,
  workTimeStart,
  workTimeEnd,
  hasWorkTime,
) => {
  let workBlocks = []
  let personalBlocks = []
  // divide chunk ranges into work and personal blocks
  for (const chunkRange of chunkRanges) {
    const workChunkRanges = []
    const personalChunkRanges = []
    let workChunkRange = []
    let personalChunkRange = []
    let isLastChunkWork = false
    let isLastChunkPersonal = false
    for (const chunk of chunkRange) {
      if (hasWorkTime) {
        if (
          (chunk.start.isSame(workTimeStart) ||
            chunk.start.isAfter(workTimeStart)) &&
          (chunk.end.isSame(workTimeEnd) || chunk.end.isBefore(workTimeEnd))
        ) {
          if (isLastChunkPersonal) {
            personalChunkRanges.push(personalChunkRange)
            personalChunkRange = []
            isLastChunkPersonal = false
          }
          workChunkRange.push(chunk)
          isLastChunkWork = true
        } else {
          if (isLastChunkWork) {
            workChunkRanges.push(workChunkRange)
            workChunkRange = []
            isLastChunkWork = false
          }
          personalChunkRange.push(chunk)
          isLastChunkPersonal = true
        }
      } else {
        personalChunkRange.push(chunk)
      }
    }
    if (workChunkRange.length > 0) workChunkRanges.push(workChunkRange)
    if (personalChunkRange.length > 0)
      personalChunkRanges.push(personalChunkRange)
    workBlocks = workBlocks.concat(workChunkRanges)
    personalBlocks = personalBlocks.concat(personalChunkRanges)
  }
  // divide blocks into blocks of (maxNumChunks >= number of chunks in a block)
  const workBlocksSliced = []
  const personalBlocksSliced = []
  for (const block of workBlocks) {
    const slicedBlock = sliceIntoSubarr(block, maxNumChunks)
    workBlocksSliced.push(...slicedBlock)
  }
  for (const block of personalBlocks) {
    const slicedBlock = sliceIntoSubarr(block, maxNumChunks)
    personalBlocksSliced.push(...slicedBlock)
  }
  return {
    work: workBlocksSliced,
    personal: personalBlocksSliced,
  }
}

/***
 * DEBUGGING PURPOSES ONLY
 * requirements:
 * blocks: { start, end, preference (optional), taskId (optional) }[][]
 * blockType: string
 * ***/
export const printBlocks = (blocks, blockType) => {
  console.log(blockType + ':')
  for (const block of blocks) {
    console.log('-'.repeat(15))
    for (const chunk of block) {
      console.log(chunk.start.format('HH:mm'), '-', chunk.end.format('HH:mm'))
    }
    console.log('-'.repeat(15))
  }
}

/***
 * requirements:
 * blocks: { start, end }[][]
 * ***/
export const rankBlocks = (blocks, preferences) => {
  return blocks.map((block) =>
    block.map((chunk) => {
      return {
        start: chunk.start,
        end: chunk.end,
        preference: preferences[chunk.start.hour()],
        taskId: null,
      }
    }),
  )
}
