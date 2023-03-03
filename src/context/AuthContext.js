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
  const [userGIS, setUserGIS] = useState(null)
  const [profileGIS, setProfileGIS] = useState(null)
  let navigate = useNavigate()

  // print userGIS using useEffect
  useEffect(() => {
    console.log('userGIS:', userGIS)
  }, [userGIS])

  // print profileGIS using useEffect
  useEffect(() => {
    console.log('profileGIS:', profileGIS)
  }, [profileGIS])

  const loginGIS = useGoogleLogin({
    onSuccess: (codeResponse) => {
      const hasAccess = hasGrantedAllScopesGoogle(
        codeResponse,
        'https://www.googleapis.com/auth/calendar',
      )
      if (!hasAccess) {
        logoutGIS()
      } else {
        setUserGIS(codeResponse)
        axios
          .post('http://127.0.0.1:8000/api/auth/', codeResponse)
          .then((response) => {
            // handle success
            console.log('Response:', response.data)
          })
          .catch((error) => {
            // handle error
            console.error('Error:', error)
          })
      }
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/calendar',
  })

  // log out function to log the user out of google and set the profile array to null
  const logoutGIS = () => {
    console.log('Logging out of GIS')
    googleLogout()
    setProfileGIS(null)
  }

  useEffect(() => {
    if (userGIS) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${userGIS.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${userGIS.access_token}`,
              Accept: 'application/json',
            },
          },
        )
        .then((res) => {
          setProfileGIS(res.data)
        })
        .catch((err) => console.log(err))
    }
  }, [userGIS])

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

    logoutGIS()

    signOut(userAuth)
      .then(() => {
        setCurrentUser(null)
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
    userGIS,
    profileGIS,
    signinGoogle,
    signoutGoogle,
    loginGIS,
    logoutGIS,
  }

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
export default AuthProvider
