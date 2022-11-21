import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'
import { ReactComponent as NoDateIcon } from 'assets/svg/none.svg'
import { ReactComponent as SetScheduleIcon } from 'assets/svg/set-schedule.svg'
import { ReactComponent as WeekendIcon } from 'assets/svg/weekend.svg'
import { TodayIcon } from 'components/today-icon'
import './light.scss'
import './main.scss'

export const SetNewTaskTimeLengthPopper = ({
  isQuickAdd,
  setShowPopup,
  setTaskTimeLength,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const set15Min = () => {
    setTaskTimeLength(15)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }
  const set30Min = () => {
    setTaskTimeLength(30)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }
  const set1Hour = () => {
    setTaskTimeLength(60)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }
  const set2Hour = () => {
    setTaskTimeLength(120)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }
  const set4Hour = () => {
    setTaskTimeLength(240)
    isQuickAdd ? setShowPopup(false) : closeOverlay()
  }
  const set8Hour = () => {
    setTaskTimeLength(480)
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
          <li
            className='set-schedule__popper--option'
            onClick={() => set15Min()}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>15min</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => set30Min()}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>30min</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => set1Hour()}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>1h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => set2Hour()}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>2h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => set4Hour()}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>4h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => set8Hour()}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>8h</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
