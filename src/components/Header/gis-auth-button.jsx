import { useAuth } from 'hooks'

export const GISAuthButton = () => {
  const { profileGIS, loginGIS, logoutGIS } = useAuth()

  return (
    <>
      {profileGIS ? (
        <button onClick={() => logoutGIS()}>Log out 🚀 </button>
      ) : (
        <button onClick={() => loginGIS()}>Sign in with Google 🚀 </button>
      )}
    </>
  )
}
