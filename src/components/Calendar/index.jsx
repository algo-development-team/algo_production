import { useEffect } from 'react'
import { useCalendarId } from 'hooks'

export const Calendar = () => {
  const { calendarId } = useCalendarId()

  useEffect(() => {
    console.log('calendarId', calendarId)
  }, [calendarId])

  return (
    <div className='task-list__wrapper'>
      <h1>My Calendar</h1>
      {calendarId ? (
        <iframe
          src={`https://calendar.google.com/calendar/embed?
src=${calendarId.replace('@', '%40')}&
ctz=America%2FWinnipeg`}
          style={{ border: 0 }}
          width='800'
          height='600'
        ></iframe>
      ) : (
        <h4>Calendar Unavailable</h4>
      )}
    </div>
  )
}
