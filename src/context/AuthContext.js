import React, { createContext, useState, useEffect } from 'react'
import { auth, provider } from '_firebase'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { disconnectClient, initClient } from 'gapiHandlers'
import {
  createUserDoc,
  getDefaultUserInfo,
  initializeUserInfo,
} from 'backend/handleUserInfo'
import { createDefaultTeamDoc, getDefaultTeam, initializeDefaultTeam } from 'backend/handleTeams'

export const AuthContext = createContext()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [isClientLoaded, setIsClientLoaded] = useState(false)
  let navigate = useNavigate()
  const authUser = getAuth()

  // Older version of initializing gapi for sending the token to the backend
  // Not used in this implementation
  // useEffect(() => {
  //   gapi.load('client:auth2', () => {
  //     gapi.auth2.init({
  //       clientId: process.env.REACT_APP_CLIENT_ID,
  //       scope: 'openid email profile https://www.googleapis.com/auth/calendar',
  //     })
  //   })
  // }, [])

  useEffect(() => {
    initClient((result) => {
      if (result) {
        console.log('Client initialized')
        setIsClientLoaded(true)
      } else {
        console.log('Client not initialized')
      }
    })
  }, [])

  const setDisplayName = (name) => {
    updateProfile(authUser.currentUser, {
      displayName: name,
    }).catch((error) => {
      // An error occurred
      // ...
    })
  }

  const signinWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password).then((cred) => {
      setCurrentUser(cred.user)
      localStorage.setItem('userAuth', JSON.stringify(cred.user))
      navigate('/app/Checklist')
    })
  }

  const signupWithEmail = async ({ email, password, name }) => {
    return createUserWithEmailAndPassword(auth, email, password).then(
      (cred) => {
        setDisplayName(name)
        setCurrentUser({ ...cred.user, displayName: name })
        localStorage.setItem('userAuth', JSON.stringify(cred.user))
        navigate('/app/Checklist')
      },
    )
  }

  const signinGoogle = (e) => {
    e.preventDefault()
    signInWithPopup(auth, provider)
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

  const signout = () => {
    const userAuth = getAuth()

    disconnectClient()
    signOut(userAuth)
      .then(() => {
        setCurrentUser(null)
        localStorage.removeItem('userAuth')
      })
      .finally(() => navigate('/'))
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      setLoading(false)
      if (userAuth) {
        const teamRef = await createDefaultTeamDoc(userAuth.uid)
        onSnapshot(teamRef, async (snapshot) => {
          const defaultTeam = getDefaultTeam(snapshot.id)
          await initializeDefaultTeam(teamRef, defaultTeam)
        })

        const userRef = await createUserDoc(userAuth.uid)
        onSnapshot(userRef, async (snapshot) => {
          const defaultUserInfo = getDefaultUserInfo(snapshot.id, userAuth.email)
          await initializeUserInfo(userRef, defaultUserInfo)

          const user = {
            displayName: userAuth.displayName,
            email: userAuth.email,
            id: snapshot.id,
          }
          setCurrentUser(user)

          localStorage.setItem('userAuth', JSON.stringify(user))
        })
      } else {
        setCurrentUser(userAuth)
      }
    })

    return () => unsubscribe()
  }, [])

  const authValue = {
    currentUser,
    isClientLoaded,
    signupWithEmail,
    signinWithEmail,
    signinGoogle,
    signout,
  }

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
export default AuthProvider
