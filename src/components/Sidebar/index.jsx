import { useRef } from 'react'
import { CustomProjects } from './custom-projects'
import { DefaultProjects } from './default-projects'
import { useParams } from 'react-router-dom'
import { useExternalEventsContextValue } from 'context'
import { SearchBar } from './search-bar'
import { CalendarList } from './calendar-list'
import './styles/light.scss'
import './styles/main.scss'

export const Sidebar = (props) => {
  const { defaultGroup } = useParams()
  const { externalEventsRef } = useExternalEventsContextValue()

  if (defaultGroup === 'Calendar') {
    return (
      <>
        <div className='sidebar__overlay' onClick={props.onClick}></div>
        <aside
          className='sidebar'
          style={{ paddingLeft: '18px', paddingRight: '18px' }}
        >
          <div ref={externalEventsRef}>
            <div style={{ marginBottom: '10px' }}>
              <img src='xxx' alt='plus icon' />
              <img src='xxx' alt='filter icon' style={{ marginLeft: '20px' }} />
            </div>
            <SearchBar
              tasks={[
                'Complete project report',
                'Submit expenses',
                'Schedule meeting with client',
                'Review presentation',
                'Prepare for interview',
                'Send follow-up email',
                'Order office supplies',
                'Attend team training',
                'Create project plan',
              ]}
            />
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
