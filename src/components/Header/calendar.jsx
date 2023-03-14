import { useProjects, useSelectedProject } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { useThemeContextValue } from 'context'
import { getHighlightBlue } from 'handleColorPalette'

export const CalendarButton = () => {
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
        to='/app/Calendar'
        className='home_button header-clickable'
        onClick={() =>
          setSelectedProject({
            selectedProjectName: 'Calendar',
            defaultProject: true,
          })
        }
      >
        <h3
          style={{
            color:
              params?.defaultGroup === 'Calendar'
                ? getHighlightBlue(isLight)
                : 'inherit',
          }}
        >
          Calendar
        </h3>
        <div
          style={{
            width: '90%',
            backgroundColor:
              params?.defaultGroup === 'Calendar'
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
