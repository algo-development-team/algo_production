import { CustomProjects } from './custom-projects'
import { DefaultProjects } from './default-projects'
import { useParams } from 'react-router-dom'
import { CalendarList } from './calendar-list'
import { SearchField, WarningTask } from './search-field'
// import { WarningTask } from './warning-task'
import { useState, useEffect } from 'react'
import { Taskbar } from './task-bar'
import { AutoScheduleButton } from './auto-schedule-button'
import './styles/light.scss'
import './styles/main.scss'

export const Sidebar = (props) => {
  const { defaultGroup } = useParams()
  const [AddTasks, setAddTasks] = useState(false)
  const [FilterTasks, setFilterTasks] = useState(false)
  const [autoSchedule, setAutoSchedule] = useState(false)

  useEffect(() => {
    if (FilterTasks) {
      setAddTasks(false)
      // setFilterTasks(!FilterTasks)
    }
  }, [FilterTasks])

  useEffect(() => {
    if (AddTasks) {
      setFilterTasks()
    }
  }, [AddTasks])

  if (defaultGroup === 'Calendar') {
    return (
      <>
        <div className='sidebar__overlay' onClick={props.onClick}></div>
        <aside
          className='sidebar'
          style={{ paddingLeft: '18px', paddingRight: '18px' }}
        >
        <div className='sidebar__overlay'>

          {/* Auto Schedule Button */}
          <button className='set-Taskbar' 
                  style={{ display: 'flex',
                           fontSize: '20px',
                           width: '248px' }}>
              <Taskbar
                  type='AUTO_SCHEDULE'
                  onOff={true}
                  value={autoSchedule}
                  setValue={setAutoSchedule}
                />
          </button>

          {/* Add Tasks Button */}
          <button className='set-Taskbar'
                  style={{ display: 'flex',
                           fontSize: '15px',
                           width: '248px' }}>
              <Taskbar
                  type='ADD_TASKS'
                  value={AddTasks}
                  setValue={setAddTasks}
                />
          </button>


          {/* Search Bar Button */}
          <div className='set-Searchbar' 
               style={{ display: 'flex' }}>
            <SearchField
              addValue={AddTasks}
              setAddValue={setAddTasks}
              filterValue={FilterTasks}
              setFilterValue={setFilterTasks}
            />
          </div>
        </div>

          {/* Calendar List */}
          <CalendarList />

          {/* <AutoScheduleButton /> */}
        </aside>
      </>
    )
  }

  return (
    <>
      <div className='sidebar__overlay' onClick={props.onClick}></div>
      <aside className='sidebar'>
        <div className='sidebar-clickables'>
          <DefaultProjects />
        </div>
        <CustomProjects />
      </aside>
    </>
  )
}
