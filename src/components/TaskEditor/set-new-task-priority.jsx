import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskPriorityPopper } from 'components/dropdowns/set-new-task-priority-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'
export const SetNewTaskPriority = ({
  isQuickAdd,
  isPopup,
  taskPriority,
  setTaskPriority,
  task,
}) => {
  const { setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})
  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
  }

  const getPriorityStyle = () => {
    if (taskPriority === 1) {
      return 'date__today'
    } else if (taskPriority === 2) {
      return 'date__weekend'
    } else if (taskPriority === 3) {
      return 'date__tomorrow'
    }
  }

  const getPriorityText = (taskPriority) => {
    if (taskPriority === 1) {
      return 'Low'
    } else if (taskPriority === 2) {
      return 'Medium'
    } else if (taskPriority === 3) {
      return 'High'
    }
  }

  return (
    <>
      <div
        className={`set-new-task__schedule ${getPriorityStyle()}`}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setTaskPriority },
            ),
          )
          if (isPopup) {
            setDialogProps({ task })
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            setShowDialog('SET_TASK_PRIORITY')
          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {taskPriority && getPriorityText(taskPriority)}
      </div>
      {showPopup && (
        <SetNewTaskPriorityPopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setTaskPriority={setTaskPriority}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
