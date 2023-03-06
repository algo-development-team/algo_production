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
            onClick={() =>
              console.log(getUserGoogleCalendarList(currentUser.id))
            }
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
