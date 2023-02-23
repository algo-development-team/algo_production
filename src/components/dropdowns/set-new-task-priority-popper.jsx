import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'
import './light.scss'
import './main.scss'

export const SetNewTaskPriorityPopper = ({
  isQuickAdd,
  isPopup,
  setShowPopup,
  setTaskPriority,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const setPriority = (priority) => {
    setTaskPriority(priority)
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
            onClick={() => setPriority(1)}
          >
            <div className=''>
              <NextWeekIcon fill={'#25b84c'} />
            </div>

            <p className='set-new-task__schedule--name'>Low</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setPriority(2)}
          >
            <div className=''>
              <NextWeekIcon fill={'#5297ff'} />
            </div>

            <p className='set-new-task__schedule--name'>Average</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setPriority(3)}
          >
            <div className=''>
              <NextWeekIcon fill={'#ff9a14'} />
            </div>

            <p className='set-new-task__schedule--name'>High</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
