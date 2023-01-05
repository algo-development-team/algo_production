import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg'

export const Task = () => {
  return (
    <div>
      <h2>Task</h2>
      <h4>
        You can create new tasks by clicking on any{' '}
        <PlusIcon strokeWidth={0.1} /> Add Task button.
      </h4>
      <h4>
        Tasks in Inbox or Personal projects will be your personal tasks, and
        tasks in Work projects will be your work tasks.
      </h4>
      <h4>Tasks with deadlines will show up at the Scheduled page.</h4>
    </div>
  )
}
