import { TaskEditor } from 'components/TaskEditor'
export const TaskPopup = ({ closeOverlay, task, projects }) => {
  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div className='quick-add-task__wrapper'>
        <TaskEditor
          closeOverlay={closeOverlay}
          taskId={task.taskId}
          task={task}
          projects={projects}
          isEdit
        />
      </div>
    </div>
  )
}
