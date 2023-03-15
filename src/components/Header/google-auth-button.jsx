import { useAuth } from 'hooks'
import { ReactComponent as GoogleCalendarIcon } from 'assets/svg/google-calendar.svg'

export const GoogleAuthButton = () => {
  const { currentUser, isUserGoogleAuthenticated, loginGoogle, logoutGoogle } =
    useAuth()

  if (!currentUser) {
    return <button disabled>Loading</button>
  }

  return (
    <div>
      {isUserGoogleAuthenticated ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '5px',
            borderRadius: '5px',
          }}
          className='google-auth-button'
        >
          <GoogleCalendarIcon strokeWidth='.1' />
          <span onClick={() => logoutGoogle()}>Disconnect Google Calendar</span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '5px',
            borderRadius: '5px',
          }}
          className='google-auth-button'
        >
          <GoogleCalendarIcon strokeWidth='.1' />
          <span onClick={() => loginGoogle()}>Integrate Google Calendar</span>
        </div>
      )}
    </div>
  )
}
