import {
  fetchAllCalendars,
  insertCalendar,
  getUserTimeZone,
} from 'gapiHandlers'
import { insertEvent, updateEvent, deleteEvent } from 'googleCalendar'
import { fetchAllEvents } from './events'
import {
  getTimesWithInfo,
  getTimesWithInfoSorted,
  getAvailableTimeRanges,
} from './timeRanges'
import { getUserInfo, updateUserInfo } from 'backend/handleUserInfo'
import moment from 'moment'
import { timeType } from '../../enums'
import { getAllUserTasks } from '../../backend/handleUserTasks'
import { getAllUserProjects } from '../../backend/handleUserProjects'

const MAX_NUM_CHUNKS = 8 // 2h
const PRIORITY_RANGE = Object.freeze([1, 3])
/***
 * Range for time length before scaling is 1-32
 * ***/
const TIME_LENGTH_RANGE = Object.freeze([0, 5]) // scaled by log2
/***
 * WEIGHTS values should be adjusted in the future using linear regression
 * ***/
const WEIGHTS = Object.freeze({
  priority: 4,
  deadline: 5,
  timeLength: 1,
  diffTimeLength: 2,
  isPreference: 3,
})
const TOTAL_WEIGHTS_SUM = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
const RELATIVE_PRIORITY_RANGE = Object.freeze([0, TOTAL_WEIGHTS_SUM])

/***
 * description:
 * - allocates time blocks into Google Calendar
 * note:
 * - schedules the entire day, no matter what the current time is
 * ***/
