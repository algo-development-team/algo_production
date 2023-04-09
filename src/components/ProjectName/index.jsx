import { useProjects } from 'hooks'
import { useParams } from 'react-router-dom'
import { getProjectTitle } from 'utils'
import { cropLabel } from 'handleLabel'
import './styles/project-name.scss'

export const ProjectName = () => {
  const params = useParams()
  const { projectId, defaultGroup } = params

  const { projects } = useProjects()

  const customProjectTitle = getProjectTitle(projects, projectId)

  return (
    <h1 className='project__name'>
      {cropLabel(customProjectTitle ? customProjectTitle : '', 12) ||
        defaultGroup}
    </h1>
  )
}
