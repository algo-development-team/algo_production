import { useCalendarInfo } from 'hooks'
import './light.scss'
import './main.scss'

export const Calendar = () => {
  const { calendarId, calendarIds, timeZone, loading } = useCalendarInfo()

  const getSrcString = () => {
    let srcString =
      'https://calendar.google.com/calendar/embed?src=techandy42%40gmail.com'
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
    <div className='task-list__wrapper'>
      <h1>My Calendar</h1>
      {calendarId ? (
        <iframe
          className='calendar'
          title='calendar'
          src={getSrcString()}
          style={{
            border: 0,
            width: 900,
            height: 600,
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
