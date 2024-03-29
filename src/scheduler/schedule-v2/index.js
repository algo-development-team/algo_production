import { insertCalendar } from 'gapiHandlers'
import {
  getTodayTimeRanges,
  getWeekTimeRanges,
  getBufferRange,
  getAvailableTimeRangesSingleDay,
  divideTimeRangeIntoChunkRanges,
  groupChunkRangesIntoBlocks,
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
  getEventIdToTaskMap,
  getTaskToNewEventIdsMap,
  getTaskToAllocatedTimeLengthMap,
  categorizeTasks,
} from './taskHandlers'
import {
  allocateWorkTimeBlocks,
  allocatePersonalTimeBlocks,
} from './taskIdAllocationHandlers'
import {
  groupChunksByTaskId,
  formatTimeBlocks,
  getTimeBlocksSorted,
  filterTimeBlocks,
} from './timeBlockHandlers'
import {
  getEventsInRange,
  handleEventsOutOfRange,
  changeAlgoCalendarSchedule,
} from './calendarHandlers'
import { modifyTasksToEventIdsMap } from './eventIdsHandlers'
import { Timestamp } from 'firebase/firestore'
import { getCalendarIdsInfo } from 'handleCalendars'
import {
  updateUserInfo,
  getUserInfo,
  getUserDefaultData,
} from '../../backend/handleUserInfo'
import { fetchAllEventsByType } from 'googleCalendar'
import { getAllUserTasks, updateTask } from '../../backend/handleUserTasks'
import { getAllUserProjects } from '../../backend/handleUserProjects'
import { roundUp15Min } from 'handleMoment'
import moment from 'moment'

/***
 * requirements:
 * timeBlocks: { start, end, preference, taskId, isWork }[]
 * taskMap: { taskId: { priority, deadline, timeLength, preference, taskId, name, description } }
 * ***/
