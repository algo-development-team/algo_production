import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'
import './light.scss'
import './main.scss'

export const SetNewTaskDeadlineTypePopper = ({
  isQuickAdd,
  isPopup,
  setShowPopup,
  setTaskDeadlineType,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const setDeadlineType = (deadlineType) => {
    setTaskDeadlineType(deadlineType)
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
            onClick={() => setDeadlineType('HARD')}
          >
            <div className=''>
              <NextWeekIcon fill={'#ff9a14'} />
            </div>

            <p className='set-new-task__schedule--name'>Hard Deadline</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setDeadlineType('SOFT')}
          >
            <div className=''>
              <NextWeekIcon fill={'#25b84c'} />
            </div>

            <p className='set-new-task__schedule--name'>Soft Deadline</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
