import { ReactComponent as GoogleCalendarIcon } from 'assets/svg/google-calendar.svg'
export const GoogleCalendarButton = () => {
  return (
    <a
      href='https://calendar.google.com/calendar/u/0/r/week'
      target='_blank'
      rel='noreferrer'
      className='home_button header-clickable'
    >
      <GoogleCalendarIcon strokeWidth='.1' />
    </a>
  )
}
