import { ReactComponent as GoogleCalendarIcon } from 'assets/svg/google-calendar.svg'
import { inputIconSelection } from '../../handleAnalytics'
import { useAuth } from 'hooks'

export const GoogleCalendarButton = () => {
  const { currentUser } = useAuth()

  return (
    <a
      href='https://calendar.google.com/calendar/u/0/r/week'
      target='_blank'
      rel='noreferrer'
      className='home_button header-clickable'
      onClick={() =>
        inputIconSelection(currentUser && currentUser.id, 'GOOGLE_CALENDAR')
      }
    >
      <GoogleCalendarIcon strokeWidth='.1' />
    </a>
  )
}
