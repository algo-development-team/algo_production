import { useEffect, useState } from 'react'
import { useExternalEventsContextValue } from 'context'
import { useTasks, useScheduledTasks, useProjects } from 'hooks'
import { ReactComponent as LookupIcon } from 'assets/svg/lookup.svg'
import { AddTaskbar } from './add-task'
import { FilterTaskbar } from './filter-task'
import { GoogleEventColours } from '../../handleColorPalette'

export const WarningTask = ({
  addValue,
  setAddValue,
  filterValue,
  setFilterValue,
}) => {
  const [searchText, setSearchText] = useState('')
  const { externalEventsRef } = useExternalEventsContextValue()
  const { tasks } = useTasks()
  const { projects } = useProjects()
  const [unscheduledTasks, setUnscheduledTasks] = useState([])
  const { scheduledTasks, loading } = useScheduledTasks()
  const [filter, setFilter] = useState('None')
  const [filterSelect, setFilterSelect] = useState('None')

  useEffect(() => {
    setFilterSelect('None')
  }, [filter])

  useEffect(() => {
    const updateUnscheduledTasks = () => {
      const updatedUnscheduledTasks = []
      for (const task of tasks) {
        if (
          !scheduledTasks.find((scheduledTask) => scheduledTask === task.taskId)
        ) {
          updatedUnscheduledTasks.push(task)
        }
      }
      setUnscheduledTasks(updatedUnscheduledTasks)
    }

    if (!loading) {
      updateUnscheduledTasks()
    }
  }, [loading, scheduledTasks, tasks])

  const getProjectColourHex = (projectId) => {
    const project = projects.find((project) => project.projectId === projectId)
    return project?.projectColour?.hex || GoogleEventColours[6].hex
  }

  const warningTasks = (filter, filterSelect, tasks) => {
    const pastDeadline = []
    const warningDeadline = []
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].date === filterSelect.date) {
        warningDeadline.push(tasks[i])
      } else if (tasks[i].date < filterSelect.date) {
        pastDeadline.push(tasks[i])
      }
    }

    return pastDeadline, warningDeadline
  }

  return (
    <>
      <div
        className='set-Warningbar'
        // onClick={() => callTaskbarHandlerFunction(type, onOff)}
      >
        <div style={{ color: 'white' }}>{getTaskbarIcon(type)}</div>
        {getTaskbarText(type)}
      </div>
    </>
  )
}
