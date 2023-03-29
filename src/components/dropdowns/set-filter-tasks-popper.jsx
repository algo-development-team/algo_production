import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'

import './light.scss'
import './main.scss'

export const SetNewTaskFilterPopper = ({
  isQuickAdd,
  isPopup,
  setShowPopup,
  setFilter,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const setFilterSelection = (selection) => {
    setFilter(selection)
    // console.log('selection', selection) // DEBUGGING
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
          top: `${targetedposition.y + 40}px`,
          left: `${targetedposition.x}px`,
        }}
      >
        <ul>
          <li
            className='set-schedule__popper--option'
            onClick={() => setFilterSelection('Due Date')}
          >
            {/* <div className=''>
              <NextWeekIcon fill={'#25b84c'} />
            </div> */}

            <p className='set-new-task__schedule--name'>Due Date</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setFilterSelection('Priority')}
          >
            {/* <div className=''>
              <NextWeekIcon fill={'#5297ff'} />
            </div> */}

            <p className='set-new-task__schedule--name'>Priority</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setFilterSelection('Projects')}
          >
            {/* <div className=''>
              <NextWeekIcon fill={'#ff9a14'} />
            </div> */}

            <p className='set-new-task__schedule--name'>Projects</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
