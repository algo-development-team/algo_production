import { useProjects, useSelectedProject } from 'hooks'
import { Link, useParams } from 'react-router-dom'
export const ProjectsButton = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { setSelectedProject, selectedProject } = useSelectedProject(
    params,
    projects,
  )
  return (
    <Link
      to='/project/Overview'
      className='home_button header-clickable'
      onClick={() =>
        setSelectedProject({
          selectedProjectName: 'Overview',
          defaultProject: true,
        })
      }
      style={{ marginBottom: '5px', marginLeft: '10px' }}
    >
      <h3>Projects</h3>
    </Link>
  )
}
