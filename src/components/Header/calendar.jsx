import { useProjects, useSelectedProject } from 'hooks'
import { Link, useParams } from 'react-router-dom'
export const CalendarButton = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { setSelectedProject, selectedProject } = useSelectedProject(
    params,
    projects,
  )
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
      style={{ marginBottom: '5px', marginLeft: '10px' }}
    >
      <h3>Calendar</h3>
    </Link>
  )
}
