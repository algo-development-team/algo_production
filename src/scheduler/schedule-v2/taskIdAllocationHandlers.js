export const EMPTY_TASK_ID = 'EMPTY_TASK_ID'
const SINGLE_TYPE = 'SINGLE_TYPE'
const MULTIPLE_TYPE = 'MULTIPLE_TYPE'

const assignEmptyTaskIdForBufferRanges = (blocksMultDays, bufferRanges) => {
  blocksMultDays.forEach((blocksSingleDay) => {
    blocksSingleDay.forEach((chunks) => {
      chunks.forEach((chunk) => {
        for (const bufferRange of bufferRanges) {
          if (
            chunk.start.isSameOrAfter(bufferRange.start) &&
            chunk.end.isSameOrBefore(bufferRange.end)
          ) {
            chunk.taskId = EMPTY_TASK_ID
          } else if (chunk.start.isSameOrAfter(bufferRange.end)) {
            continue
          }
        }
      })
    })
  })
}

const assignEmptyTaskIdForPassedTimeBlocks = (blocksMultDays, now) => {
  blocksMultDays.forEach((blocksSingleDay) => {
    blocksSingleDay.forEach((chunks) => {
      chunks.forEach((chunk) => {
        if (now.isAfter(chunk.start)) {
          chunk.taskId = EMPTY_TASK_ID
        } else {
          return
        }
      })
    })
  })
}

const assignEmptyTaskIdForRestHours = (blocksMultDays, restHours) => {
  blocksMultDays.forEach((blocksSingleDay) => {
    blocksSingleDay.forEach((chunks) => {
      chunks.forEach((chunk) => {
        const hour = chunk.start.hour()
        if (restHours[hour]) {
          chunk.taskId = EMPTY_TASK_ID
        }
      })
    })
  })
}

const validateTasks = (tasks, tasksMap) => {
  const validTasks = []
  for (const task of tasks) {
    if (tasksMap[task.taskId].allocatableTimeLength > 0) {
      validTasks.push(task)
    }
  }
  return validTasks
}

const hasTasksLeft = (tasks, tasksMap) => {
  for (const task of tasks) {
    if (tasksMap[task.taskId].allocatableTimeLength > 0) {
      return true
    }
  }
  return false
}

const hasEnoughTimeForTasks = (totalNumAvailableChunks, tasks, tasksMap) => {
  const validTasks = validateTasks(tasks, tasksMap)
  let totalTasksAllocatableTimeLength = 0
  for (const validHighTask of validTasks) {
    totalTasksAllocatableTimeLength +=
      tasksMap[validHighTask.taskId].allocatableTimeLength
  }
  if (totalTasksAllocatableTimeLength > totalNumAvailableChunks) {
    return false
  }
  return true
}

const formatDiffTimeLength = (diffTimeLength) => {
  if (diffTimeLength === 0) {
    return 0
  } else if (diffTimeLength > 0) {
    return (diffTimeLength / 15) * 2 - 1
  } else {
    return (diffTimeLength / 15) * -2
  }
}

const normalizeLog2 = (min, value) => {
  return 1 / (1 + Math.log2(value - min + 1))
}

/***
 * parameters:
 * priority: number (1-4)
 * ***/
const normalizePriority = (priority) => {
  if (priority <= 1) {
    return 0
  } else if (priority === 2) {
    return 1 / 3
  } else if (priority === 3) {
    return 2 / 3
  } else if (priority >= 4) {
    return 1
  }
}

/***
 * parameters:
 * diffTimeLength: number ((-105)-945)
 * hasStartDate: boolean
 * hasDate: boolean
 * daysUntilDeadline: number (0~N)
 * return value:
 * ~0-9
 * ***/
const calculateRelativePriorityForSingleType = (
  diffTimeLength,
  hasStartDate,
  hasDate,
  daysUntilDeadline,
) => {
  const formattedDiffTimeLength = formatDiffTimeLength(diffTimeLength) // (0-125)
  const normalizedDiffTimeLength = normalizeLog2(0, formattedDiffTimeLength) // (0-1)
  const normalizedHasStartDate = hasStartDate ? 1 : 0 // (0-1)
  const normalizedDaysUntilDeadline = normalizeLog2(0, daysUntilDeadline) // (0-1)
  return (
    1.5 * normalizedHasStartDate +
    3 * normalizedDiffTimeLength +
    4.5 * (hasDate ? normalizedDaysUntilDeadline : 0)
  )
}

