import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskPriorityPopper } from 'components/dropdowns/set-new-task-priority-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'
export const PriorityFilter = ({
  isQuickAdd,
  isPopup,
  filterSelect,
  setFilterSelect,
}) => {
  const { showDialog, setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})
  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
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
        className={'set-filterbar'}
        // style={{
        //     padding: '5px 10px 5px 10px',
        //     borderRadius: '5px',
        //     border: 'none',
        //     boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        //     fontSize: '12px',
        //     outline: 'none',
        //     width: '65%',
        //     //height: '30px',
        //     boxSizing: 'border-box',
        //     marginBottom: '15px',
        //     display: 'flex',
        // }}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setFilterSelect },
            ),
          )
          if (isPopup) {
            setDialogProps({ setFilterSelect }) // Match the name 'task' with the 'setTaskTimeLength'
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            setShowDialog('SET_TASK_FILTER_PRIORITY')
          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {getPriorityText(filterSelect)}
      </div>
      {showPopup && (
        <SetNewTaskPriorityPopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setTaskPriority={setFilterSelect}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
