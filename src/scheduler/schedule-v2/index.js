import {
  getTodayTimeRanges,
  getWeekTimeRanges,
  getBufferRange,
  getAvailableTimeRangesSingleDay,
  divideTimeRangeIntoChunkRanges,
  groupChunkRangesIntoBlocks,
  printBlocks,
  rankBlocks,
  getBufferRangeForEvents,
  getEventIdToAllocatedTimeLengthMap,
  getBufferRangeForTimeRangesExclusive,
  getFilteredWorkRanges,
} from './timeRangeHandlers'
import {
  filterTaskNotPassedDeadline,
  filterTaskNotNoneTimeLength,
  formatTasks,
  getTaskMap,
  getTaskToEventIdsMap,
  getTaskToAllocatedTimeLengthMap,
  categorizeTaskIds,
} from './taskHandlers'
import {
  allocateWorkTimeBlocks,
  allocatePersonalTimeBlocks,
} from './timeBlockHandlers'
import { getCalendarIdsInfo } from 'handleCalendars'
import { getUserInfo, getUserDefaultData } from 'handleUserInfo'
import { fetchAllEventsByType } from 'googleCalendar'
import { getAllUserTasks } from 'handleUserTasks'
import { getAllUserProjects } from 'handleUserProjects'
import { roundUp15Min } from 'handleMoment'
import moment from 'moment'

const MAX_NUM_CHUNKS = 8 // 2h

