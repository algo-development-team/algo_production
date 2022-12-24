import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskTimeLengthPopper } from 'components/dropdowns/set-new-task-time-length-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'
export const SetNewTaskTimeLength = ({
  isQuickAdd,
  isPopup,
  setTaskTimeLength,
  taskTimeLength,
  task,
}) => {
  const { showDialog, setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})
  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
  }

  const getTimeLengthText = (taskTimeLength) => {
    const min = taskTimeLength % 60
    const hour = (taskTimeLength - min) / 60
    let text = ''
    if (hour !== 0) {
      text += `${hour}h`
    }
    if (hour !== 0 && min !== 0) {
      text += ` ${min}min`
    } else if (min !== 0) {
      text += `${min}min`
    }
    return text
  }

  return (
    <>
      <div
        className={'set-new-task__schedule'}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setTaskTimeLength },
            ),
          )
          if (isPopup) {
            setDialogProps({ task })
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            setShowDialog('SET_TASK_TIME_LENGTH')
          }
          // isQuickAdd
          //   ? showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          //   : setShowDialog('SET_TASK_TIME_LENGTH')
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {taskTimeLength ? getTimeLengthText(taskTimeLength) : '15min'}
      </div>
      {showPopup && (
        <SetNewTaskTimeLengthPopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setTaskTimeLength={setTaskTimeLength}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