export const scheduleToday = async (userId) => {
  try {
    // const t1 = new Date() // DEBUGGING
    //*** GETTING AVAILABLE TIME RANGES START ***//
    const userInfo = await getUserInfo(userId)
    if (userInfo.empty === true || userInfo.failed === true) {
      return { checklist: [], failed: true }
    }
    const userData = userInfo.userInfoDoc.data()
    const now = moment()
    const today = now.clone().startOf('day')
    const sleepRange = userData.sleepTimeRange
      .split('-')
      .map((time) => moment(time, 'HH:mm'))
    const workRange = userData.workTimeRange
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
      // console.log('now is before the start of sleep range') // DEBUGGING
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
      // console.log(
      //   'now is between the start of sleep range and the end of sleep range',
      // ) // DEBUGGING
      today.add(1, 'day')
      dayRange[0].add(1, 'day')
      dayRange[1].add(1, 'day')
      workRange[0].add(1, 'day')
      workRange[1].add(1, 'day')
    }
    const timeMin = today
      .clone()
      .subtract(1, 'day')
      .subtract(2, 'hour')
      .subtract(15, 'minute')
      .toISOString()
    const timeMax = today
      .clone()
      .add(2, 'day')
      .add(2, 'hour')
      .add(15, 'minute')
      .toISOString()

    // debugging statements for time:
    // console.log('now:', now.format('MM-DD HH:mm')) // DEBUGGING
    // console.log('today:', today.format('MM-DD HH:mm')) // DEBUGGING
    // console.log('dayRange[0]:', dayRange[0].format('MM-DD HH:mm')) // DEBUGGING
    // console.log('dayRange[1]:', dayRange[1].format('MM-DD HH:mm')) // DEBUGGING
    // console.log('workRange[0]:', workRange[0].format('MM-DD HH:mm')) // DEBUGGING
    // console.log('workRange[1]:', workRange[1].format('MM-DD HH:mm')) // DEBUGGING
    // console.log('timeMin:', timeMin) // DEBUGGING
    // console.log('timeMax:', timeMax) // DEBUGGING

    const calendars = await fetchAllCalendars()
    const calendarIdsInfo = calendars
      .filter((calendar) => calendar.id !== userData.calendarId)
      .filter(
        (calendar) =>
          calendar.id.split('@')[1] !== 'group.v.calendar.google.com',
      )
      .map((calendar) => {
        return {
          id: calendar.id,
          summary: calendar.summary,
          colorId: parseInt(calendar.colorId),
          selected: calendar.selected,
        }
      }) // excluding the Algo calendar
    const calendarIds = calendarIdsInfo.map((calendar) => calendar.id)
    const eventsByTypeForToday = await getEventsByTypeForToday(
      timeMin,
      timeMax,
      calendarIds,
    )
    const timeRangesForDay = await getTimeRangesForDay(
      eventsByTypeForToday.timeBlocked,
      dayRange[0],
      dayRange[1],
    )
    const chunkRanges = divideTimeRangesIntoChunkRanges(
      timeRangesForDay.availableTimeRanges,
    )
    const hasWorkTime = userData.workDays[workRange[1].day()]
    const blocks = groupChunkRangesIntoBlocks(
      chunkRanges,
      MAX_NUM_CHUNKS,
      workRange[0],
      workRange[1],
      hasWorkTime,
    )

    // printBlocks(blocks.work, 'work') // DEBUGGING
    // printBlocks(blocks.personal, 'personal') // DEBUGGING

    const blocksOfChunksWithRankingAndTaskId = {
      work: rankBlocksOfChunks(blocks.work, userData.preferences),
      personal: rankBlocksOfChunks(blocks.personal, userData.preferences),
    }
    //*** GETTING AVAILABLE TIME RANGES END ***//

    //*** FIND TIME BLOCKS FOR USER'S TASKS START ***/
    const tasks = await getAllUserTasks(userId)
    const projects = await getAllUserProjects(userId)
    const tasksNotPassedDeadline = filterTaskNotPassedDeadline(
      tasks.nonCompleted,
      today,
    )
    const formattedTasks = formatTasks(tasksNotPassedDeadline, projects, today)
    const taskMap = {
      ...getTaskMap(formattedTasks.work),
      ...getTaskMap(formattedTasks.personal),
    }

    // console.log('formattedTasks:', formattedTasks) // DEBUGGING
    //*** FIND TIME BLOCKS FOR USER'S TASKS END ***/

    //*** CALCULATE THE RELATIVE PRIORITY OF EACH TASK AND ASSIGN TIME BLOCKS START ***/
    assignTimeBlocks(
      blocksOfChunksWithRankingAndTaskId.work,
      formattedTasks.work,
    )
    assignTimeBlocks(
      blocksOfChunksWithRankingAndTaskId.personal,
      formattedTasks.personal,
    )
    //*** CALCULATE THE RELATIVE PRIORITY OF EACH TASK AND ASSIGN TIME BLOCKS END ***/

    //*** TIME BLOCK FORMATTING START ***/
    const timeBlocks = {
      work: groupChunksByTaskId(blocksOfChunksWithRankingAndTaskId.work),
      personal: groupChunksByTaskId(
        blocksOfChunksWithRankingAndTaskId.personal,
      ),
    }
    const formattedTimeBlocks = [
      ...formatTimeBlocks(timeBlocks.work, true),
      ...formatTimeBlocks(timeBlocks.personal, false),
    ]
    const sortedTimeBlocks = getTimeBlocksSorted(formattedTimeBlocks)
    const timeBlocksWithTaskInfo = getTimeBlocksWithTaskInfo(
      sortedTimeBlocks,
      taskMap,
    )

    // console.log('timeBlocksWithTaskInfo:', timeBlocksWithTaskInfo) // DEBUGGING
    //*** TIME BLOCK FORMATTING END ***/

    // *** STORE ALLOCATED TASKS IN USER CHECKLIST START ***/
    const newChecklist = timeBlocksWithTaskInfo.map(
      (timeBlock) => timeBlock.taskId,
    )

    const newChecklistWithoutDuplicates = [...new Set(newChecklist)]

    // *** STORE ALLOCATED TASKS IN USER CHECKLIST END ***/

    // *** UPDATES USERINFO DOC IN FIREBASE START *** //
    const userTimeZone = await getUserTimeZone(userId)

    await updateUserInfo(userId, {
      checklist: newChecklistWithoutDuplicates,
      calendarIds: calendarIdsInfo,
      timeZone: userTimeZone,
    })
    // *** UPDATES USERINFO DOC IN FIREBASE END *** //

    //*** ALLOCATE TIME BLOCKS TO GOOGLE CALENDAR START ***/
    let updatableAlgoCalendarEvents = []
    if (userData.calendarId === null) {
      const result = await insertCalendar('Algo')
      userData.calendarId = result.id
      await updateUserInfo(userId, { calendarId: result.id })
    } else {
      const eventsInAlgoCalendar = await getEventsByTypeForToday(
        timeMin,
        timeMax,
        [userData.calendarId],
      )

      const yesterdayEndTime = dayRange[1].clone().subtract(1, 'day')
      const tomorrowStartTime = dayRange[0].clone().add(1, 'day')
      const eventsInAlgoCalendarWithinDayRange = getEventsInRange(
        eventsInAlgoCalendar.timeBlocked,
        yesterdayEndTime,
        tomorrowStartTime,
      )

      for (const event of eventsInAlgoCalendarWithinDayRange.startOuter) {
        // console.log('event (startOuter):', event) // DEBUGGING
        event.end.dateTime = yesterdayEndTime.toISOString()
        await updateEvent(userData.calendarId, event.id, event)
      }

      for (const event of eventsInAlgoCalendarWithinDayRange.endOuter) {
        // console.log('event (endOuter):', event) // DEBUGGING
        event.start.dateTime = tomorrowStartTime.toISOString()
        await updateEvent(userData.calendarId, event.id, event)
      }

      for (const event of eventsInAlgoCalendarWithinDayRange.bothOuter) {
        // console.log('event (bothOuter):', event) // DEBUGGING
        await insertEvent(
          userData.calendarId,
          tomorrowStartTime.toISOString(),
          event.end.dateTime,
          event.start.timeZone,
          event.summary,
          event.description,
          parseInt(event.colorId),
        )
        event.end.dateTime = yesterdayEndTime.toISOString()
        await updateEvent(userData.calendarId, event.id, event)
      }

      updatableAlgoCalendarEvents = eventsInAlgoCalendarWithinDayRange.between
    }

    // console.log('updatableAlgoCalendarEvents:', updatableAlgoCalendarEvents) // DEBUGGING

    const [filteredTimeBlocks, filteredUpdatableAlgoCalendarEvents] =
      filterExistingTimeBlocksAndEvents(
        timeBlocksWithTaskInfo,
        updatableAlgoCalendarEvents,
        userTimeZone,
      )

    // console.log('filteredTimeBlocks:', filteredTimeBlocks) // DEBUGGING
    // console.log(
    //   'filteredUpdatableAlgoCalendarEvents:',
    //   filteredUpdatableAlgoCalendarEvents,
    // ) // DEBUGGING

    // console.log('userData.calendarId: ', userData.calendarId) // DEBUGGING
    changeAlgoCalendarSchedule(
      filteredTimeBlocks,
      filteredUpdatableAlgoCalendarEvents,
      userData.calendarId,
      userTimeZone,
    )
    // *** ALLOCATE TIME BLOCKS TO GOOGLE CALENDAR END ***/
    // const t2 = new Date() // DEBUGGING

    // console.log("Run time of today's scheduler (ms):", t2 - t1) // DEBUGGING

    console.log('Schedule Created') // DEBUGGING
  } catch (error) {
    console.log(error)
  }
}

