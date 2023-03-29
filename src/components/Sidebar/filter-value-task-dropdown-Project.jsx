import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskProjectPopper } from 'components/dropdowns/set-new-task-project-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'
export const ProjectFilter = ({
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

  return (
    <>
      <div
        //className={'set-new-task__schedule'}
        style={{
            padding: '5px 10px 5px 10px',
            borderRadius: '5px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            fontSize: '12px',
            outline: 'none',
            width: '65%',
            //height: '30px',
            boxSizing: 'border-box',
            marginBottom: '10px',
            display: 'flex',
        }}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setFilterSelect }
            ),
          )
          if (isPopup) {
            // console.log('isPopup...') // DEBUGGING
            setDialogProps({ setFilterSelect }) // Match the name 'task' with the 'setTaskTimeLength'
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            // console.log('isQuickAdd...') // DEBUGGING
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
              setShowDialog('SET_TASK_FILTER_PROJECT')
          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {filterSelect.selectedProjectName}
        {/* {console.log(filterSelect.selectedProjectName)} */}
      </div>
      {showPopup && (
        <SetNewTaskProjectPopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setProject={setFilterSelect}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
