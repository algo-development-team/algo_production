const ScheduleButton = ({ label }) => {
  return <button className='schedule__btn'>{label}</button>
}

export const GoogleCalendarIntegration = () => {
  return (
    <div>
      <h2>Google Calendar Integration</h2>
      <h4>
        Click this button at top bar to connect your Google Calendar to your
        account.
      </h4>
      <ScheduleButton label='Connect to Google Calendar' />
      <h4>Once connected, you can create a daily schedule by clicking</h4>
      <ScheduleButton label='Create Daily Schedule' />
      <h3 style={{ color: '#4a4cde' }}>Important Note</h3>
      <h4>
        At the Google Sign In Authorization page, you must sign in with the same
        Gmail account that you signed into Algo, and{' '}
        <span style={{ color: '#4a4cde' }}>check </span>
        the "See, edit, share, ... using Google Calendar" option.
      </h4>
    </div>
  )
}
