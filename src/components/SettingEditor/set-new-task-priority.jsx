import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskPriorityPopper } from 'components/dropdowns/set-new-task-priority-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'
export const SetNewTaskPriority = ({
  isQuickAdd,
  setTaskPriority,
  taskPriority,
}) => {
  const { showDialog, setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})
  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
  }

  const getPriorityStyle = () => {
    if (taskPriority === 1) {
      let day = 'date__today'
      return day
    }
    if (taskPriority === 2) {
      let day = 'date__weekend'
      return day
    }
    if (taskPriority === 3) {
      let day = 'date__tomorrow'
      return day
    }
  }

  const getPriorityText = (taskPriority) => {
    if (taskPriority === 1) {
      return 'Low'
    }
    if (taskPriority === 2) {
      return 'Average'
    }
    if (taskPriority === 3) {
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
          isQuickAdd
            ? showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
            : setShowDialog('SET_TASK_PRIORITY')
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {taskPriority ? getPriorityText(taskPriority) : 'Low'}
      </div>
      {showPopup && (
        <SetNewTaskPriorityPopper
          isQuickAdd={isQuickAdd}
          setShowPopup={setShowPopup}
          setTaskPriority={setTaskPriority}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
