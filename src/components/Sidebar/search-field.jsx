import { useEffect, useState } from 'react'
import { useExternalEventsContextValue } from 'context'
import { useTasks, useScheduledTasks, useProjects } from 'hooks'
import { ReactComponent as LookupIcon } from 'assets/svg/lookup.svg'
import { AddTaskbar } from './add-task'
import { FilterTaskbar } from './filter-task'
import { GoogleEventColours } from '../../handleColorPalette'

export const SearchField = ({
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

  const filterTasks = (filter, filterSelect, tasks) => {
    // console.log('filter', filter) // DEBUGGING
    // console.log('filterSelect', filterSelect) // DEBUGGING
    // console.log('tasks', tasks) // DEBUGGING

    if (!filter && !filterSelect)  {
      return tasks
    }

    const result = []
    for (let i = 0; i < tasks.length; i++) {
      if (filter === "Due Date" && tasks[i].date === filterSelect.date) {
          result.push(tasks[i])
          // console.log('date not same...') // DEBUGGING 
        } else if (filter === "Projects" && tasks[i].projectId === filterSelect.projectId) {
          result.push(tasks[i])
          // console.log('project not same...') // DEBUGGING 
        } else if (filter === "Priority" &&  tasks[i].priority === filterSelect) {
          result.push(tasks[i])
          // console.log('priority not same...') // DEBUGGING 
  
      }
    } 

    // console.log('result', result) // DEBUGGING
    return result
  }

  const searchTasks = (searchText, tasks) => {
    if (!searchText) {
      return tasks
    }

    const result = [...tasks]
    const searchTextWords = searchText
      .toLowerCase()
      .split(' ')
      .filter((word) => word !== '')
    for (const word of searchTextWords) {
      for (let i = 0; i < result.length; i++) {
        if (!result[i].name.toLowerCase().includes(word)) {
          result.splice(i, 1)
          i--
        }
      }
    }

    return result
  }

  const displayHourMin = (timeLength) => {
    const hours = Math.floor(timeLength / 60)
    const minutes = timeLength % 60
    if (hours === 0) {
      return `${minutes}min`
    } else if (minutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${minutes}min`
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ paddingLeft: '5px' }}>
          <LookupIcon
            style={{
              padding: '1px 1px 1px 1px',
              borderRadius: '5px',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: '16px',
              outline: 'none',
              width: '100%',
              height: '38px',
              boxSizing: 'border-box',
              marginBottom: '10px',
              display: 'flex',
            }}
          />
        </div>
        <input
          type='text'
          style={{
            padding: '10px 10px 10px 10px',
            borderRadius: '5px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            fontSize: '16px',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '10px',
            display: 'flex',
          }}
          placeholder='Search up a task...'
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
      </div>

      {/* <div>
        {!filterValue && <AddTaskbar setAddValue={setAddValue} />}
      </div> */}
      <div>
        {filterValue  && 
          <FilterTaskbar filter={filter} setFilter={setFilter} filterSelect={filterSelect} setFilterSelect={setFilterSelect} setFilterValue={setFilterValue} />
        }
      </div>

      <div
        ref={externalEventsRef}
        style={{
          height: '40vh',
          overflowY: 'scroll',
          overflowX: 'hidden',
        }}
      >
        {searchTasks(searchText, (filterSelect!=='None' && filterValue) ? filterTasks(filter, filterSelect, unscheduledTasks) : unscheduledTasks).map((task) => {
          return (
            <div
              className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
              data-event={JSON.stringify({
                ...task,
                backgroundColor: getProjectColourHex(task.projectId),
              })}
              style={{
                width: '100%',
                height: `${task.timeLength}px`,
                marginBottom: '10px',
                backgroundColor: getProjectColourHex(task.projectId),
              }}
            >
              {task.timeLength < 60 ? (
                <div className='fc-event-main' style={{ marginLeft: '5px' }}>
                  <span style={{ marginRight: '10px' }}>{task.name}</span>
                  <span id='time-length'>
                    {displayHourMin(task.timeLength)}
                  </span>
                </div>
              ) : (
                <div style={{ marginLeft: '5px' }}>
                  <div className='fc-event-main'>{task.name}</div>
                  <div className='fc-event-main' id='time-length'>
                    {displayHourMin(task.timeLength)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
