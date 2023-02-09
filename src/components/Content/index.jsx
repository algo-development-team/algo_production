import { Board } from 'components/BoardView/index'
import { TaskList } from 'components/ListView'
import { useSelectedProjectInfo } from 'hooks'
import { useParams } from 'react-router-dom'
import { Calendar } from 'components/Calendar'
import './styles/content.scss'
import './styles/light.scss'
import React from 'react'

export const Content = () => {
  const { projectId, defaultGroup } = useParams()
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
        return <Calendar />
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
