import {
  getTodayTimeRanges,
  getWeekTimeRanges,
  getBufferRange,
  getTimeRangesSingleDay,
  divideTimeRangeIntoChunkRanges,
  groupChunkRangesIntoBlocks,
  printBlocks,
  rankBlocksOfChunks,
} from './timeRangeHandlers'
import {
  filterTaskNotPassedDeadline,
  formatTasks,
  getTaskMap,
} from './taskHandlers'
import { getCalendarIdsInfo } from 'handleCalendars'
import { getUserInfo } from 'handleUserInfo'
import { fetchAllEventsByType } from 'googleCalendar'
import { getAllUserTasks } from 'handleUserTasks'
import { getAllUserProjects } from 'handleUserProjects'

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

      /* filter out meeting buffer times */
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

    const rankedBlocksOfChunksMultDay = []

    for (const blocksSingleDay of blocksMultDays) {
      const rankedBlocksOfChunksSingleDay = {
        work: rankBlocksOfChunks(
          blocksSingleDay.work,
          userData.rankingPreferences,
        ),
        personal: rankBlocksOfChunks(
          blocksSingleDay.personal,
          userData.rankingPreferences,
        ),
      }
      rankedBlocksOfChunksMultDay.push(rankedBlocksOfChunksSingleDay)
    }

    const tasks = await getAllUserTasks(userId)
    const projects = await getAllUserProjects(userId)
    const tasksNotPassedDeadline = filterTaskNotPassedDeadline(
      tasks.nonCompleted,
      timeRange[0],
    )
    /* update the format tasks to accomodate for newly added fields */
    const formattedTasks = formatTasks(tasksNotPassedDeadline, projects)
    const taskMap = {
      ...getTaskMap(formattedTasks.work),
      ...getTaskMap(formattedTasks.personal),
    }

    console.log('taskMap: ', taskMap) // DEBUGGING
  } catch (error) {
    console.log(error)
  }
}
