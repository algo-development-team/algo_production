import React, { createContext, useState, useEffect } from 'react'
import { auth, createUserProfileDocument, provider } from '_firebase'
import { signInWithRedirect, signOut } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import {
  getUserInfo,
  getDefaultUserInfo,
  initializeUserInfo,
} from '../backend/handleUserInfo'
import { getValidToken } from '../google'
import {
  googleLogout,
  useGoogleLogin,
  hasGrantedAllScopesGoogle,
} from '@react-oauth/google'
import axios from 'axios'

export const AuthContext = createContext()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [isUserGoogleAuthenticated, setIsUserGoogleAuthenticated] =
    useState(false)

  let navigate = useNavigate()

  useEffect(() => {
    const checkUserGoogleAuthenticated = async () => {
      const accessToken = await getValidToken(currentUser.id)

      if (accessToken) {
        setIsUserGoogleAuthenticated(true)
      }
    }

    if (currentUser) {
      checkUserGoogleAuthenticated()
    }
  }, [currentUser])

  const loginGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      const hasAccess = hasGrantedAllScopesGoogle(
        codeResponse,
        'https://www.googleapis.com/auth/calendar',
      )
      if (!hasAccess) {
        logoutGoogle()
        alert('Please grant access to your Google Calendar (check all boxes)')
      } else {
        axios
          .post(`${process.env.REACT_APP_SERVER_URL}/api/google/login/`, {
            code: codeResponse.code,
            userId: currentUser.id,
            email: currentUser.email,
          })
          .then(async (response) => {
            // handle success
            const accessToken = await getValidToken(currentUser.id)

            if (accessToken) {
              setIsUserGoogleAuthenticated(true)
              console.log('Login success')
            } else {
              console.log('Login failed')
              alert(
                'Please login with the same Google account as you used to log into Algo',
              )
            }
          })
          .catch((error) => {
            // handle error
            console.error('Login error:', error)
          })
      }
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'auth-code',
  })

  /* logs user directly out of Google OAuth2 */
  const logoutGoogle = () => {
    console.log('Logging out of Google (hard)')
    // log out from Google OAuth2 and remove user token info from Firestore
    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/api/google/logout/`, {
        userId: currentUser.id,
      })
      .then((response) => {
        // handle success
        setIsUserGoogleAuthenticated(false)
        googleLogout()
        console.log('Login success')
      })
      .catch((error) => {
        // handle error
        console.error('Login error:', error)
      })
  }

  /* logs only out from current session */
  const softLogoutGoogle = () => {
    setIsUserGoogleAuthenticated(false)
    googleLogout()
    console.log('Logging out of Google (soft)')
  }

  const signinGoogle = (e) => {
    e.preventDefault()
    signInWithRedirect(auth, provider)
      .then((result) => {
        const user = result.user
        const userData = {
          displayName: user.displayName,
          email: user.email,
          id: user.uid,
        }
        setCurrentUser(userData)
        localStorage.setItem('userAuth', JSON.stringify(userData))
        navigate('/app/Checklist')
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        console.log(errorCode, ':', errorMessage)
      })
  }

  const signoutGoogle = () => {
    const userAuth = getAuth()

    signOut(userAuth)
      .then(() => {
        setCurrentUser(null)
        softLogoutGoogle()
        localStorage.removeItem('userAuth')
      })
      .finally(() => navigate('/'))
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth)
        onSnapshot(userRef, async (snapshot) => {
          const snapshotData = snapshot.data()
          const userInfo = await getUserInfo(snapshot.id)
          if (userInfo.empty === true && userInfo.failed === false) {
            const defaultUserInfo = getDefaultUserInfo(snapshotData.email)
            await initializeUserInfo(snapshot.id, defaultUserInfo)
          } else if (userInfo.failed === true) {
            console.log('error getting user info')
            alert('Please refresh the page')
          }

          const user = {
            displayName: snapshotData.displayName,
            email: snapshotData.email,
            id: snapshot.id,
          }
          setCurrentUser(user)

          localStorage.setItem('userAuth', JSON.stringify(user))
        })
      } else {
        setCurrentUser(userAuth)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const authValue = {
    currentUser,
    isUserGoogleAuthenticated,
    signinGoogle,
    signoutGoogle,
    loginGoogle,
    logoutGoogle,
  }

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
export default AuthProvider