const filterExistingTimeBlocksAndEvents = (
  timeBlocks,
  events,
  userTimeZone,
) => {
  const filteredTimeBlocks = []
  const filteredEvents = []
  let timeBlockIdx = 0
  let eventIdx = 0
  while (timeBlockIdx < timeBlocks.length && eventIdx < events.length) {
    const timeBlock = timeBlocks[timeBlockIdx]
    const event = events[eventIdx]
    const timeBlockStartTime = timeBlock.start
    const eventStartTime = moment(event.start.dateTime)
    if (timeBlockStartTime.isSame(eventStartTime)) {
      const isSameStartTimeZone = userTimeZone === event.start.timeZone
      const isSameEndTime = timeBlock.end.isSame(moment(event.end.dateTime))
      const isSameEndTimeZone = userTimeZone === event.end.timeZone
      const isSameSummary = timeBlock.name === event.summary
      const isSameDescription =
        timeBlock.description === event.description ||
        (timeBlock.description === '' && event.description === undefined)
      const isSameColorId =
        getColorId(timeBlock.preference) === parseInt(event.colorId)
      if (
        isSameStartTimeZone &&
        isSameEndTime &&
        isSameEndTimeZone &&
        isSameSummary &&
        isSameDescription &&
        isSameColorId
      ) {
        timeBlockIdx++
        eventIdx++
      } else {
        // ELSE MOVE ON TO THE NEXT TIME BLOCK
        filteredTimeBlocks.push(timeBlock)
        timeBlockIdx++
      }
    } else if (timeBlockStartTime.isBefore(eventStartTime)) {
      filteredTimeBlocks.push(timeBlock)
      timeBlockIdx++
    } else {
      filteredEvents.push(event)
      eventIdx++
    }
  }
  while (timeBlockIdx < timeBlocks.length) {
    filteredTimeBlocks.push(timeBlocks[timeBlockIdx])
    timeBlockIdx++
  }
  while (eventIdx < events.length) {
    filteredEvents.push(events[eventIdx])
    eventIdx++
  }

  return [filteredTimeBlocks, filteredEvents]
}