const getTimeBlocksWithTaskInfo = (timeBlocks, tasksMap) => {
  return timeBlocks.map((timeBlock) => {
    const taskId = timeBlock.taskId
    const taskInfo = tasksMap[taskId]
    return {
      taskId: taskId,
      start: timeBlock.start,
      end: timeBlock.end,
      isWork: timeBlock.isWork,
      name: taskInfo.name,
      description: taskInfo.description,
      priority: taskInfo.priority,
    }
  })
}

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
      .filter((calendarIdInfo) => calendarIdInfo.id !== userData.calendarId)
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
      const timeRangesSingleDay = getAvailableTimeRangesSingleDay(
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

    const taskToEventIdsMap = getTaskToEventIdsMap(tasksNotNoneTimeLength)
    const eventIdToTaskMap = getEventIdToTaskMap(tasksNotNoneTimeLength)
    const taskToNewEventIdsMap = getTaskToNewEventIdsMap(tasksNotNoneTimeLength)

    /* fetches all events in the Algo calendar (from account createdAt time to start of tomorrow) */
    /* create a new Algo calendar if non-exists */
    let algoCalendarEvents = { timeBlocked: [], allDay: [] }

    if (userData.calendarId) {
      const algoCalendarFetchTimeRange = [formattedCreatedAt, timeRange[1]]
      const algoCalendarFetchBufferRange = getBufferRange(
        algoCalendarFetchTimeRange,
      )
      algoCalendarEvents = await fetchAllEventsByType(
        algoCalendarFetchBufferRange[0].toISOString(),
        algoCalendarFetchBufferRange[1].toISOString(),
        [userData.calendarId],
      )
    } else {
      const result = await insertCalendar('Algo')
      userData.calendarId = result.id
      await updateUserInfo(userId, { calendarId: result.id })
    }

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

    const categorizedTasks = {
      work: categorizeTasks(formattedTasks.work, timeRange),
      personal: categorizeTasks(formattedTasks.personal, timeRange),
    }

    const formattedTasksMap = {
      ...getTaskMap(formattedTasks.work),
      ...getTaskMap(formattedTasks.personal),
    }

    /* allocate a task (or leave empty) for each chunk in each block for work and personal */
    /* mutates rankedWorkBlocks, rankedPersonalBlocks, and formattedTasks */
    allocateWorkTimeBlocks(
      rankedWorkBlocks,
      categorizedTasks.work,
      formattedTasksMap,
      bufferRanges,
      now,
    )
    allocatePersonalTimeBlocks(
      rankedPersonalBlocks,
      categorizedTasks.personal,
      formattedTasksMap,
      bufferRanges,
      workRanges,
      restHours,
      now,
    )

    /* format time blocks */
    const timeBlocksWithTaskInfoForWeek = []
    for (let i = 0; i < rankedWorkBlocks.length; i++) {
      const workTimeBlocksForDay = groupChunksByTaskId(rankedWorkBlocks[i])
      const personalTimeBlocksForDay = groupChunksByTaskId(
        rankedPersonalBlocks[i],
      )
      const formattedTimeBlocksForDay = [
        ...formatTimeBlocks(workTimeBlocksForDay, true),
        ...formatTimeBlocks(personalTimeBlocksForDay, false),
      ]
      const filteredTimeBlocks = filterTimeBlocks(formattedTimeBlocksForDay)
      const sortedTimeBlocks = getTimeBlocksSorted(filteredTimeBlocks)
      const timeBlocksWithTaskInfo = getTimeBlocksWithTaskInfo(
        sortedTimeBlocks,
        formattedTasksMap,
      )
      timeBlocksWithTaskInfoForWeek.push(timeBlocksWithTaskInfo)
    }

    /* get checklist */
    const weeklyChecklist = {}
    for (let i = 0; i < timeBlocksWithTaskInfoForWeek.length; i++) {
      const newChecklist = timeBlocksWithTaskInfoForWeek[i].map(
        (timeBlock) => timeBlock.taskId,
      )
      if (newChecklist.length > 0) {
        const newChecklistWithoutDuplicates = [...new Set(newChecklist)]
        const curDate = timeRange[0].clone().add(i, 'days')
        const curDateUnixTime = curDate.unix()
        // format curDate as valid firebase timestamp
        const curDateTimestamp = new Timestamp(curDateUnixTime, 0)
        weeklyChecklist[curDateTimestamp] = newChecklistWithoutDuplicates
      }
    }

    const filteredCalendarIdsInfo = calendarIdsInfo.filter(
      (calendarIdInfo) => calendarIdInfo.id !== userData.calendarId,
    )

    /* update userInfo doc with new weeklyChecklist and calendarIds fields */
    await updateUserInfo(userId, {
      calendarIds: filteredCalendarIdsInfo,
      weeklyChecklist: weeklyChecklist,
    })

    /* allocate the calendar with new event time blocks */
    const endOfWeek = dayRanges[dayRanges.length - 1][1].clone()
    const eventsInRange = getEventsInRange(
      algoCalendarEvents.timeBlocked,
      now,
      endOfWeek,
    )

    const timeBlocks = timeBlocksWithTaskInfoForWeek.flat()

    /* duplicatedEventIds: {[eventId]: eventId} */
    const duplicatedEventIds = await handleEventsOutOfRange(
      now,
      endOfWeek,
      eventsInRange,
      userData.calendarId,
    )

    /* taskToNewEventIdsMap: {[taskId]: {id: eventId, type: EVENT_INSERT | EVENT_UPDATE}[]} */
    await changeAlgoCalendarSchedule(
      timeBlocks,
      eventsInRange.between,
      userData.calendarId,
      taskToNewEventIdsMap,
    )

    modifyTasksToEventIdsMap(
      taskToEventIdsMap,
      eventIdToTaskMap,
      taskToNewEventIdsMap,
      duplicatedEventIds,
    )

    /* update tasks with eventIds */
    for (const taskId in taskToEventIdsMap) {
      const eventIds = taskToEventIdsMap[taskId]
      await updateTask(userId, taskId, { eventIds: eventIds })
    }
  } catch (error) {
    console.log(error)
  }
}
