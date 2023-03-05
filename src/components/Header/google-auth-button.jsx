import { useAuth } from 'hooks'
import { getUserGoogleCalendarList } from 'google'

export const GoogleAuthButton = () => {
  const { currentUser, userGoogle, loginGoogle, logoutGoogle } = useAuth()

  if (!currentUser) {
    return <button disabled>Loading</button>
  }

  return (
    <>
      {userGoogle ? (
        <button onClick={() => logoutGoogle()}>Log out 🚀 </button>
      ) : (
        <button onClick={() => loginGoogle()}>Sign in with Google 🚀 </button>
      )}
      {userGoogle && currentUser && (
        <button onClick={() => getUserGoogleCalendarList(currentUser.id)}>
          Get All Calendars 🚀{' '}
        </button>
      )}
    </>
  )
}
