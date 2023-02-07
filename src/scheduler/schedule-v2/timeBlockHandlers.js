import { EMPTY_TASK_ID } from './taskIdAllocationHandlers'

/***
 * requirements:
 * blocks: { start, end, preference, taskId }[][] (taskId is firestore item id or null)
 * ***/
export const groupChunksByTaskId = (blocks) => {
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
 * timeBlocks: { start, end, preference, taskId }[]
 * ***/
export const formatTimeBlocks = (timeBlocks, isWork) => {
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
export const getTimeBlocksSorted = (timeBlocks) => {
  const timeBlocksSorted = timeBlocks.sort((a, b) =>
    a.start.isAfter(b.start) ? 1 : a.start.isBefore(b.start) ? -1 : 0,
  )
  return timeBlocksSorted
}

export const filterTimeBlocks = (timeBlocks) => {
  return timeBlocks.filter((timeBlock) => timeBlock.taskId !== EMPTY_TASK_ID)
}
