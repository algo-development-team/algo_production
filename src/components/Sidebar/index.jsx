import { useState } from 'react'
import { CustomProjects } from './custom-projects'
import { DefaultProjects } from './default-projects'
import { useParams } from 'react-router-dom'
import { useExternalEventsContextValue } from 'context'
import { SearchBar } from './search-bar'
import { Taskbar } from './task-bar'
import { CalendarList } from './calendar-list'
import './styles/light.scss'
import './styles/main.scss'


export const Sidebar = ( props ) => {
  const { defaultGroup } = useParams()
  const { externalEventsRef } = useExternalEventsContextValue()
  const [AddTasks, setAddTasks] = useState(false)
  const [FilterTasks, setFilterTasks] = useState(false)

  if (defaultGroup === 'Calendar') {
    return (   
      <>
       <div className='sidebar__overlay' onClick={props.onClick}></div>
      <aside
        className='sidebar'
        style={{ paddingLeft: '18px', paddingRight: '18px' }}
      >
        <div ref={externalEventsRef}>
          <button style={{ display: 'flex' }}>
            <Taskbar
            type= 'ADD_TASKS'
            value={AddTasks}
            setValue={setAddTasks}
            />
            <Taskbar
            type= 'FILTER_TASKS'
            value={FilterTasks}
            setValue={setFilterTasks}
            />
          </button>
          
          <SearchBar/>

          {/*Add Task Function*/}
          <div>
              {AddTasks && !FilterTasks &&(
                <>
                  <button
                    className=' action add-task__actions--add-task'
                    onClick={() => {
                      setAddTasks(false)
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAddTasks(false)
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
           </div>

          {/*Filter Task Function*/}
          <div>
              {FilterTasks && !AddTasks && (
                <>
                  <button
                    className=' action add-task__actions--add-task'
                    onClick={() => {
                      setFilterTasks(false)
                    }}
                  >
                    Link
                  </button>
                  <button
                    onClick={() => {
                      setFilterTasks(false)
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
        </div>
        <CalendarList />
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
