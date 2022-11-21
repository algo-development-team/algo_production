import { fetchAllCalendars } from 'gapiHandlers'
import { fetchAllEvents } from './events'
import {
  getTimesWithInfo,
  getTimesWithInfoSorted,
  getAvailableTimeRanges,
} from './timeRanges'
import { getUserInfo } from 'handleUserInfo'
import moment from 'moment'
import { timeType } from 'components/enums'
import { getAllUserTasks } from 'handleUserTasks'
import { getAllUserProjects } from 'handleUserProjects'
import { getPreferences } from 'handlePreferences'

const MAX_NUM_CHUNKS = 8 // 2h
const PRIORITY_RANGE = Object.freeze([1, 3])
const DEADLINE_RANGE = Object.freeze([0, 14])
const TIME_LENGTH_RANGE = Object.freeze([1, 32])
const DIFF_TIME_LENGTH_RANGE = Object.freeze([0, 7])

/***
 * Note: schedules the entire day, no matter what the current time is
 * returns checklist for the day
 * ***/
export const scheduleToday = async (userId) => {
  try {
    //*** GETTING AVAILABLE TIME RANGES START ***//
    const userInfo = await getUserInfo(userId)
    if (userInfo.empty === true || userInfo.failed === true) {
      return { checklist: [], failed: true }
    }
    const userData = userInfo.userInfoDoc.data()
    const now = moment()
    const sleepRange = userData.sleepTimeRange
      .split('-')
      .map((time) => moment(time, 'HH:mm'))
    const workRange = userData.workTimeRange
      .split('-')
      .map((time) => moment(time, 'HH:mm'))
    const dayRange = [sleepRange[1], sleepRange[0]]
    // the end of the day is in the next day
    if (dayRange[0].isAfter(dayRange[1])) {
      dayRange[1].add(1, 'day')
    }
    // the end of the work time is in the next day
    if (workRange[0].isAfter(workRange[1])) {
      workRange[1].add(1, 'day')
    }
    // now is before the start of sleep range (i.e. before 11pm of night before)
    // continues to schedule for the current day
    if (dayRange[1].clone().subtract(1, 'day').isAfter(now)) {
      dayRange[0].subtract(1, 'day')
      dayRange[1].subtract(1, 'day')
      workRange[0].subtract(1, 'day')
      workRange[1].subtract(1, 'day')
    }

    // console.log('dayRange[0]:', dayRange[0].format('MM-DD HH:mm')) // DEBUGGING
    // console.log('dayRange[1]:', dayRange[1].format('MM-DD HH:mm')) // DEBUGGING
    // console.log('workRange[0]:', workRange[0].format('MM-DD HH:mm')) // DEBUGGING
    // console.log('workRange[1]:', workRange[1].format('MM-DD HH:mm')) // DEBUGGING

    const eventsByTypeForToday = await getEventsByTypeForToday(now)
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

    printBlocks(blocks.work, 'work') // DEBUGGING
    printBlocks(blocks.personal, 'personal') // DEBUGGING

    const blocksOfChunksWithRanking = {
      work: rankBlocksOfChunks(blocks.work, userData.rankingPreferences),
      personal: rankBlocksOfChunks(
        blocks.personal,
        userData.rankingPreferences,
      ),
    }

    // console.log('blocksOfChunksWithRanking', blocksOfChunksWithRanking) // DEBUGGING

    //*** GETTING AVAILABLE TIME RANGES END ***//

    //*** FIND TIME BLOCKS FOR USER'S TASKS START ***/
    const tasks = await getAllUserTasks(userId)
    const projects = await getAllUserProjects(userId)
    const tasksNotPassedDeadline = filterTaskNotPassedDeadline(
      tasks.nonCompleted,
      now,
    )
    const formattedTasks = formatTasks(tasksNotPassedDeadline, projects, now)

    console.log('formattedTasks:', formattedTasks) // DEBUGGING

    //*** FIND TIME BLOCKS FOR USER'S TASKS END ***/

    //*** CALCULATE THE RELATIVE PRIORITY OF EACH TASK AND ASSIGN TIME BLOCKS START ***/
    const t1 = new Date()
    assignTimeBlocks(
      blocksOfChunksWithRanking.work,
      formattedTasks.work,
      PRIORITY_RANGE,
      DEADLINE_RANGE,
      TIME_LENGTH_RANGE,
      DIFF_TIME_LENGTH_RANGE,
    )
    assignTimeBlocks(
      blocksOfChunksWithRanking.personal,
      formattedTasks.personal,
      PRIORITY_RANGE,
      DEADLINE_RANGE,
      TIME_LENGTH_RANGE,
      DIFF_TIME_LENGTH_RANGE,
    )
    const t2 = new Date()
    console.log(t2 - t1)
    //*** CALCULATE THE RELATIVE PRIORITY OF EACH TASK AND ASSIGN TIME BLOCKS END ***/
  } catch (error) {
    console.log(error)
    return { checklist: [], failed: true }
  }
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

/***
 * requirements:
 * blocks: { start, end, preference }[][]
 * tasks: { priority, deadline, timeLength }[]
 * ***/
const assignTimeBlocks = (
  blocks,
  tasks,
  priorityRange,
  deadlineRange,
  timeLengthRange,
  diffTimeLengthRange,
) => {
  // iterate over blocks
  for (let i = 0; i < blocks.length; i++) {
    // iterate over chunks
    for (let j = 0; j < blocks[i].length; j++) {
      // iterate over tasks
      for (let k = 0; k < tasks.length; k++) {
        // calculate the relative priority of the task
        const diffTimeLength = Math.min(
          Math.abs(tasks[k].timeLength - (blocks[i].length - j)),
          7,
        )
        const isPreference =
          (tasks[k].preference === blocks[i][j].preference) === true ? 1 : 0
        const normalizedParams = {
          priority: normalize(tasks[k].priority, priorityRange, true),
          deadline: normalize(tasks[k].deadline, deadlineRange, true),
          timeLength: normalize(tasks[k].timeLength, timeLengthRange, true),
          diffTimeLength: normalize(diffTimeLength, diffTimeLengthRange, true),
          isPreference: isPreference,
        }

        console.log('normalizedParams:', normalizedParams) // DEBUGGING
      }
    }
  }
}

/***
 * requirements:
 * tasks: task[] (from firestore)
 * now: moment object
 * ***/
const filterTaskNotPassedDeadline = (tasks, now) => {
  return tasks.filter((task) => {
    if (task.date === '') return true
    const deadline = moment(task.date, 'DD-MM-YYYY')
    return deadline.diff(now, 'days') >= 0
  })
}

/***
 * requirements:
 * tasks: task[] (from firestore)
 * projects: project[] (from firestore)
 * ***/
const formatTasks = (tasks, projects, now) => {
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
        ? Math.min(formattedDate.diff(now, 'days'), 14)
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
const rankBlocksOfChunks = (blocks, rankingPreferences) => {
  const preferences = getPreferences(rankingPreferences)
  return blocks.map((block) =>
    block.map((chunk) => {
      return {
        start: chunk.start,
        end: chunk.end,
        preference: preferences[chunk.start.hour()],
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

const getEventsByTypeForToday = async (now) => {
  const today = now.startOf('day')
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
  const calendars = await fetchAllCalendars()
  const calendarIds = calendars.map((calendar) => calendar.id)
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
