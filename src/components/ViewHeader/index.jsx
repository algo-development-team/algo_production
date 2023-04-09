import { useState, useEffect } from 'react'
import { ProjectName } from 'components/ProjectName'
import { useProjects, useSelectedProjectInfo, useSchedules } from 'hooks'
import { useThemeContextValue } from 'context'
import { useParams } from 'react-router-dom'
import { getProjectInfo } from 'utils'
import { getHighlightBlue } from '../../handleColorPalette'
import { OptionsButton } from '../MenuButton'
import './styles/light.scss'
import './styles/main.scss'

export const ViewHeader = () => {
  const { projectId } = useParams()
  const { defaultGroup } = useParams()
  const projectInfo = useSelectedProjectInfo(projectId && projectId)
  const currentView = projectInfo && projectInfo[0]?.projectIsList
  const { projects } = useProjects()
  const { isLight } = useThemeContextValue()
  const { schedules, loading: schedulesLoading } = useSchedules()
  const project = getProjectInfo(projects, projectId)
  const [scheduleName, setScheduleName] = useState(null)

  useEffect(() => {
    console.log('scheduleName', scheduleName) // DEBUGGING
  }, [scheduleName])

  useEffect(() => {
    if (project && !schedulesLoading) {
      const schedule = schedules.find(
        (schedule) => schedule.id === project.projectScheduleId,
      )
      if (schedule) {
        setScheduleName(schedule.name)
      }
    }
  }, [project, schedules, schedulesLoading])

  return (
    <div
      className={`${
        currentView || defaultGroup ? 'view-header__list' : 'view-header__board'
      } `}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className='view-header__actions--left'>
          <ProjectName />
        </div>
        {scheduleName && (
          <p style={{ color: getHighlightBlue(isLight) }}>{scheduleName}</p>
        )}
      </div>

      {projectId && (
        <div className='view-header__actions--right'>
          <OptionsButton
            projectId={projectId}
            isHeaderButton
            targetIsProject
            project={project}
          />
        </div>
      )}
    </div>
  )
}
