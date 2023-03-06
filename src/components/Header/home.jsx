import { useProjects, useSelectedProject } from 'hooks'
import { Link, useParams } from 'react-router-dom'
export const HomeButton = () => {
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
      <h2>Algo</h2>
    </Link>
  )
}
