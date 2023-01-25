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

    if (!userData.isWeekly) {
      /* daily scheduling */
      const { now, today, dayRange, workRange } = getTodayTimeRanges(
        userData.sleepTimeRange,
        userData.workTimeRange,
      )
      const todayBufferRange = getBufferRange([today, today])
    } else {
      /* weekly scheduling */
      const { now, weekRange, dayRanges, workRanges } = getWeekTimeRanges(
        userData.sleepTimeRange,
        userData.workTimeRange,
        userData.startingDay,
      )
      const weekBufferRange = getBufferRange(weekRange)
    }
  } catch (error) {
    console.log(error)
  }
}
/* END OF NEW CODE */
