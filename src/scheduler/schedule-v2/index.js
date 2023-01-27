/* default imports */
// import {
//   fetchAllCalendars,
//   insertCalendar,
//   getUserTimeZone,
// } from 'gapiHandlers'
// import { insertEvent, updateEvent, deleteEvent } from 'googleCalendar'
// import { fetchAllEvents } from '../schedule-v1/events'
// import {
//   getTimesWithInfo,
//   getTimesWithInfoSorted,
//   getAvailableTimeRanges,
// } from '../schedule-v1/timeRanges'
// import moment from 'moment'
// import { timeType } from 'components/enums'
// import { getAllUserTasks } from 'handleUserTasks'
// import { getAllUserProjects } from 'handleUserProjects'
// import { getPreferences } from 'handlePreferences'
// import { updateUserInfo } from 'handleUserInfo'

/* START OF NEW CODE */
import {
  getTodayTimeRanges,
  getWeekTimeRanges,
  getBufferRange,
  getTimeRangesSingleDay,
  divideTimeRangeIntoChunkRanges,
  groupChunkRangesIntoBlocks,
  printBlocks,
} from './timeRanges'
import { getCalendarIdsInfo } from 'handleCalendars'
import { getUserInfo } from 'handleUserInfo'
import { fetchAllEventsByType } from 'googleCalendar'
import moment from 'moment'

const MAX_NUM_CHUNKS = 8 // 2h

/* returns true if calendar is scheduled properly, else false */
export const scheduleCalendar = async (userId) => {
  try {
    const userInfo = await getUserInfo(userId)
    if (userInfo.empty === true || userInfo.failed === true) {
      return false
    }
    const userData = userInfo.userInfoDoc.data()

    const calendarIdsInfo = await getCalendarIdsInfo(userData.calendarIds)
    const selectedCalendarIds = calendarIdsInfo
      .filter((calendarIdInfo) => calendarIdInfo.selected)
      .map((calendarIdInfo) => calendarIdInfo.id)
    let now = null
    let timeRange = null
    let dayRanges = null
    let workRanges = null
    let bufferRange = null

    if (!userData.isWeekly) {
      /* daily scheduling */
      const todayTimeRanges = getTodayTimeRanges(
        userData.sleepTimeRange,
        userData.workTimeRange,
      )
      const todayRange = [todayTimeRanges.today, todayTimeRanges.today]
      const todayBufferRange = getBufferRange(todayRange)

      now = todayTimeRanges.now
      timeRange = todayRange
      dayRanges = [todayTimeRanges.dayRange]
      workRanges = [todayTimeRanges.workRange]
      bufferRange = todayBufferRange
    } else {
      /* weekly scheduling */
      const weekTimeRanges = getWeekTimeRanges(
        userData.sleepTimeRange,
        userData.workTimeRange,
        userData.startingDay,
      )
      const weekBufferRange = getBufferRange(weekTimeRanges.weekRange)

      now = weekTimeRanges.now
      timeRange = weekTimeRanges.weekRange
      dayRanges = weekTimeRanges.dayRanges
      workRanges = weekTimeRanges.workRanges
      bufferRange = weekBufferRange
    }
    const eventsByType = await fetchAllEventsByType(
      bufferRange[0].toISOString(),
      bufferRange[1].toISOString(),
      selectedCalendarIds,
    )

    const timeRangesMultDays = []
    for (const dayRange of dayRanges) {
      const timeRangesSingleDay = await getTimeRangesSingleDay(
        eventsByType.timeBlocked,
        dayRange[0],
        dayRange[1],
      )
      timeRangesMultDays.push(timeRangesSingleDay)
    }

    const chunkRangesMultDays = []
    for (const timeRangesSingleDay of timeRangesMultDays) {
      const chunkRangesSingleDay =
        divideTimeRangeIntoChunkRanges(timeRangesSingleDay)
      chunkRangesMultDays.push(chunkRangesSingleDay)
    }

    const blocksMultDays = []
    for (let i = 0; i < chunkRangesMultDays.length; i++) {
      const hasWorkTime = userData.workDays[workRanges[i][1].day()]

      const blocksSingleDay = groupChunkRangesIntoBlocks(
        chunkRangesMultDays[i],
        MAX_NUM_CHUNKS,
        workRanges[i][0],
        workRanges[i][1],
        hasWorkTime,
      )
      blocksMultDays.push(blocksSingleDay)
    }

    for (let i = 0; i < blocksMultDays.length; i++) {
      // format the moment object in day, month, year format
      console.log(
        timeRange[0].clone().add(i, 'day').format('dddd, MMMM Do YYYY'),
      )
      printBlocks(blocksMultDays[i].work, 'Work')
      printBlocks(blocksMultDays[i].personal, 'Personal')
    }
  } catch (error) {
    console.log(error)
  }
}
/* END OF NEW CODE */
