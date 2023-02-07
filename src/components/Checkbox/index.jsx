import featherIcon from 'assets/svg/feather-sprite.svg'
import { useAuth } from 'hooks'
import {
  completeTask,
} from '../../backend/handleUserTasks'

export const TaskCheckbox = ({
  projectId,
  columnId,
  taskId,
  taskIndex,
  taskPriority,
}) => {
  const { currentUser } = useAuth()

  const completeTaskHandler = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    await completeTask(currentUser && currentUser.id, projectId, columnId, taskId, taskIndex)
  }

  const getBorderColor = (priority) => {
    switch (priority) {
      case 4:
        return '#ff7066'
      case 3:
        return '#ff9a14'
      case 2:
        return '#5297ff'
      case 1:
        return 'inherit'
      default:
        return 'inherit'
    }
  }

  return (
    <div
      className='task__checkbox'
      onClick={(event) => completeTaskHandler(event)}
      style={{ borderColor: getBorderColor(taskPriority), borderWidth: '2px' }}
    >
      <svg
        className='task__checkbox--icon'
        width='12'
        height='12'
        fill='none'
        stroke='#fff'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <use xlinkHref={`${featherIcon}#check`}></use>
      </svg>
    </div>
  )
}
