import { Link, useParams } from 'react-router-dom'
import { useProjects, useSelectedProject } from 'hooks'

export const CalendarOrProjectsButton = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { setSelectedProject, selectedProject } = useSelectedProject(
    params,
    projects,
  )

  // console.log(defaultGroup, projectId)

  if (params?.projectId) {
    return (
      <Link
        to='/app/Calendar'
        className='home_button header-clickable'
        onClick={() =>
          setSelectedProject({
            selectedProjectName: 'Calendar',
            defaultProject: true,
          })
        }
      >
        <h3>To Calendar</h3>
      </Link>
    )
  } else {
    return (
      <Link
        to='/app/Overview'
        className='home_button header-clickable'
        onClick={() =>
          setSelectedProject({
            selectedProjectName: 'Overview',
            defaultProject: true,
          })
        }
      >
        <h3>To Projects</h3>
      </Link>
    )
  }
}