/* returns true if calendar is scheduled properly, else false */
export const scheduleCalendar = async (userId) => {
  try {
    /* fetches user data */
    const userInfo = await getUserInfo(userId)
    if (userInfo.empty === true || userInfo.failed === true) {
      return false
    }
    const userData = userInfo.userInfoDoc.data()

    /* get formattedCreatedAt for Algo Calendar events fetching */
    const userDefaultInfo = await getUserDefaultData(userId)
    let formattedCreatedAt = null
    if (userDefaultInfo === null) {
      formattedCreatedAt = moment(new Date(2023, 0, 1))
    } else {
      formattedCreatedAt = roundUp15Min(
        moment.unix(userDefaultInfo.createdAt.seconds),
      )
    }

    /* fetches calendars information */
    const calendarIdsInfo = await getCalendarIdsInfo(userData.calendarIds)
    const selectedCalendarIds = calendarIdsInfo
      .filter((calendarIdInfo) => calendarIdInfo.selected)
      .filter((calendarIdsInfo) => calendarIdsInfo.id !== userData.calendarId)
      .map((calendarIdInfo) => calendarIdInfo.id)

    /* initializing time ranges variables */
    let now = null
    let timeRange = null
    let dayRanges = null
    let workRanges = null
    let sleepRanges = null
    let bufferRange = null

    /* gets time ranges information */
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
      sleepRanges = [todayTimeRanges.sleepRange]
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
      sleepRanges = weekTimeRanges.sleepRanges
      bufferRange = weekBufferRange
    }

    const eventsByType = await fetchAllEventsByType(
      bufferRange[0].toISOString(),
      bufferRange[1].toISOString(),
      selectedCalendarIds,
    )

    /* gets time ranges of non-blocked times */
    const timeRangesMultDays = []
    for (const dayRange of dayRanges) {
      const timeRangesSingleDay = await getAvailableTimeRangesSingleDay(
        eventsByType.timeBlocked,
        dayRange[0],
        dayRange[1],
      )
      timeRangesMultDays.push(timeRangesSingleDay)
    }

    /* divides non-blocked time ranges into 15 min chunks */
    const chunkRangesMultDays = []
    for (const timeRangesSingleDay of timeRangesMultDays) {
      const chunkRangesSingleDay =
        divideTimeRangeIntoChunkRanges(timeRangesSingleDay)
      chunkRangesMultDays.push(chunkRangesSingleDay)
    }

    /* groups 15 min chunks into 2h blocks, each block containing 8 chunks */
    const blocksMultDays = []
    for (let i = 0; i < chunkRangesMultDays.length; i++) {
      const hasWorkTime = userData.workDays[workRanges[i][0].day()]

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

    /* formats each chunk in a block to have a new field called preference */
    const rankedBlocksMultDay = []

    for (const blocksSingleDay of blocksMultDays) {
      const rankedBlocksSingleDay = {
        work: rankBlocks(blocksSingleDay.work, userData.preferences),
        personal: rankBlocks(blocksSingleDay.personal, userData.preferences),
      }
      rankedBlocksMultDay.push(rankedBlocksSingleDay)
    }

    /* group work and personal rankedBlocks together into arrays */
    const rankedWorkBlocks = rankedBlocksMultDay.map(
      (rankedBlocksSingleDay) => rankedBlocksSingleDay.work,
    )
    const rankedPersonalBlocks = rankedBlocksMultDay.map(
      (rankedBlocksSingleDay) => rankedBlocksSingleDay.personal,
    )

    /* calculates buffer ranges for online meetings */
    /* note: includes all online meetings, whether or not it has been accepted */
    const onlineMeetings = eventsByType.timeBlocked.filter(
      (event) => event.attendees,
    )
    const onlineMeetingsBufferRanges = getBufferRangeForEvents(
      onlineMeetings,
      userData.beforeMeetingBufferTime,
      userData.afterMeetingBufferTime,
    )

    /* calculates buffer ranges for work hours */
    const filteredWorkRanges = getFilteredWorkRanges(
      workRanges,
      userData.workDays,
    )
    const workBufferRanges = getBufferRangeForTimeRangesExclusive(
      filteredWorkRanges,
      userData.beforeWorkBufferTime,
      userData.afterWorkBufferTime,
    )

    /* calculates buffer ranges for sleep hours */
    const sleepBufferRanges = getBufferRangeForTimeRangesExclusive(
      sleepRanges,
      userData.beforeSleepBufferTime,
      userData.afterSleepBufferTime,
    )

    const bufferRanges = [
      ...onlineMeetingsBufferRanges,
      ...workBufferRanges,
      ...sleepBufferRanges,
    ]

    /* get rest hours for personal time */
    const restHours = userData.personalPreferences.map((personalPreference) =>
      personalPreference === 1 ? true : false,
    )

    // const sleepBufferRanges = getBufferRangeForEvents(
    //   sleepRanges,
    //   userData.beforeSleepBufferTime,
    //   userData.afterSleepBufferTime,
    // )

    /* prints the blocks to console */
    // for (let i = 0; i < rankedBlocksMultDay.length; i++) {
    //   console.log(
    //     timeRange[0].clone().add(i, 'day').format('dddd, MMMM Do YYYY'),
    //   ) // DEBUGGING
    //   printBlocks(rankedBlocksMultDay[i].work, 'Work') // DEBUGGING
    //   printBlocks(rankedBlocksMultDay[i].personal, 'Personal') // DEBUGGING
    // }

    /* fetch tasks and projects */
    const tasks = await getAllUserTasks(userId)
    const projects = await getAllUserProjects(userId)

    /* filter tasks */
    const tasksNotPassedDeadline = filterTaskNotPassedDeadline(
      tasks.nonCompleted,
      timeRange[0],
    )
    const tasksNotNoneTimeLength = filterTaskNotNoneTimeLength(
      tasksNotPassedDeadline,
    )

    const taskToEventIdsMap = {
      ...getTaskToEventIdsMap(tasksNotNoneTimeLength),
    }

    /* fetches all events in the Algo calendar (from account createdAt time to start of tomorrow) */
    const algoCalendarFetchTimeRange = [
      formattedCreatedAt,
      moment().startOf('day').add(1, 'days'),
    ]
    const algoCalendarFetchBufferRange = getBufferRange(
      algoCalendarFetchTimeRange,
    )
    const algoCalendarEvents = await fetchAllEventsByType(
      algoCalendarFetchBufferRange[0].toISOString(),
      algoCalendarFetchBufferRange[1].toISOString(),
      [userData.calendarId],
    )
    const algoCalendarEventIdToAllocatedTimeLengthMap =
      getEventIdToAllocatedTimeLengthMap(algoCalendarEvents.timeBlocked, now)

    /* get the taskId to amount of time allocated (in minutes) map */
    const taskToAllocatedTimeLengthMap = getTaskToAllocatedTimeLengthMap(
      taskToEventIdsMap,
      algoCalendarEventIdToAllocatedTimeLengthMap,
    )

    /* update the format tasks to accomodate for newly added fields */
    const formattedTasks = formatTasks(
      tasksNotNoneTimeLength,
      taskToAllocatedTimeLengthMap,
      projects,
    )

    const categorizedTaskIds = {
      work: categorizeTaskIds(formattedTasks.work, timeRange),
      personal: categorizeTaskIds(formattedTasks.personal, timeRange),
    }

    const formattedTasksMap = {
      ...getTaskMap(formattedTasks.work),
      ...getTaskMap(formattedTasks.personal),
    }

    /* allocate a task (or leave empty) for each chunk in each block for work and personal */
    /* mutates rankedWorkBlocks, rankedPersonalBlocks, and formattedTasks */
    allocateWorkTimeBlocks(
      rankedWorkBlocks,
      categorizedTaskIds.work,
      formattedTasksMap,
      bufferRanges,
      now,
    )
    allocatePersonalTimeBlocks(
      rankedPersonalBlocks,
      categorizedTaskIds.personal,
      formattedTasksMap,
      bufferRanges,
      restHours,
      now,
    )
  } catch (error) {
    console.log(error)
  }
}
