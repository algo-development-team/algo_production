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
    if (calendarIds.length > 0) {
      calendarIds.forEach((id) => {
        srcString += `&src=${id}`
      })
    }
    srcString += `&ctz=${timeZone}`
    return srcString
  }

  return (
    <div className='calendar-view'>
      {/* <h1>My Calendar</h1> */}
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
