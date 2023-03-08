import { useAuth } from 'hooks'
import { getUserGoogleCalendarList } from 'google'

export const GoogleAuthButton = () => {
  const { currentUser, isUserGoogleAuthenticated, loginGoogle, logoutGoogle } =
    useAuth()

  if (!currentUser) {
    return <button disabled>Loading</button>
  }

  return (
    <>
      {isUserGoogleAuthenticated ? (
        <>
          <button onClick={() => logoutGoogle()}>Log out 🚀 </button>
          <button
            onClick={async () => {
              const googleCalendarList = await getUserGoogleCalendarList(
                currentUser.id,
              )
              console.log('googleCalendarList:', googleCalendarList) // TESTING
            }}
          >
            Get All Calendars 🚀{' '}
          </button>
        </>
      ) : (
        <button onClick={() => loginGoogle()}>Sign in with Google 🚀 </button>
      )}
    </>
  )
}
