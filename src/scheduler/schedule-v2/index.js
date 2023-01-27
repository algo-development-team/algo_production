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
} from './timeRanges'
import { getCalendarIdsInfo } from 'handleCalendars'
import { getUserInfo } from 'handleUserInfo'

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
  } catch (error) {
    console.log(error)
  }
}
/* END OF NEW CODE */
