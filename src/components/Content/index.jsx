import { Board } from 'components/BoardView/index'
import { TaskList } from 'components/ListView'
import { useSelectedProjectInfo } from 'hooks'
import { useParams } from 'react-router-dom'
import { Calendar } from 'components/Calendar'
import './styles/content.scss'
import './styles/light.scss'
import React from 'react'
import { TeamPage } from 'components/TeamPage'
import { ProjectsVisualisation } from 'components/Visualisations/projects-visualisation.jsx'
import { ContactUs } from '../Email/contact-us.jsx'

export const Content = () => {
  const { teamId, projectId, defaultGroup } = useParams()
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
      } else if (defaultGroup === 'ProjectsVisualisation') {
        return <ProjectsVisualisation />
      } else {
        return null
      }
    } else if (teamId) {
      return <TeamPage />
    } else {
      return currentView ? <TaskList /> : <Board />
    }
    // return <ContactUs />
  }

  return (
    <div className='content'>
      <div className='project__wrapper'>{getProject()}</div>
    </div>
  )
}
