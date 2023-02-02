const EMPTY_TASK_ID = 'EMPTY_TASK_ID'

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

/*
 * parameters:
 * blocksMultDays: {start: moment.Moment, end: moment.Moment, preference: number, taskId: string | null}[][][]
 * tasks: {taskId: string, name: string, description: string, priority: number, startDate: moment.Moment | null, date: moment.Moment | null, timeLength: number}
 * bufferRanges: {id: string, start: moment.Moment, end: moment.Moment}[]
 * now: moment.Moment
 */
export const allocateWorkTimeBlocks = (
  blocksMultDays,
  tasks,
  taskToAllocatedTimeLengthMap,
  bufferRanges,
  now,
) => {
  assignEmptyTaskIdForBufferRanges(blocksMultDays, bufferRanges)
  assignEmptyTaskIdForPassedTimeBlocks(blocksMultDays, now)
}

export const allocatePersonalTimeBlocks = (
  blocksMultDays,
  tasks,
  taskToAllocatedTimeLengthMap,
  bufferRanges,
  restHours,
  now,
) => {
  assignEmptyTaskIdForBufferRanges(blocksMultDays, bufferRanges)
  assignEmptyTaskIdForPassedTimeBlocks(blocksMultDays, now)
  assignEmptyTaskIdForRestHours(blocksMultDays, restHours)
  console.log('blocksMultDays', blocksMultDays) // DEBUGGING
}
