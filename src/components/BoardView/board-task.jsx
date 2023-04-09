import { TaskCheckbox } from 'components/Checkbox'
import { OptionsButton } from 'components/MenuButton'
import { TaskDate } from 'components/task-date'
import { TaskScheduleTime } from 'components/task-timelength'
import { useProjects } from 'hooks'
import { Draggable } from 'react-beautiful-dnd'
import { useOverlayContextValue } from 'context'
import { cropLabel } from 'handleLabel'

export const BoardTask = ({ task, index }) => {
  const { projects } = useProjects()
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
            taskPriority={task.priority}
          />
          <div className='board-task__content'>
            <p className='board-task__name'>{cropLabel(task.name, 20)}</p>
            <div className='board-task__info'>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'inline-block', width: '5rem' }}>
                  {task.startDate && <TaskDate date={task.startDate} />}{' '}
                </div>
                <div style={{ display: 'inline-block', width: '5rem' }}>
                  {task.date && <TaskDate date={task.date} />}{' '}
                </div>
                <div style={{ display: 'inline-block' }}>
                  {task.timeLength ? (
                    <TaskScheduleTime timeLength={task.timeLength} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <OptionsButton
            projectId={task.projectId}
            columnId={task.boardStatus}
            taskId={task.taskId}
            taskIndex={task.index}
            targetIsBoardTask
          />
        </div>
      )}
    </Draggable>
  )
}
