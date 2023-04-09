import { Board } from 'components/BoardView'
import { TaskList } from 'components/ListView'
import { useSelectedProjectInfo } from 'hooks'
import { useParams } from 'react-router-dom'
import { FullCalendar } from 'components/FullCalendar'
import './styles/content.scss'
import './styles/light.scss'
import React from 'react'

export const Content = () => {
  const { defaultGroup, projectId, scheduleId } = useParams()
  const projectInfo = useSelectedProjectInfo(projectId)
  const currentView = projectInfo && projectInfo[0]?.projectIsList

  const getProject = () => {
    if (defaultGroup) {
      if (defaultGroup === 'Calendar') {
        return <FullCalendar />
      } else if (defaultGroup === 'Overview') {
        // return <Overview />
        return null
      } else if (defaultGroup === 'Setting') {
        // return <Setting />
        return null
      } else {
        return null
      }
    } else if (projectId) {
      return currentView ? <TaskList /> : <Board />
    } else if (scheduleId) {
      // return <ScheduleCalendar />
      return null
    } else {
      return null
    }
  }

  return (
    <div className='content'>
      <div className='project__wrapper'>{getProject()}</div>
    </div>
  )
}
