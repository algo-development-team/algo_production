import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'
import { ReactComponent as NoDateIcon } from 'assets/svg/none.svg'
import { ReactComponent as SetScheduleIcon } from 'assets/svg/set-schedule.svg'
import { ReactComponent as WeekendIcon } from 'assets/svg/weekend.svg'
import { TodayIcon } from 'components/today-icon'
import './light.scss'
import './main.scss'

export const SetNewTaskPriorityPopper = ({
  isQuickAdd,
  setShowPopup,
  setTaskPriority,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const setOne = () => {
    setTaskPriority(1)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }
  const setTwo = () => {
    setTaskPriority(2)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }
  const setThree = () => {
    setTaskPriority(3)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }

  const targetedposition = parentPosition
    ? parentPosition
    : { x: xPosition, y: yPosition }

  return (
    <div
      className='option__overlay'
      onClick={(event) => {
        event.stopPropagation()
        isQuickAdd ? setShowPopup(false) : closeOverlay(event)
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
          <li className='set-schedule__popper--option' onClick={() => setOne()}>
            <div className=''>
              <NextWeekIcon fill={'#25b84c'} />
            </div>

            <p className='set-new-task__schedule--name'>Low</p>
          </li>
          <li className='set-schedule__popper--option' onClick={() => setTwo()}>
            <div className=''>
              <NextWeekIcon fill={'#5297ff'} />
            </div>

            <p className='set-new-task__schedule--name'>Average</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setThree()}
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
