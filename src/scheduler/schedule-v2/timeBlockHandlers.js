const EMPTY_TASK_ID = 'EMPTY_TASK_ID'

function assignEmptyTaskIdForBufferRanges(blocksMultDays, bufferRanges) {
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
