import { ReactComponent as InboxIcon } from 'assets/svg/inbox.svg'
import { ReactComponent as ScheduledIcon } from 'assets/svg/scheduled.svg'
import { TodayIcon } from 'components/today-icon'
import { useThemeContextValue } from 'context'
import { NavLink } from 'react-router-dom'
import { ProjectTasksCounts } from './project-tasks-count'
import { getDayId } from '../../handleDayId'

export const DefaultProjects = () => {
  const { isLight } = useThemeContextValue()

  // generate a string of the current date in MM-DD-YYYY format

  return (
    <div className='project-group__wrapper'>
      <NavLink
        to={`/project/Overview`}
        className={({ isActive }) =>
          isActive ? 'active project-group' : 'project-group'
        }
      >
        <div className='project-group__group'>
          <div className='project-group__icon'>
            <ScheduledIcon fill={`${isLight ? '#246fe0' : '#5297ff'}`} />
          </div>

          <div className='project-group__name'>Overview</div>
        </div>

        <ProjectTasksCounts isDefaultGroup name={'Overview'} />
      </NavLink>
    </div>
  )
}
