import { ReactComponent as Dot } from 'assets/svg/dot.svg'
import { OptionsButton } from 'components/MenuButton'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ProjectTasksCounts } from './project-tasks-count'
import { cropLabel } from 'handleLabel'

export const CustomProject = ({ project }) => {
  const [currentTaskProp, setCurrentTaskProp] = useState([])
  useEffect(() => {
    setCurrentTaskProp(project)
  }, [project])

  return (
    <NavLink
      to={`/project/${project.projectId}`}
      className={({ isActive }) =>
        isActive ? 'active project-group' : 'project-group'
      }
      role='button'
    >
      <div className='project-group__group'>
        <div className='project-group__icon'>
          <Dot color={`${project?.projectColour?.hex}`} />
        </div>
        <p className='project-group__name'>
          {cropLabel(currentTaskProp.name ? currentTaskProp.name : '', 12)} (
          {currentTaskProp.projectIsWork ? 'work' : 'personal'})
        </p>
      </div>

      <OptionsButton projectId={project.projectId} targetIsProject project={project} />
      <ProjectTasksCounts projectId={project.projectId} />
    </NavLink>
  )
}
