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
  const { defaultGroup, projectId } = useParams()
  const projectInfo = useSelectedProjectInfo(projectId)
  const currentView = projectInfo && projectInfo[0]?.projectIsList

  const getProject = () => {
    if (defaultGroup) {
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
    } else if (projectId) {
      return currentView ? <TaskList /> : <Board />
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
