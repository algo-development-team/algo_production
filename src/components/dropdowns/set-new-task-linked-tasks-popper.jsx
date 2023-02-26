import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'
import { useEffect } from 'react'
import './light.scss'
import './main.scss'

export const SetNewTaskLinkedTasksPopper = ({
  isQuickAdd,
  isPopup,
  setShowPopup,
  setLinkedTasks,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const setMin = (min) => {
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }

  const targetedposition = parentPosition
    ? parentPosition
    : { x: xPosition, y: yPosition }

  return (
    <div
      className='option__overlay'
      onClick={(event) => {
        event.stopPropagation()
        isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay(event)
      }}
    >
      <div
        className='set-schedule__popper'
        onClick={(event) => event.stopPropagation()}
        style={{
          top: `${targetedposition.y - 115}px`,
          left: `${targetedposition.x}px`,
        }}
      >
        <ul>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(0)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>None</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
