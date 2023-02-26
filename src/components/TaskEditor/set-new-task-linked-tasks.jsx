import { useOverlayContextValue } from 'context'
import { useState } from 'react'
import { SetNewTaskLinkedTasksPopper } from 'components/dropdowns/set-new-task-linked-tasks-popper'

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
      <input
        style={{
          padding: '12px',
          display: 'flex',
          backgroundColor: '#282828',
          width: '-webkit-fill-available',
          marginBottom: '0.6rem',
          borderRadius: '5px',
          border: '1px solid #ffffff1a',
          boxShadow: '0 10px 10px #0000001a, 0 6px 3px #0000001f',
          position: 'relative',
          alignItems: 'center',
          color: 'inherit',
          fontSize: '14px',
        }}
        placeholder='Search for a task...'
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value)
        }}
        onSelect={(e) => {
          setDialogProps(
            Object.assign(
              {
                elementPosition: e.currentTarget.getBoundingClientRect(),
              },
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
          setLinkedTasks={setLinkedTasks}
          parentPosition={parentPosition}
        />
      )}
    </>
  )
}
