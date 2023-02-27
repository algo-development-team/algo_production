import { useOverlayContextValue } from 'context'
import { useState } from 'react'
import { SetNewTaskLinkedTasksPopper } from 'components/dropdowns/set-new-task-linked-tasks-popper'
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg'

export const SetNewTaskLinkedTasks = ({
  isQuickAdd,
  isPopup,
  prompt,
  setPrompt,
  linkedTasks,
  setLinkedTasks,
  tasks,
  task,
}) => {
  const { showDialog, setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})

  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
  }

  return (
    <>
      {linkedTasks.length > 0 && (
        <div className='set-new-task__linked-tasks'>
          {linkedTasks.map((linkedTask) => {
            return (
              <div className='set-new-task__linked-tasks__bubble-text'>
                <p style={{ marginRight: '5px' }}>{linkedTask.name}</p>
                <CloseIcon
                  height='12px'
                  width='12px'
                  onClick={() => {
                    setLinkedTasks(
                      linkedTasks.filter(
                        (task) => task.taskId !== linkedTask.taskId,
                      ),
                    )
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
      <input
        className='set-new-task__linked-tasks'
        onSelect={(e) => {
          setDialogProps(
            Object.assign(
              {
                elementPosition: e.currentTarget.getBoundingClientRect(),
              },
              { tasks },
              { linkedTasks },
              { setLinkedTasks },
            ),
          )
          if (isPopup) {
            setDialogProps({ task })
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            setShowDialog('SET_LINKED_TASKS')
          }
        }}
      />
      {showPopup && (
        <SetNewTaskLinkedTasksPopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          tasks={tasks}
          linkedTasks={linkedTasks}
          setLinkedTasks={setLinkedTasks}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
