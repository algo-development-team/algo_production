import { ReactComponent as InfoIcon } from 'assets/svg/info.svg'
import { ReactComponent as CancelIcon } from 'assets/svg/plus.svg'
import { useAuth, useSchedules, useProjects } from 'hooks'
import { useNavigate } from 'react-router-dom'
import { updateUserInfo } from 'backend/handleUserInfo'
import './light.scss'
import './main.scss'

export const ConfrimDeleteSchedule = ({ scheduleId, closeOverlay }) => {
  const { projects } = useProjects()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { schedules, setSchedules } = useSchedules()

  const getScheduleUsed = () => {
    const project = projects.find(
      (project) => project.projectScheduleId === scheduleId,
    )
    return project ? true : false
  }

  const getScheduleName = () => {
    const schedule = schedules.find((schedule) => schedule.id === scheduleId)
    return schedule && schedule.name
  }

  const handleScheduleDelete = async () => {
    if (getScheduleUsed()) return

    const updatedSchedules = schedules.filter(
      (schedule) => schedule.id !== scheduleId,
    )

    await updateUserInfo(currentUser && currentUser.id, {
      schedules: updatedSchedules,
    })

    setSchedules(updatedSchedules)
  }

  const deleteHandler = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    await handleScheduleDelete()
    navigate('/app/Setting')

    closeOverlay()
  }

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
            Are you sure you want to delete {getScheduleName()}?
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