// Color ID:
// 1 blue
// 2 green
// 3 purple
// 4 red
// 5 yellow
// 6 orange
// 7 turquoise
// 8 grey
// 9 bold blue
// 10 bold green
// 11 bold red

const getColorId = (preference) => {
  switch (preference) {
    case 0:
      return 6 // urgent: orange
    case 1:
      return 7 // deep: turquoise
    case 2:
      return 2 // shallow: green
    default:
      return 7 // default: turquoise
  }
}

const changeAlgoCalendarSchedule = async (
  timeBlocks,
  events,
  calendarId,
  userTimeZone,
) => {
  for (let i = 0; i < Math.min(events.length, timeBlocks.length); i++) {
    const event = events[i]
    const timeBlock = timeBlocks[i]
    event.start.dateTime = timeBlock.start.toISOString()
    event.start.timeZone = userTimeZone
    event.end.dateTime = timeBlock.end.toISOString()
    event.end.timeZone = userTimeZone
    event.summary = timeBlock.name
    event.description = timeBlock.description
    event.colorId = getColorId(timeBlock.preference)
    const newEvent = await updateEvent(calendarId, event.id, event)

    // console.log('updated item:', item?.id) // DEBUGGING
  }
  if (events.length > timeBlocks.length) {
    for (let i = timeBlocks.length; i < events.length; i++) {
      const event = events[i]
      const result = await deleteEvent(calendarId, event.id)

      // console.log('is item deleted?:', result) // DEBUGGING
    }
  }
  if (events.length < timeBlocks.length) {
    for (let i = events.length; i < timeBlocks.length; i++) {
      const timeBlock = timeBlocks[i]
      const newEvent = await insertEvent(
        calendarId,
        timeBlock.start.toISOString(),
        timeBlock.end.toISOString(),
        userTimeZone,
        timeBlock.name,
        timeBlock.description,
        getColorId(timeBlock.preference),
      )

      // console.log('inserted item:', item?.id) // DEBUGGING
    }
  }
}

