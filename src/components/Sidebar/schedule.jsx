import { NavLink } from 'react-router-dom'
import { cropLabel } from 'handleLabel'
import { OptionsButton } from 'components/MenuButton'

export const Schedule = ({ schedule }) => {
  return (
    <NavLink
      to={`/schedule/${schedule.id}`}
      className={({ isActive }) =>
        isActive ? 'active project-group' : 'project-group'
      }
      role='button'
    >
      <div className='project-group__group'>
        <p className='project-group__name'>{cropLabel(schedule.name, 12)}</p>
      </div>

      <OptionsButton scheduleId={schedule.id} targetIsSchedule />
    </NavLink>
  )
}
