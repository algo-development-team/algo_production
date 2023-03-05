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
  const [userGoogle, setUserGoogle] = useState(null)
  let navigate = useNavigate()

  const loginGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      const hasAccess = hasGrantedAllScopesGoogle(
        codeResponse,
        'https://www.googleapis.com/auth/calendar',
      )
      if (!hasAccess) {
        logoutGoogle()
      } else {
        setUserGoogle(codeResponse)
        console.log('Code Response:', codeResponse) // TESTING
        axios
          .post('http://localhost:8080/api/google/auth/', {
            code: codeResponse.code,
            userId: currentUser.id,
          })
          .then((response) => {
            // handle success
            console.log('Success')
          })
          .catch((error) => {
            // handle error
            console.error('Error:', error)
          })
      }
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'auth-code',
  })

  // log out function to log the user out of google and set the profile array to null
  const logoutGoogle = () => {
    console.log('Logging out of Google')
    setUserGoogle(null)
    googleLogout()
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

    logoutGoogle()

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
    userGoogle,
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
