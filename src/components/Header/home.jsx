import { useProjects, useSelectedProject } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { useThemeContextValue } from 'context'
import { ReactComponent as AlgoLogoNameWhiteIcon } from 'assets/svg/algo_logo_name_white.svg'
import { ReactComponent as AlgoLogoNameDarkIcon } from 'assets/svg/algo_logo_name_dark.svg'
import { ReactComponent as AlgoLogoWhiteIcon } from 'assets/svg/algo_logo_white.svg'
import { ReactComponent as AlgoLogoDarkIcon } from 'assets/svg/algo_logo_dark.svg'
import { useResponsiveSizes } from 'hooks'

export const HomeButton = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { setSelectedProject, selectedProject } = useSelectedProject(
    params,
    projects,
  )
  const { isLight } = useThemeContextValue()
  const { sizes } = useResponsiveSizes()

  const getIcon = () => {
    if (sizes.phone) {
      if (isLight) {
        return <AlgoLogoWhiteIcon strokeWidth={0.1} width={50} fill='white' />
      } else {
        return <AlgoLogoDarkIcon strokeWidth={0.1} width={50} fill='white' />
      }
    } else {
      if (isLight) {
        return (
          <AlgoLogoNameWhiteIcon strokeWidth={0.1} width={100} fill='white' />
        )
      } else {
        return (
          <AlgoLogoNameDarkIcon strokeWidth={0.1} width={100} fill='white' />
        )
      }
    }
  }

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
      <div className='quick-add-task header-clickable'>{getIcon()}</div>
    </Link>
  )
}
