const EMPTY_TASK_ID = 'EMPTY_TASK_ID'

const assignEmptyTaskIdForBufferRanges = (blocksMultDays, bufferRanges) => {
  blocksMultDays.forEach((blocksSingleDay) => {
    blocksSingleDay.forEach((chunks) => {
      chunks.forEach((chunk) => {
        bufferRanges.forEach((bufferRange) => {
          if (
            chunk.start.isSameOrAfter(bufferRange.start) &&
            chunk.end.isSameOrBefore(bufferRange.end)
          ) {
            chunk.taskId = EMPTY_TASK_ID
          }
        })
      })
    })
  })
}

/*
 * parameters:
 * blocksMultDays: {start: moment.Moment, end: moment.Moment, preference: number, taskId: string | null}[][][]
 * tasks: {taskId: string, name: string, description: string, priority: number, startDate: moment.Moment | null, date: moment.Moment | null, timeLength: number, allocatedTimeLength: number}
 * bufferRanges: {id: string, start: moment.Moment, end: moment.Moment}[]
 * now: moment.Moment
 */
export const allocateWorkTimeBlocks = (
  blocksMultDays,
  tasks,
  bufferRanges,
  now,
) => {
  assignEmptyTaskIdForBufferRanges(blocksMultDays, bufferRanges)
}

export const allocatePersonalTimeBlocks = (
  blocksMultDays,
  tasks,
  bufferRanges,
  now,
) => {
  assignEmptyTaskIdForBufferRanges(blocksMultDays, bufferRanges)
}
