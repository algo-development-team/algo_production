import { TaskCheckbox } from 'components/Checkbox'
import { OptionsButton } from 'components/MenuButton'
import { TaskDate } from 'components/task-date'
import { TaskProject } from 'components/TaskProject'
import { useProjects } from 'hooks'
import { Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { getProjectInfo } from 'utils'
import { useOverlayContextValue } from 'context'

export const BoardTask = ({ task, index }) => {
  const { defaultGroup } = useParams()
  const { projects } = useProjects()
  const taskProject = getProjectInfo(projects, task.projectId)
  const { setShowDialog, setDialogProps } = useOverlayContextValue()

  return (
    <Draggable draggableId={task.taskId} index={index}>
      {(provided) => (
        <div
          className='board-task'
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
          onClick={() => {
            setDialogProps({ task, projects })
            setShowDialog('TASK_POPUP')
          }}
        >
          <TaskCheckbox
            projectId={task.projectId}
            columnId={task.boardStatus}
            taskId={task.taskId}
            taskIndex={task.index}
          />
          <div className='board-task__content'>
            <p className='board-task__name'>{task.name}</p>
            <div className='board-task__info'>
              <div> {task.date && <TaskDate date={task.date} />}</div>
              <div>
                {defaultGroup && (
                  <TaskProject
                    projectHexColour={taskProject?.projectColour?.hex}
                    projectName={taskProject?.name}
                  />
                )}
              </div>
            </div>
          </div>
          <OptionsButton
            projectId={task.projectId}
            columnId={task.boardStatus}
            taskId={task.taskId}
            taskIndex={task.index}
            taskIsImportant={task.important}
            targetIsTask
          />
        </div>
      )}
    </Draggable>
  )
}
