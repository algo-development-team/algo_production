import { roundUp15Min } from 'handleMoment'
import moment from 'moment'

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
