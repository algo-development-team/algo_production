import { TaskCheckbox } from 'components/Checkbox'
import { OptionsButton } from 'components/MenuButton'
import { TaskDate } from 'components/task-date'
import { TaskScheduleTime } from 'components/task-timelength'
import { TaskProject } from 'components/TaskProject'
import { useOverlayContextValue } from 'context'
import { useSelectedProject } from 'hooks'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { getProjectInfo, getProjectTitle } from '../../utils'
import { Draggable } from 'react-beautiful-dnd'
import { cropLabel } from 'handleLabel'

export const Task = ({ name, task, index, projects }) => {
  moment.defaultFormat = 'DD-MM-YYYY'
  const { setShowDialog, setDialogProps } = useOverlayContextValue()

  const { defaultGroup } = useParams()

  const params = useParams()
  const { selectedProject } = useSelectedProject(params, projects)
  const { selectedProjectName } = selectedProject
  let taskProjectName = ''
  let taskProject = {}
  if (selectedProject.defaultProject) {
    taskProjectName = getProjectTitle(projects, task.projectId)
    taskProject = getProjectInfo(projects, task.projectId)
  } else {
    taskProjectName = selectedProjectName
  }

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

          <div className='task__details'>
            <p className='board-task__name' style={{ paddingBottom: '0.3rem' }}>
              {cropLabel(name, 30)}
            </p>

            <div className='task__info'>
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
              <div className='task__project-name'>
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
