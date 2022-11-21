import { ReactComponent as HomeIcon } from 'assets/svg/home.svg'
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
      to='/app/Checklist'
      className='home_button header-clickable'
      onClick={() =>
        setSelectedProject({
          selectedProjectName: 'Checklist',
          defaultProject: true,
        })
      }
    >
      <HomeIcon strokeWidth='.1' />
    </Link>
  )
}
