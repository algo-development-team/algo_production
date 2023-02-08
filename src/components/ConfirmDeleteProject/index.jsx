import { ReactComponent as InfoIcon } from 'assets/svg/info.svg'
import { ReactComponent as CancelIcon } from 'assets/svg/plus.svg'
import { useAuth, useProjects } from 'hooks'
import { useNavigate } from 'react-router-dom'
import { getProjectTitle } from 'utils'
import './light.scss'
import './main.scss'
import { projectDelete } from '../../backend/handleProjects'
import { projectTasksDelete } from '../../backend/handleUserInfo'

export const ConfrimDeleteProject = ({ projectId, closeOverlay }) => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const handleProjectDelete = async () => {
    await projectDelete(projectId)
  }

  const handleProjectTasksDelete = async () => {
   // Project Task Delete 
   await projectTasksDelete(currentUser && currentUser.id, projectId)
  }

  const deleteHandler = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    await handleProjectDelete()
    await handleProjectTasksDelete()
    navigate('/app/Checklist')

    closeOverlay()
  }

  const { projects } = useProjects()
  const projectName = getProjectTitle(projects, projectId)
  return (
    <div className='overlay' onClick={(event) => closeOverlay(event)}>
      <div className='confirm-delete'>
        <form action=''>
          <header>
            <button>
              <InfoIcon
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </button>
            <button onClick={(e) => closeOverlay(e)}>
              <CancelIcon width={29} height={29} />
            </button>
          </header>

          <div className='confirm-delete__content'>
            Are you sure you want to delete {projectName}?
          </div>
          <footer>
            <button className='action action__cancel--dark'>Cancel</button>
            <button
              className='action action__delete-project'
              onClick={(e) => deleteHandler(e)}
            >
              Delete
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
