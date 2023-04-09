import { ReactComponent as ScheduledIcon } from 'assets/svg/scheduled.svg'
import { useThemeContextValue } from 'context'
import { NavLink } from 'react-router-dom'
import { ProjectTasksCounts } from './project-tasks-count'

export const DefaultProjects = () => {
  const { isLight } = useThemeContextValue()

  return (
    <div className='project-group__wrapper'>
      <NavLink
        to={'/app/Overview'}
        className={({ isActive }) =>
          isActive ? 'active project-group' : 'project-group'
        }
      >
        <div className='project-group__group'>
          <div className='project-group__icon'>
            <ScheduledIcon fill={`${isLight ? '#692fc2' : '#a970ff'}`} />
          </div>

          <div className='project-group__name'>Overview</div>
        </div>
        <ProjectTasksCounts isDefaultGroup name={'Overview'} />
      </NavLink>
    </div>
  )
}
