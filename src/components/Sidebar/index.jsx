import { useRef } from 'react'
import { CustomProjects } from './custom-projects'
import { DefaultProjects } from './default-projects'
import { useParams } from 'react-router-dom'
import { useExternalEventsContextValue } from 'context'
import './styles/light.scss'
import './styles/main.scss'

export const Sidebar = (props) => {
  const { defaultGroup } = useParams()
  const { externalEventsRef } = useExternalEventsContextValue()

  if (defaultGroup === 'Calendar') {
    return (
      <>
        <div className='sidebar__overlay' onClick={props.onClick}></div>
        <aside className='sidebar'>
          <div ref={externalEventsRef}>
            <p>
              <strong>Draggable Events</strong>
            </p>
            <div
              className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
              style={{ maxWidth: '100px' }}
            >
              <div className='fc-event-main'>My Event 1</div>
            </div>
            <div
              className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
              style={{ maxWidth: '100px' }}
            >
              <div className='fc-event-main'>My Event 2</div>
            </div>
            <div
              className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
              style={{ maxWidth: '100px' }}
            >
              <div className='fc-event-main'>My Event 3</div>
            </div>
            <div
              className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
              style={{ maxWidth: '100px' }}
            >
              <div className='fc-event-main'>My Event 4</div>
            </div>
            <div
              className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
              style={{ maxWidth: '100px' }}
            >
              <div className='fc-event-main'>My Event 5</div>
            </div>
          </div>
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