/***
 * parameters:
 * diffTimeLength: number ((-105)-945)
 * hasStartDate: boolean
 * hasDate: boolean
 * daysUntilDeadline: number (0~N)
 * return value:
 * ~0-9
 * ***/
const calculateRelativePriorityForMultipleType = (
  diffTimeLength,
  hasStartDate,
  hasDate,
  daysUntilDeadline,
  priority,
) => {
  const formattedDiffTimeLength = formatDiffTimeLength(diffTimeLength) // (0-125)
  const normalizedDiffTimeLength = normalizeLog2(0, formattedDiffTimeLength) // (0-1)
  const normalizedHasStartDate = hasStartDate ? 1 : 0 // (0-1)
  const normalizedDaysUntilDeadline = normalizeLog2(0, daysUntilDeadline) // (0-1)
  const normalizedPriority = normalizePriority(priority) // (0-1)
  return (
    normalizedHasStartDate +
    2 * normalizedDiffTimeLength +
    3 * (hasDate ? normalizedDaysUntilDeadline : 0) +
    3 * normalizedPriority
  )
}

const allocateTasks = (
  chunk,
  timeLengthRemaining,
  tasks,
  tasksMap,
  curDay,
  type,
) => {
  const validTasks = validateTasks(tasks, tasksMap)
  if (validTasks.length === 0) return
  let max = -1
  let maxIndex = 0
  for (let i = 0; i < validTasks.length; i++) {
    const diffTimeLength =
      tasksMap[validTasks[i].taskId].allocatableTimeLength - timeLengthRemaining
    const daysUntilDeadline = validTasks[i].dayDate - curDay
    let relativePriority = 0
    if (type === SINGLE_TYPE) {
      relativePriority = calculateRelativePriorityForSingleType(
        diffTimeLength,
        validTasks[i].hasStartDate,
        validTasks[i].hasDate,
        daysUntilDeadline,
      )
    } else if (type === MULTIPLE_TYPE) {
      relativePriority = calculateRelativePriorityForMultipleType(
        diffTimeLength,
        validTasks[i].hasStartDate,
        validTasks[i].hasDate,
        daysUntilDeadline,
        tasksMap[validTasks[i].taskId].priority,
      )
    }
    if (relativePriority > max) {
      max = relativePriority
      maxIndex = i
    }
  }
  chunk.taskId = validTasks[maxIndex].taskId
  tasksMap[validTasks[maxIndex].taskId].allocatableTimeLength -= 15
}

const allocateLowAverageHighTasks = (
  chunk,
  timeLengthRemaining,
  lowTasks,
  averageTasks,
  highTasks,
  tasksMap,
  curDay,
) => {
  if (chunk.preference === 1 && hasTasksLeft(highTasks, tasksMap)) {
    // allocate high tasks
    allocateTasks(
      chunk,
      timeLengthRemaining,
      highTasks,
      tasksMap,
      curDay,
      SINGLE_TYPE,
    )
  } else if (chunk.preference === 2 && hasTasksLeft(lowTasks, tasksMap)) {
    // allocate low tasks
    allocateTasks(
      chunk,
      timeLengthRemaining,
      lowTasks,
      tasksMap,
      curDay,
      SINGLE_TYPE,
    )
  } else {
    // allocate all tasks
    const combinedTasks = [...lowTasks, ...averageTasks, ...highTasks]
    allocateTasks(
      chunk,
      timeLengthRemaining,
      combinedTasks,
      tasksMap,
      curDay,
      MULTIPLE_TYPE,
    )
  }
  return
}

const getTotalNumAvailableChunks = (blocksSingleDay) => {
  let totalNumAvailableChunks = 0
  for (const chunks of blocksSingleDay) {
    for (const chunk of chunks) {
      if (chunk.taskId !== EMPTY_TASK_ID) {
        totalNumAvailableChunks++
      }
    }
  }
  return totalNumAvailableChunks
}

const getChunkFormattedStartToNumAvailableChunksMap = (blocksSingleDay) => {
  let totalNumAvailableChunks = getTotalNumAvailableChunks(blocksSingleDay)
  const chunkFormattedStartToNumAvailableChunksMap = {}
  for (const chunks of blocksSingleDay) {
    for (const chunk of chunks) {
      if (chunk.taskId !== EMPTY_TASK_ID) {
        chunkFormattedStartToNumAvailableChunksMap[chunk.start.toISOString()] =
          totalNumAvailableChunks
        totalNumAvailableChunks--
      }
    }
  }
  return chunkFormattedStartToNumAvailableChunksMap
}

