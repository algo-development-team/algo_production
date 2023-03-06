import { CustomProjects } from './custom-projects'
import { DefaultProjects } from './default-projects'
import { useParams } from 'react-router-dom'
import { CalendarList } from './calendar-list'
import { SearchField } from './search-field'
import './styles/light.scss'
import './styles/main.scss'

export const Sidebar = (props) => {
  const { defaultGroup } = useParams()

  if (defaultGroup === 'Calendar') {
    return (
      <>
        <div className='sidebar__overlay' onClick={props.onClick}></div>
        <aside
          className='sidebar'
          style={{ paddingLeft: '18px', paddingRight: '18px' }}
        >
          <div>
            <div style={{ marginBottom: '10px' }}>
              <img src='xxx' alt='plus icon' />
              <img src='xxx' alt='filter icon' style={{ marginLeft: '20px' }} />
            </div>
            <SearchField />
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
