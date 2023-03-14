import { useProjects, useSelectedProject } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { useThemeContextValue } from 'context'
import { ReactComponent as AlgoLogoNameWhiteIcon } from 'assets/svg/algo_logo_name_white.svg'
import { ReactComponent as AlgoLogoNameDarkIcon } from 'assets/svg/algo_logo_name_dark.svg'

export const HomeButton = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { setSelectedProject, selectedProject } = useSelectedProject(
    params,
    projects,
  )
  const { isLight } = useThemeContextValue()

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
      <div className='quick-add-task header-clickable'>
        {isLight ? (
          <AlgoLogoNameWhiteIcon strokeWidth={0.1} width={100} fill='white' />
        ) : (
          <AlgoLogoNameDarkIcon strokeWidth={0.1} width={100} fill='white' />
        )}
      </div>
    </Link>
  )
}
