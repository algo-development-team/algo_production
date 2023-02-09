import { NavLink } from 'react-router-dom'
import { cropLabel } from 'handleLabel'

export const CustomTeam = ({ team }) => {
  return (
    <NavLink
      to={`/team/${team.teamId}`}
      className={({ isActive }) =>
        isActive ? 'active project-group' : 'project-group'
      }
      role='button'
    >
      <div className='project-group__group'>
        <p className='project-group__name'>{team.teamId}</p>
      </div>
    </NavLink>
  )
}
