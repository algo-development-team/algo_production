import { useCalendarInfo } from 'hooks'
import './styles/light.scss'
import './styles/main.scss'

export const Calendar = () => {
  const { calendarId, calendarIds, timeZone, loading } = useCalendarInfo()

  const getSrcString = () => {
    let srcString = 'https://calendar.google.com/calendar/embed?'
    if (calendarId) {
      srcString += `&src=${calendarId}`
    }
    for (let i = 0; i < calendarIds.length; i++) {
      if (calendarIds[i].selected) {
        srcString += `&src=${calendarIds[i].id}`
      }
    }
    srcString += `&ctz=${timeZone}`
    return srcString
  }

  return (
    <div className='calendar-view'>
      {calendarId ? (
        <iframe
          className='embedded-calendar'
          title='calendar'
          src={getSrcString()}
          style={{
            border: 0,
            width: 1205,
            height: 670,
          }}
        ></iframe>
      ) : loading ? (
        <h4>Calendar Loading</h4>
      ) : (
        <h4>Calendar Unavailable</h4>
      )}
    </div>
  )
}