const getEventsInRange = (events, start, end) => {
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

/***
 * requirements:
 * timeBlocks: { start, end, preference, taskId, isWork }[]
 * taskMap: { taskId: { priority, deadline, timeLength, preference, taskId, name, description } }
 * ***/
const getTimeBlocksWithTaskInfo = (timeBlocks, taskMap) => {
  return timeBlocks.map((timeBlock) => {
    const taskId = timeBlock.taskId
    const taskInfo = taskMap[taskId]
    return {
      taskId: taskId,
      start: timeBlock.start,
      end: timeBlock.end,
      isWork: timeBlock.isWork,
      name: taskInfo.name,
      description: taskInfo.description,
      preference: taskInfo.preference,
    }
  })
}

/***
 * requirements:
 * timeBlocks: { start, end, preference, taskId }[]
 * ***/
const formatTimeBlocks = (timeBlocks, isWork) => {
  const formattedTimeBlocks = []
  for (const timeBlock of timeBlocks) {
    const formattedTimeBlock = {
      ...timeBlock,
      isWork: isWork,
    }
    formattedTimeBlocks.push(formattedTimeBlock)
  }
  return formattedTimeBlocks
}

/***
 * requirements:
 * timeBlocks: { start, end, preference, taskId, isWork }[]
 * ***/
const getTimeBlocksSorted = (timeBlocks) => {
  const timeBlocksSorted = timeBlocks.sort((a, b) =>
    a.start.isAfter(b.start) ? 1 : a.start.isBefore(b.start) ? -1 : 0,
  )
  return timeBlocksSorted
}

/***
 * requirements:
 * blocks: { start, end, preference, taskId }[][] (taskId is firestore item id or null)
 * ***/
const groupChunksByTaskId = (blocks) => {
  const timeBlocksWithTaskId = []
  let curTaskId = null
  let startIdxI = null
  let startIdxJ = null
  let endIdxI = null
  let endIdxJ = null
  for (let i = 0; i < blocks.length; i++) {
    for (let j = 0; j < blocks[i].length; j++) {
      if (blocks[i][j].taskId === null) continue
      if (curTaskId === null) {
        curTaskId = blocks[i][j].taskId
        startIdxI = i
        startIdxJ = j
      } else if (curTaskId !== blocks[i][j].taskId) {
        if (
          timeBlocksWithTaskId.length >= 1 &&
          timeBlocksWithTaskId[timeBlocksWithTaskId.length - 1].taskId ===
            curTaskId &&
          timeBlocksWithTaskId[timeBlocksWithTaskId.length - 1].end.isSame(
            blocks[startIdxI][startIdxJ].start,
          )
        ) {
          timeBlocksWithTaskId[timeBlocksWithTaskId.length - 1].end =
            blocks[endIdxI][endIdxJ].end
        } else {
          timeBlocksWithTaskId.push({
            taskId: curTaskId,
            start: blocks[startIdxI][startIdxJ].start,
            end: blocks[endIdxI][endIdxJ].end,
            preference: blocks[startIdxI][startIdxJ].preference,
          })
        }
        curTaskId = blocks[i][j].taskId
        startIdxI = i
        startIdxJ = j
      }
      // if current chunk has a task id, update the end index
      endIdxI = i
      endIdxJ = j
    }
    if (curTaskId !== null) {
      if (
        timeBlocksWithTaskId.length >= 1 &&
        timeBlocksWithTaskId[timeBlocksWithTaskId.length - 1].taskId ===
          curTaskId &&
        timeBlocksWithTaskId[timeBlocksWithTaskId.length - 1].end.isSame(
          blocks[startIdxI][startIdxJ].start,
        )
      ) {
        timeBlocksWithTaskId[timeBlocksWithTaskId.length - 1].end =
          blocks[endIdxI][endIdxJ].end
      } else {
        timeBlocksWithTaskId.push({
          taskId: curTaskId,
          start: blocks[startIdxI][startIdxJ].start,
          end: blocks[endIdxI][endIdxJ].end,
          preference: blocks[startIdxI][startIdxJ].preference,
        })
      }
      curTaskId = null
    }
  }
  return timeBlocksWithTaskId
}

/***
 * requirements:
 * tasks: { priority, deadline, timeLength, preference, taskId, name, description }[]
 * ***/
const getTaskMap = (tasks) => {
  const taskMap = {}
  for (const task of tasks) {
    taskMap[task.taskId] = task
  }
  return taskMap
}

const normalize = (val, range, flip) => {
  if (flip) {
    return (range[1] - val) / (range[1] - range[0])
  }
  return (val - range[0]) / (range[1] - range[0])
}

/***
 * requirements:
 * priority: number (1-3)
 * deadline: number (0-14)
 * timeLength: number (1-32)
 * ***/
const calculateTaskPreference = (priority, deadline, timeLength) => {
  const isShort = timeLength <= 3
  const isUrgent = deadline !== null && deadline <= 2
  const isImportant =
    priority === 3 ? true : priority === 2 && !isShort ? true : false
  if (isUrgent && isImportant) {
    return 0 // urgent
  } else if (isUrgent && !isImportant) {
    return 2 // shallow
  } else if (!isUrgent && isImportant) {
    return 1 // deep
  } else {
    return 2 // shallow
  }
}

const linearScale = (num, inputRange, outputRange) => {
  const slope =
    (outputRange[1] - outputRange[0]) / (inputRange[1] - inputRange[0])
  return slope * (num - inputRange[0]) + outputRange[0]
}

/***
 * deadline range: 0-14 or null
 * ***/
const normalizeDeadline = (deadline) => {
  if (deadline === 0) {
    return 1
  } else if (deadline === 1) {
    return 0.4
  } else if (deadline === 2) {
    return 0.25
  } else if (deadline === 3) {
    return 0.15
  } else {
    // 4: 0.1
    // ... (scales linearly down)
    // 14: 0
    if (deadline === null) return 0
    return linearScale(deadline, [4, 14], [0.1, 0])
  }
}

/***
 * requirements:
 * params and weights have the same property names and all values are numbers
 * ***/
const calculateRelativePriority = (params, weights) => {
  let relativePriority = 0
  for (const key in params) {
    relativePriority += params[key] * weights[key]
  }
  return normalize(relativePriority, RELATIVE_PRIORITY_RANGE, false)
}

/***
 * requirements:
 * blocks: { start, end, preference, taskId }[][] (taskId is null)
 * tasks: { priority, deadline, timeLength, preference, taskId, name, description }[]
 * note:
 * mutates the blocks array (sets the taskId property in each chunk)
 * ***/
const assignTimeBlocks = (blocks, tasks) => {
  // iterate over blocks
  for (let i = 0; i < blocks.length; i++) {
    let selectedTaskIdx = null
    // iterate over chunks
    for (let j = 0; j < blocks[i].length; j++) {
      if (selectedTaskIdx !== null) {
        if (tasks[selectedTaskIdx].timeLength === 0) {
          selectedTaskIdx = null
        } else {
          tasks[selectedTaskIdx].timeLength--
          blocks[i][j].taskId = tasks[selectedTaskIdx].taskId
          continue
        }
      }
      let maxRealtivePriority = -1
      let maxTaskIdx = null
      // iterate over tasks
      for (let k = 0; k < tasks.length; k++) {
        // current task fully allocated
        if (tasks[k].timeLength === 0) continue

        // calculate the relative priority of the task
        const diffTimeLength = Math.abs(
          tasks[k].timeLength - (blocks[i].length - j),
        )
        const isPreference =
          (tasks[k].preference === blocks[i][j].preference) === true ? 1 : 0

        const normalizedParams = {
          priority: normalize(tasks[k].priority, PRIORITY_RANGE, false),
          deadline: normalizeDeadline(tasks[k].deadline),
          timeLength: normalize(
            Math.log2(tasks[k].timeLength),
            TIME_LENGTH_RANGE,
            true,
          ), // scaled by log2
          diffTimeLength: normalize(
            Math.log2(diffTimeLength + 1),
            TIME_LENGTH_RANGE,
            true,
          ), // scaled by log2
          isPreference: isPreference,
        }

        const relativePriority = calculateRelativePriority(
          normalizedParams,
          WEIGHTS,
        )
        if (relativePriority > maxRealtivePriority) {
          maxRealtivePriority = relativePriority
          maxTaskIdx = k
        }
      }
      // if no task was selected for max relative priority, then the assignment is done
      if (maxTaskIdx === null) return
      tasks[maxTaskIdx].timeLength--
      blocks[i][j].taskId = tasks[maxTaskIdx].taskId
      selectedTaskIdx = maxTaskIdx
    }
  }
}

/***
 * requirements:
 * tasks: task[] (from firestore)
 * today: moment object
 * ***/
const filterTaskNotPassedDeadline = (tasks, today) => {
  return tasks.filter((task) => {
    if (task.date === '') return true
    const deadline = moment(task.date, 'DD-MM-YYYY')
    return deadline.diff(today, 'days') >= 0
  })
}

/***
 * requirements:
 * tasks: task[] (from firestore)
 * projects: project[] (from firestore)
 * ***/
const formatTasks = (tasks, projects, today) => {
  const projectIdToIsWork = {}
  for (const project of projects) {
    projectIdToIsWork[project.projectId] = project.projectIsWork
  }
  const formattedWorkTasks = []
  const formattedPersonalTasks = []
  for (const task of tasks) {
    const formattedTimeLength = task.timeLength / 15
    const formattedDate =
      task.date !== '' ? moment(task.date, 'DD-MM-YYYY') : null
    const deadline =
      formattedDate !== null
        ? Math.min(formattedDate.diff(today, 'days'), 14)
        : null
    const preference = calculateTaskPreference(
      task.priority,
      deadline,
      formattedTimeLength,
    )
    const formattedTask = {
      priority: task.priority,
      deadline: deadline,
      timeLength: formattedTimeLength,
      preference: preference,
      taskId: task.taskId,
      name: task.name,
      description: task.description,
    }
    if (projectIdToIsWork[task.projectId]) {
      formattedWorkTasks.push(formattedTask)
    } else {
      formattedPersonalTasks.push(formattedTask)
    }
  }
  return {
    work: formattedWorkTasks,
    personal: formattedPersonalTasks,
  }
}

/***
 * requirements:
 * blocks: { start, end }[][]
 * ***/
const rankBlocksOfChunks = (blocks, preferences) => {
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

/***
 * DEBUGGING PURPOSES ONLY
 * requirements:
 * blocks: { start, end, preference }[][]
 * blockType: string
 * ***/
const printBlocks = (blocks, blockType) => {
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
 * arr: array of items
 * size: size of each subarr
 * ***/
function sliceIntoSubarr(arr, size) {
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
const groupChunkRangesIntoBlocks = (
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
 * requirements:
 * timeRanges: { start: moment, end: moment }[]
 * ***/
const divideTimeRangesIntoChunkRanges = (timeRanges) => {
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

const getEventsByTypeForToday = async (timeMin, timeMax, calendarIds) => {
  const events = await fetchAllEvents(timeMin, timeMax, calendarIds)
  const eventsByType = { timeBlocked: [], allDay: [] }
  for (const event of events) {
    if (event.start.dateTime) {
      eventsByType.timeBlocked.push(event)
    } else {
      eventsByType.allDay.push(event)
    }
  }
  return eventsByType
}

/***
 * requirements:
 * events: Google Calendar API events (time-blocked)
 * timeStartDay: moment object
 * timeEndDay: moment object
 * currently only returns available time ranges, can be expanded in future to return blocked time ranges as well
 * ***/
const getTimeRangesForDay = async (events, timeStartDay, timeEndDay) => {
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
  const timeRangesForDay = {
    availableTimeRanges: getAvailableTimeRanges(timesWithInfoSorted),
  }
  return timeRangesForDay
}
