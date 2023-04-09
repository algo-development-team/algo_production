import { useEffect, useState } from 'react'
import { useExternalEventsContextValue } from 'context'
import { useTasks, useScheduledTasks, useProjects, useTasksCount } from 'hooks'
import { ReactComponent as LookupIcon } from 'assets/svg/lookup.svg'
import { AddTaskbar } from './add-task'
import { FilterTaskbar } from './filter-task'
import { GoogleEventColours } from '../../handleColorPalette'
import moment from 'moment'
import { Taskbar } from './task-bar'


// Global Const
const date = new Date()
const todayMoment = moment(date).startOf('day')
const tomorrowMoment = moment(date).startOf('day').add(1, 'day')


// Search Field: Important sections of the Side-bar contents are here
//               with Search & Filter of the unscheduled tasks
export const SearchField = ({
  addValue,
  setAddValue,
  filterValue,
  setFilterValue,
}) => {


  // Local Const
  const [searchText, setSearchText] = useState('')
  const { externalEventsRef } = useExternalEventsContextValue()
  const { tasks } = useTasks()
  const { projects } = useProjects()
  const [unscheduledTasks, setUnscheduledTasks] = useState([])
  const { scheduledTasks, loading } = useScheduledTasks()
  const [filter, setFilter] = useState('None')
  const [filterSelect, setFilterSelect] = useState('None')
  const [AddTasks, setAddTasks] = useState(false)
  const [FilterTasks, setFilterTasks] = useState(false)


  // Use Effect
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


  // getProjectColourHex: Gets the colour hex of each project
  const getProjectColourHex = (projectId) => {
    const project = projects.find((project) => project.projectId === projectId)
    return project?.projectColour?.hex || GoogleEventColours[6].hex
  }


  // filterTasks: Fuction filters tasks based on  (Due Date, Projects, Priority)
  //              It loops through the unscheduled tasks list to collect
  //              tasks that meets the requirement. 
  const filterTasks = (filter, filterSelect, tasks) => {

    if (!filter && !filterSelect)  {
      return tasks
    }

    if (filter === "Due Date" && filterSelect.day === 'Past Deadline') {
      return warningTasks(filter, filterSelect, tasks)[1]
    }

    const result = []
    for (let i = 0; i < tasks.length; i++) {

      if (filter === "Due Date" && tasks[i].date === filterSelect.date) {
          result.push(tasks[i])

        } else if (filter === "Projects" && tasks[i].projectId === filterSelect.projectId) {
          result.push(tasks[i])

        } else if (filter === "Priority" &&  tasks[i].priority === filterSelect) {
          result.push(tasks[i])
      }
    } 

    return result
  }


  // warningTasks: Creates a warning bars (past deadline & due today)
  //               It loops through the unscheduled tasks list to collect
  //               tasks that meets the requirement. 
  const warningTasks = (filter, filterSelect, tasks) => {

    const pastDeadline = []
    const warningDeadline = []
    for (let i = 0; i < tasks.length; i++) {

      if  (tasks[i].date !== '') {
        const momentDate = moment(tasks[i].date, 'DD-MM-YYYY').toDate()
        const momentString = moment(momentDate).startOf('day')
  
        if ( momentString.format('DD-MM-YYYY') === todayMoment.format('DD-MM-YYYY')) {
            warningDeadline.push(tasks[i])
          } else if ( momentString < todayMoment) {
            pastDeadline.push(tasks[i])
        }

      }
  
    } 
    return [warningDeadline, pastDeadline]
  }
  


  // searchTasks: Allows for user to search through the tasks
  //              As user types each word, only the tasks with matching
  //              characters will appear 
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

  // displayHourMin: Breaks down time length to hours & minutes
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
     
      {/* Warning bar task */}
      <div>
        
        {/* Display Due Today Warning bar */}
        { warningTasks(filter, filterSelect, unscheduledTasks)[0].length ? 
          <button className='set-Warningbar'
          onClick={() =>  {
            setFilterValue(true)
            setFilter("Due Date")
            setFilterSelect({
              day: 'Today',
              date: moment().format('DD-MM-YYYY'),
            })
          }}
        > 
        {warningTasks(filter, filterSelect, unscheduledTasks)[0].length} Due Today
        </button>  : ''
        }

        {/* Display Due Today Warning bar */}
        { warningTasks(filter, filterSelect, unscheduledTasks)[1].length ? 
          <button className='set-Warningbar'
          onClick={() =>  {
            setFilterValue(true)
            setFilter("Due Date")
            setFilterSelect({
              day: 'Past Deadline',
              date: moment().format('DD-MM-YYYY'),
            })
          }}
          > 
        {warningTasks(filter, filterSelect, unscheduledTasks)[1].length} Past Deadline
        </button>  : ''
        }
      </div>


      {/* Search bar task */}
      <div 
      className='set-Searchbar'
        style={{
          // display: 'inline-block',
          // flexdirection: 'row',
          // alignitems: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div > 
          {/* style={{ paddingLeft: '5px' }} */}
          <LookupIcon
            style={{
              padding: '1px 0px 1px 0px',
              borderRadius: '5px',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: '16px',
              outline: 'none',
              //width: '100%',
              //width: '15px',
              width: '15px',
              height: '38px',
              boxSizing: 'border-box',
              marginTop: '10px',
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
            //width: '150%',
            //width: '235px',
            width: '87%',
            height: '38px',
            boxSizing: 'border-box',
            marginTop: '10px',
            marginBottom: '10px',
            display: 'flex',
          }}
          placeholder='Search up a task...'
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
        
        <button style={{ 
              display: 'flex',
              alignitems: 'center',
              textalign: 'center',
              justifycontent: 'center',
              padding: '1px 1px 1px 1px',
              borderRadius: '5px',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: '5px',
              outline: 'none',
              //width: '10%',
              width: '15px',
              height: '38px',
              boxSizing: 'border-box',
              marginTop: '10px',
              marginBottom: '10px',
              }}>
          <Taskbar
              type='FILTER_TASKS'
              onOff={filterValue}
              value={filterValue}
              setValue={setFilterValue}
            />
        </button>
      </div>

      {/* Filter bar task */}
      <div>
        {filterValue  && 
          <FilterTaskbar filter={filter} setFilter={setFilter} filterSelect={filterSelect} setFilterSelect={setFilterSelect} setFilterValue={setFilterValue} />
        }
      </div>

      <div
        ref={externalEventsRef}
        //className='set-searchbox'
        style={{
          //height: '40vh',
          //height: '60vh',
          height:  filterValue? "calc(60vh - 15vh)" : "60vh",
          width: '101%',
          padding: '2px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          // borderRadius: '25px'
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
                //width: '100%',
                width: '100%',
                height: `${task.timeLength}px`,
                marginBottom: '3px',
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