const assignTaskIdForTasks = (blocksMultDays, categorizedTasks, tasksMap) => {
  for (let i = 0; i < blocksMultDays.length; i++) {
    const blocksSingleDay = blocksMultDays[i]
    const categorizedTasksSingleDay = categorizedTasks[i]
    const chunkFormattedStartToNumAvailableChunksMap =
      getChunkFormattedStartToNumAvailableChunksMap(blocksSingleDay)
    for (const chunks of blocksSingleDay) {
      let numChunksTimeLengthRemaining = chunks.length * 15
      for (const chunk of chunks) {
        if (chunk.taskId === EMPTY_TASK_ID) {
          continue
        }
        if (hasTasksLeft(categorizedTasksSingleDay.veryHigh, tasksMap)) {
          allocateTasks(
            chunk,
            numChunksTimeLengthRemaining,
            categorizedTasksSingleDay.veryHigh,
            tasksMap,
            i,
            SINGLE_TYPE,
          )
        } else if (
          !hasEnoughTimeForTasks(
            chunkFormattedStartToNumAvailableChunksMap[
              chunk.start.toISOString()
            ],
            categorizedTasksSingleDay.high,
            tasksMap,
          )
        ) {
          allocateTasks(
            chunk,
            numChunksTimeLengthRemaining,
            categorizedTasksSingleDay.high,
            tasksMap,
            i,
            SINGLE_TYPE,
          )
        } else {
          allocateLowAverageHighTasks(
            chunk,
            numChunksTimeLengthRemaining,
            categorizedTasksSingleDay.low,
            categorizedTasksSingleDay.average,
            categorizedTasksSingleDay.high,
            tasksMap,
            i,
          )
        }
        numChunksTimeLengthRemaining -= 15
      }
    }
  }
}

const rearrangeBlocksMultDays = (blocksMultDays, workRanges) => {
  const rearrangedBlocksMultDays = []
  for (let i = 0; i < blocksMultDays.length; i++) {
    const rearrangedBlocksSingleDay = []
    let afterWorkChunksStartIdx = 0
    for (let j = 0; j < blocksMultDays[i].length; j++) {
      if (blocksMultDays[i][j][0].start.isSameOrAfter(workRanges[i][1])) {
        afterWorkChunksStartIdx = j
        break
      }
    }
    for (let j = afterWorkChunksStartIdx; j < blocksMultDays[i].length; j++) {
      rearrangedBlocksSingleDay.push(blocksMultDays[i][j])
    }
    for (let j = 0; j < afterWorkChunksStartIdx; j++) {
      rearrangedBlocksSingleDay.push(blocksMultDays[i][j])
    }
    rearrangedBlocksMultDays.push(rearrangedBlocksSingleDay)
  }
  return rearrangedBlocksMultDays
}

/*
 * note:
 * mutate blocksMultDays and tasksMap
 * parameters:
 * blocksMultDays: {start: moment.Moment, end: moment.Moment, preference: number, taskId: string | null}[][][]
 * categorizedTasks: {low: {taskId: string, hasStartDate: boolean, hasEndDate: boolean, dayDate: number}[], average: ..., high: ..., veryHigh: ...}[] (0~N)
 * tasksMap (mutatable): {allocatableTimeLength: number, date: moment.Moment, description: string, name: string, priority: number, startDate: moment.Moment, taskId: string}
 * bufferRanges: {id: string, start: moment.Moment, end: moment.Moment}[]
 * now: moment.Moment
 */
export const allocateWorkTimeBlocks = (
  blocksMultDays,
  categorizedTasks,
  tasksMap,
  bufferRanges,
  now,
) => {
  assignEmptyTaskIdForBufferRanges(blocksMultDays, bufferRanges)
  assignEmptyTaskIdForPassedTimeBlocks(blocksMultDays, now)
  assignTaskIdForTasks(blocksMultDays, categorizedTasks, tasksMap)
}

export const allocatePersonalTimeBlocks = (
  blocksMultDays,
  categorizedTasks,
  tasksMap,
  bufferRanges,
  workRanges,
  restHours,
  now,
) => {
  assignEmptyTaskIdForBufferRanges(blocksMultDays, bufferRanges)
  assignEmptyTaskIdForPassedTimeBlocks(blocksMultDays, now)
  assignEmptyTaskIdForRestHours(blocksMultDays, restHours)
  const rearrangedBlocksMultDays = rearrangeBlocksMultDays(
    blocksMultDays,
    workRanges,
  )
  assignTaskIdForTasks(rearrangedBlocksMultDays, categorizedTasks, tasksMap)
}
