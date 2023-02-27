import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskDeadlineTypePopper } from 'components/dropdowns/set-new-task-deadline-type-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'

export const SetNewTaskDeadlineType = ({
  isQuickAdd,
  isPopup,
  setTaskDeadlineType,
  taskDeadlineType,
  task,
}) => {
  const { showDialog, setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})

  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
  }

  const getDeadlineTypeStyle = () => {
    if (taskDeadlineType === 'HARD') {
      return 'date__tomorrow'
    } else if (taskDeadlineType === 'SOFT') {
      return 'date__today'
    }
  }

  const getDeadlineTypeText = (taskPriority) => {
    if (taskPriority === 'HARD') {
      return 'Hard Deadline'
    } else if (taskPriority === 'SOFT') {
      return 'Soft Deadline'
    }
  }

  return (
    <>
      <div
        className={`set-new-task__schedule ${getDeadlineTypeStyle()}`}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setTaskDeadlineType },
            ),
          )
          if (isPopup) {
            setDialogProps({ task })
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            setShowDialog('SET_TASK_DEADLINE_TYPE')
          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {taskDeadlineType && getDeadlineTypeText(taskDeadlineType)}
      </div>
      {showPopup && (
        <SetNewTaskDeadlineTypePopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setTaskDeadlineType={setTaskDeadlineType}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
