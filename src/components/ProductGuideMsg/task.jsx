import featherIcon from 'assets/svg/feather-sprite.svg'
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg'

const AddTask = () => {
  return (
    <div className='add-task__toggle'>
      <div className='add-task__icon'>
        <svg width='19' height='19' fill='none' strokeLinejoin='round'>
          <use xlinkHref={`${featherIcon}#plus`}></use>
        </svg>
      </div>
      <span>Add Task</span>
    </div>
  )
}

export const Task = () => {
  return (
    <div>
      <h2>Task</h2>
      <h4>You can create new tasks by clicking on</h4>
      <AddTask />
      <h4>
        Tasks in Inbox or (personal) projects will be your personal tasks, and
        tasks in (work) projects will be your work tasks.
      </h4>
    </div>
  )
}
