import { useTasksCount } from 'hooks'
import { useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

/* fix issue in this component soon */
export const ProjectTasksCounts = ({ projectId, name, isDefaultGroup }) => {
  // const count = useTasksCount(isDefaultGroup, projectId, name)
  // const [taskCount, setTaskCount] = useState(count)
  // const params = useParams()
  // useLayoutEffect(() => {
  //   setTaskCount(count)
  // }, [count, params.isDefaultGroup])
  // return (
  //   <div
  //     className={`task-count ${name == 'Checklist' ? 'task-count__red' : ''} `}
  //   >
  //     {taskCount > 0 && taskCount}
  //   </div>
  // )
  return (
    <div
      className={`task-count ${name == 'Checklist' ? 'task-count__red' : ''} `}
    >
      {0}
    </div>
  )
}
