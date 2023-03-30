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
          <div>
          <button className='set-Taskbar' style={{ display: 'flex',
                           fontSize: '25px' }}>
          <Taskbar
                  type='AUTO_SCHEDULE'
                  onOff={true}
                  value={autoSchedule}
                  setValue={setAutoSchedule}
                />
          </button>
            <button className='set-Taskbar' style={{ display: 'flex' }}>
              <Taskbar
                  type='ADD_TASKS'
                  value={AddTasks}
                  setValue={setAddTasks}
                />
            </button>
          
            {/* <div style={{ display: 'flex' }}>
              <WarningTask
                addValue={AddTasks}
                setAddValue={setAddTasks}
                filterValue={FilterTasks}
                setFilterValue={setFilterTasks}
              />
            </div> */}

          <div style={{ display: 'flex' }}>
            <SearchField
              addValue={AddTasks}
              setAddValue={setAddTasks}
              filterValue={FilterTasks}
              setFilterValue={setFilterTasks}
            />
            <button style={{ 
              display: 'flex',
              flexdirection: 'row',
              alignitems: 'center',
              textalign: 'center',
              justifycontent: 'center',
              display: 'flex',
              padding: '1px 1px 1px 1px',
              borderRadius: '5px',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: '10px',
              outline: 'none',
              width: '10%',
              height: '38px',
              boxSizing: 'border-box',
              marginBottom: '10px',
              display: 'flex',
              }}>
              <Taskbar
                  type='FILTER_TASKS'
                  onOff={FilterTasks}
                  value={FilterTasks}
                  setValue={setFilterTasks}
                />
            </button>

            </div>
          </div>
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
