import { useProjects, useSelectedProject } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { useThemeContextValue } from 'context'
import { getHighlightBlue } from 'handleColorPalette'

export const ProjectsButton = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { setSelectedProject, selectedProject } = useSelectedProject(
    params,
    projects,
  )
  const { isLight } = useThemeContextValue()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: '10px',
      }}
    >
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
        <h3
          style={{
            color:
              params?.defaultGroup === 'Overview' || params?.projectId
                ? getHighlightBlue(isLight)
                : 'inherit',
          }}
        >
          Projects
        </h3>
        <div
          style={{
            width: '90%',
            backgroundColor:
              params?.defaultGroup === 'Overview' || params?.projectId
                ? getHighlightBlue(isLight)
                : 'transparent',
            height: '3px',
            borderTopLeftRadius: '1px',
            borderTopRadius: '1px',
          }}
        ></div>
      </Link>
    </div>
  )
}
