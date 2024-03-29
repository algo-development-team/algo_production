import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'
import { useState } from 'react'
import { ReactComponent as NoDateIcon } from 'assets/svg/none.svg'
import { ReactComponent as SetScheduleIcon } from 'assets/svg/set-schedule.svg'
import { ReactComponent as DaysLaterIcon } from 'assets/svg/weekend.svg'
import { TodayIcon } from 'components/today-icon'
import moment from 'moment'
import './light.scss'
import './main.scss'

export const SetNewTaskDueDatePopper = ({
  isQuickAdd,
  isPopup,
  setShowPopup,
  setSchedule,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const [customDate, setCustomDate] = useState('')

  const setNext7days = () => {
    setSchedule({
      day: 'Next Week',
      date: moment().add(7, 'days').format('DD-MM-YYYY'),
    })
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }
  const setTomorrow = () => {
    setSchedule({
      day: 'Tomorrow',
      date: moment().add(1, 'day').format('DD-MM-YYYY'),
    })
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }
  const setToday = () => {
    setSchedule({ day: 'Today', date: moment().format('DD-MM-YYYY') })
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }
  const setPastDeadline = () => {
    setSchedule({
      day: 'Past Deadline',
      date: moment().format('DD-MM-YYYY'),
    })
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }
  const setCustom = () => {
    const customDateFormatted = moment(customDate)
    const today = moment().startOf('day')
    const daysDiff = customDateFormatted.diff(today, 'days')
    setSchedule({
      day: moment().add(daysDiff, 'day').format('MMM DD'),
      date: moment().add(daysDiff, 'day').format('DD-MM-YYYY'),
    })
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }
  const setNoDate = () => {
    setSchedule({ day: '', date: '' })
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
            onClick={() => setToday()}
          >
            <div className=''>
              <TodayIcon color={'#25b84c'} />
            </div>
            <p className='set-new-task__schedule--name'>Today</p>
            <p className='set-new-task__schedule--weekday'>
              {moment().format('ddd')}
            </p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setTomorrow()}
          >
            <div className=''>
              <SetScheduleIcon fill={'#ff9a14'} />
            </div>

            <p className='set-new-task__schedule--name'>Tomorrow</p>
            <p className='set-new-task__schedule--weekday'>
              {moment().add(1, 'day').format('ddd')}
            </p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setPastDeadline()}
          >
            <div className=''>
              <SetScheduleIcon fill={'#ff9a14'} />
            </div>

            <p className='set-new-task__schedule--name'>Past Deadline</p>
            <p className='set-new-task__schedule--weekday'>
              {moment().add(1, 'day').format('ddd')}
            </p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setCustom()}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>Custom</p>
            <p
              className='set-new-task__schedule--weekday'
              style={{ visibility: 'hidden' }}
            >
              {moment().format('ddd')}
            </p>
            <input
              type='date'
              style={{
                color: 'grey',
                background: 'transparent',
                border: 0,
                zIndex: 1000,
              }}
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setNoDate()}
          >
            <div className=''>
              <NoDateIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>No Date</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
