import { useGoogleValue } from 'context'
import { colorIdToHexCode } from 'constants'
import { useState } from 'react'
import { cropLabel } from 'handleLabel'
import featherIcon from 'assets/svg/feather-sprite.svg'

export const CalendarList = () => {
  const { googleCalendars } = useGoogleValue()
  const [unselectedCalendarIds, setUnselectedCalendarIds] = useState([])
  const [showCalendarList, setShowCalendarList] = useState(true)

  return (
    <div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <h4>My calendars</h4>
        <div
          className='custom-project-group__icon'
          style={{
            transform: `rotate(${showCalendarList ? 0 : 180}deg)`,
            cursor: 'pointer',
          }}
          onClick={() => setShowCalendarList(!showCalendarList)}
        >
          <svg
            width='24'
            height='24'
            fill='none'
            stroke='#777777'
            strokeWidth='1px'
          >
            <use href={`${featherIcon}#chevron-down`}></use>
          </svg>
        </div>
      </div>
      <div
        style={{
          maxHeight: showCalendarList ? 0 : '140px',
          overflowY: 'scroll',
        }}
      >
        {googleCalendars.map((googleCalendar) => (
          <div style={{ marginBottom: '5px' }}>
            <input
              type='checkbox'
              id={googleCalendar.id}
              checked={!unselectedCalendarIds.includes(googleCalendar.id)}
              style={{
                accentColor: colorIdToHexCode[googleCalendar.colorId],
                marginRight: '8px',
              }}
              onClick={() => {
                if (unselectedCalendarIds.includes(googleCalendar.id)) {
                  setUnselectedCalendarIds((prevUnselectedCalendarIds) =>
                    prevUnselectedCalendarIds.filter(
                      (id) => id !== googleCalendar.id,
                    ),
                  )
                } else {
                  setUnselectedCalendarIds((prevUnselectedCalendarIds) => [
                    ...prevUnselectedCalendarIds,
                    googleCalendar.id,
                  ])
                }
              }}
            />
            <label for={googleCalendar.calendarId}>
              {cropLabel(googleCalendar.summary, 30)}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
