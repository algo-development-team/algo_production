import { useState } from 'react'
import moment from 'moment'
import './light.scss'
import './main.scss'

export const SetNewEventSchedulePopper = ({
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
  const setTime = (time) => {
    setSchedule({ time: `${time}` })
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }
  const times = ["12:00 AM", "12:15 AM", "12:30 AM", "12:45 AM", "01:00 AM", "01:15 AM", "01:30 AM", "01:45 AM",
  "02:00 AM", "02:15 AM", "02:30 AM", "02:45 AM", "03:00 AM", "03:15 AM", "03:30 AM", "03:45 AM",
  "04:00 AM", "04:15 AM", "04:30 AM", "04:45 AM", "05:00 AM", "05:15 AM", "05:30 AM", "05:45 AM",
  "06:00 AM", "06:15 AM", "06:30 AM", "06:45 AM", "07:00 AM", "07:15 AM", "07:30 AM", "07:45 AM",
  "08:00 AM", "08:15 AM", "08:30 AM", "08:45 AM", "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
  "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM", "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
  "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM", "01:00 PM", "01:15 PM", "01:30 PM", "01:45 PM",
  "02:00 PM", "02:15 PM", "02:30 PM", "02:45 PM", "03:00 PM", "03:15 PM", "03:30 PM", "03:45 PM",
  "04:00 PM", "04:15 PM", "04:30 PM", "04:45 PM", "05:00 PM", "05:15 PM", "05:30 PM", "05:45 PM",
  "06:00 PM", "06:15 PM", "06:30 PM", "06:45 PM", "07:00 PM", "07:15 PM", "07:30 PM", "07:45 PM",
  "08:00 PM", "08:15 PM", "08:30 PM", "08:45 PM", "09:00 PM", "09:15 PM", "09:30 PM", "09:45 PM",
  "10:00 PM", "10:15 PM", "10:30 PM", "10:45 PM", "11:00 PM", "11:15 PM", "11:30 PM", "11:45 PM"]
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
          {times.map((time) => {
          return (
            <>
          <li
            className='set-schedule__popper--option'
            onClick={() => setTime(time)}
          >
            <p className='set-new-task__schedule--name'>{time}</p>
            <p className='set-new-task__schedule--weekday'>
              {moment().format('hh:mm')}
            </p>
          </li>
          </>)})}
        </ul>
      </div>
    </div>
  )
}
