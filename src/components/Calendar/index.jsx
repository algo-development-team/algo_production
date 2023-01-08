import { useCalendarId } from 'hooks'

export const Calendar = () => {
  const { calendarId, loading } = useCalendarId()

  return (
    <div className='task-list__wrapper'>
      <h1>My Calendar</h1>
      {calendarId ? (
        <iframe
          title='calendar'
          src={`https://calendar.google.com/calendar/embed?
src=${calendarId.replace('@', '%40')}&
ctz=America%2FWinnipeg`}
          style={{
            border: 0,
            width: 800,
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
