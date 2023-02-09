import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { generatePushId } from 'utils'
import {
  getDefaultUserInfo,
  getDefaultUserTeam,
  getDefaultUserProject,
  getDefaultUserTasks,
} from './defaultUserData'

const initConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
}

const firebaseConfig = initializeApp(initConfig)

export const auth = getAuth(firebaseConfig)

export const provider = new GoogleAuthProvider()
export const db = getFirestore(firebaseConfig)
export { firebaseConfig as firebase }

export const batchWriteDefaultData = async (userId, userName, email) => {
  try {
    const defaultUserInfo = getDefaultUserInfo(userId, email)
    const defaultUserTeam = getDefaultUserTeam(userId, userName)
    const defaultUserProject = getDefaultUserProject(userId)
    const defaultUserTasks = getDefaultUserTasks(userId)

    const projectDocRef = doc(collection(db, 'project'))
    setDoc(projectDocRef, defaultUserProject).then(() => {
      let batch = writeBatch(db)
      while (defaultUserTasks.length) {
        const id = generatePushId()
        batch.set(doc(db, 'task', id), defaultUserTasks.pop())
        if (!defaultUserTasks.length) {
          batch.commit()
        }
      }
    })
    const teamDocRef = doc(collection(db, 'team'))
    await setDoc(teamDocRef, defaultUserTeam)
    const userInfoRef = doc(collection(db, 'userInfo'))
    await setDoc(userInfoRef, defaultUserInfo)
  } catch (error) {
    console.log(error)
  }
}

export const createUserProfileDocument = async (userAuth) => {
  if (!userAuth) return

  const userRef = doc(db, 'user', userAuth.uid)

  const userSnapshot = await getDoc(userRef)

  if (!userSnapshot.exists()) {
    const { displayName, email } = userAuth
    const createdAt = new Date()

    setDoc(userRef, { displayName, createdAt, email })
      .finally(() => batchWriteDefaultData(userAuth.uid, displayName, email))
      .catch((error) => console.log(error))
  }
  return userRef
}
