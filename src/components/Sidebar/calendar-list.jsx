import { useGoogleValue } from 'context'
import { colorIdToHexCode } from 'constants'
import { useState } from 'react'
import { cropLabel } from 'handleLabel'
import featherIcon from 'assets/svg/feather-sprite.svg'
import { useUnselectedCalendarIds, useAuth } from 'hooks'
import { updateUserInfo } from '../../backend/handleUserInfo'

export const CalendarList = () => {
  const { googleCalendars } = useGoogleValue()
  const { currentUser } = useAuth()
  const { unselectedCalendarIds, setUnselectedCalendarIds } =
    useUnselectedCalendarIds()
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
            transform: `rotate(${showCalendarList ? 180 : 0}deg)`,
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
          maxHeight: showCalendarList ? '140px' : 0,
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
              onClick={async () => {
                let updatedUnselectedCalendarIds = [...unselectedCalendarIds]
                if (unselectedCalendarIds.includes(googleCalendar.id)) {
                  updatedUnselectedCalendarIds =
                    updatedUnselectedCalendarIds.filter(
                      (id) => id !== googleCalendar.id,
                    )
                } else {
                  updatedUnselectedCalendarIds.push(googleCalendar.id)
                }
                setUnselectedCalendarIds(updatedUnselectedCalendarIds)
                await updateUserInfo(currentUser && currentUser.id, {
                  unselectedCalendarIds: updatedUnselectedCalendarIds,
                })
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
