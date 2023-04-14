import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskFilterPopper } from 'components/dropdowns/set-filter-tasks-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'
export const SetNewFilterTask = ({
  isQuickAdd,
  isPopup,
  filter,
  setFilter,
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
        //     marginBottom: '10px',
        //     display: 'flex',
        // }}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setFilter },
            ),
          )
          if (isPopup) {
            setDialogProps({ setFilter }) // Match the name 'task' with the 'setTaskTimeLength'
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            setShowDialog('SET_TASK_FILTER')
          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {filter}
      </div>
      {showPopup && (
        <SetNewTaskFilterPopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setFilter={setFilter}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
