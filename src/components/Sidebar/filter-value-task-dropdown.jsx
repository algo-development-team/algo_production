import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import { SetNewTaskFilterPopper } from 'components/dropdowns/set-filter-tasks-popper'
import { SetNewTaskPriorityPopper } from 'components/dropdowns/set-new-task-priority-popper'
import { SetNewTaskSchedulePopper } from 'components/dropdowns/set-new-task-schedule-popper'
import { SetNewTaskProjectPopper } from 'components/dropdowns/set-new-task-project-popper'
import { SetNewTaskDueDatePopper } from 'components/dropdowns/set-filter-duedate-popper'
import { useOverlayContextValue } from 'context'
import { useState } from 'react'
export const SetNewFilterValueTask = ({
  isQuickAdd,
  isPopup,
  filter,
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
        className={'set-filterbar'}
        // style={{
        //     padding: '5px 10px 5px 10px',
        //     borderRadius: '5px',
        //     border: 'none',
        //     boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        //     fontSize: '12px',
        //     outline: 'none',
        //     width: '65%',
        //     boxSizing: 'border-box',
        //     marginBottom: '10px',
        //     display: 'flex',
        // }}
        onClick={(e) => {
          setDialogProps(
            Object.assign(
              { elementPosition: e.currentTarget.getBoundingClientRect() },
              { setFilterSelect }
            ),
          )
          if (isPopup) {
            setDialogProps({ setFilterSelect }) // Match the name 'task' with the 'setTaskTimeLength'
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else if (isQuickAdd) {
            showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
          } else {
            if (filter === 'Due Date') {
              setShowDialog('SET_TASK_FILTER_SCHEDULE')
            }
            else if (filter === 'Projects') {
              setShowDialog('SET_TASK_FILTER_PROJECT')
            }
            else if (filter === 'Priority') {
              setShowDialog('SET_TASK_FILTER_PRIORITY')
            }

          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {filterSelect}
      </div>
      {(filter === 'Due Date') && showPopup && (
        <SetNewTaskDueDatePopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setSchedule={setFilterSelect}
          parentPosition={parentPosition}
        />
      )}
      {(filter === 'Projects') && showPopup && (
        <SetNewTaskProjectPopper
          isQuickAdd={isQuickAdd}
          isPopup={isPopup}
          setShowPopup={setShowPopup}
          setProject={setFilterSelect}
          parentPosition={parentPosition}
        />
      )}
      {(filter === 'Priority') && showPopup && (
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
