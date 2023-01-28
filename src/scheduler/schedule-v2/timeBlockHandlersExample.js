/* START OF V1 CODE */
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

const normalize = (val, range, flip) => {
  if (flip) {
    return (range[1] - val) / (range[1] - range[0])
  }
  return (val - range[0]) / (range[1] - range[0])
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
/* END OF V1 CODE */
