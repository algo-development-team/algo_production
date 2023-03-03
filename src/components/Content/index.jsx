import { Board } from 'components/BoardView'
import { TaskList } from 'components/ListView'
import { useSelectedProjectInfo } from 'hooks'
import { useParams } from 'react-router-dom'
import { FullCalendar } from 'components/FullCalendar'
import { Schedule } from 'components/Schedule'
import './styles/content.scss'
import './styles/light.scss'
import React from 'react'

export const Content = () => {
  const { projectId, defaultGroup, dayId } = useParams()
  const projectInfo = useSelectedProjectInfo(projectId)
  const currentView = projectInfo && projectInfo[0]?.projectIsList

  const getProject = () => {
    if (dayId) {
      return <Schedule />
    } else if (defaultGroup) {
      if (
        defaultGroup === 'Checklist' ||
        defaultGroup === 'Inbox' ||
        defaultGroup === 'Scheduled'
      ) {
        return <TaskList />
      } else if (defaultGroup === 'Calendar') {
        return <FullCalendar />
      } else {
        return null
      }
    } else {
      return currentView ? <TaskList /> : <Board />
    }
  }

  return (
    <div className='content'>
      <div className='project__wrapper'>{getProject()}</div>
    </div>
  )
}
