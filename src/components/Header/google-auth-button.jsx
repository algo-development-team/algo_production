import { useAuth } from 'hooks'
import { ReactComponent as GoogleCalendarIcon } from 'assets/svg/google-calendar.svg'
import { useResponsiveSizes } from 'hooks'

export const GoogleAuthButton = () => {
  const { currentUser, isUserGoogleAuthenticated, loginGoogle, logoutGoogle } =
    useAuth()
  const { sizes } = useResponsiveSizes()

  if (!currentUser) {
    return <button disabled>Loading</button>
  }

  const handleGoogleAuth = () => {
    if (isUserGoogleAuthenticated) {
      logoutGoogle()
    } else {
      loginGoogle()
    }
  }

  const getButtonText = () => {
    if (sizes.phone) {
      if (isUserGoogleAuthenticated) {
        return 'Disconnect'
      } else {
        return 'Connect'
      }
    } else {
      if (isUserGoogleAuthenticated) {
        return 'Disconnect Google Calendar'
      } else {
        return 'Connect to Google Calendar'
      }
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingRight: '10px',
        borderRadius: '5px',
        marginRight: sizes.phone ? '10px' : '15px',
      }}
      className='google-auth-button'
      onClick={() => handleGoogleAuth()}
    >
      <GoogleCalendarIcon strokeWidth='.1' />
      <span>{getButtonText()}</span>
    </div>
  )
}
