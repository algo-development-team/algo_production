import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskSchedulePopper } from 'components/dropdowns/set-new-task-schedule-popper'
import { useOverlayContextValue } from 'context'
import { useEffect } from 'react'
import { useState } from 'react'
export const SetNewTaskSchedule = ({
  isQuickAdd,
  isPopup,
  setSchedule,
  schedule,
  task,
  defaultText,
}) => {
  const { showDialog, setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})
  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
  }

  const getDateStyle = () => {
    if (schedule?.day === 'Today') {
      let day = 'date__today'
      return day
    }
    if (schedule?.day === 'Tomorrow') {
      let day = 'date__tomorrow'
      return day
    }
    if (schedule?.day === '2 Days Later' || schedule?.day === '3 Days Later') {
      let day = 'date__weekend'
      return day
    }
    if (schedule?.day === 'Next Week') {
      let day = 'date__next-week'
      return day
    }
  }

  return (
    <>
      <div
        className={`set-new-task__schedule ${getDateStyle()}`}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setSchedule },
            ),
          )
          if (isPopup) {
            setDialogProps({ task })
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            setShowDialog('SET_SCHEDULE')
          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {schedule?.day === '' ? defaultText : schedule?.day}
      </div>
      {showPopup && (
        <SetNewTaskSchedulePopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setSchedule={setSchedule}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
