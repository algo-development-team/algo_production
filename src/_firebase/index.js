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
import { icebreakerTasks } from './icebreakerTasks'

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

export const batchWriteIcebreakerTasks = async (userId) => {
  const icebreakerProjectId = 'welcome'
  try {
    const icebreakerProject = {
      name: 'Welcome 👋',
      projectId: icebreakerProjectId,
      projectColour: {
        name: 'Peacock',
        hex: '#039be5',
      },
      projectIsList: false,
      projectScheduleId: 'WORK_SCHEDULE',
      columns: [
        {
          id: 'NOSECTION',
          title: '(No Section)',
        },
        {
          id: 'TODO',
          title: 'To do',
        },
        {
          id: 'INPROGRESS',
          title: 'In Progress',
        },
        {
          id: 'COMPLETE',
          title: 'Complete',
        },
      ],
    }
    const projectsDocRef = doc(collection(db, 'user', `${userId}/projects`))
    setDoc(projectsDocRef, icebreakerProject).then(() => {
      let batch = writeBatch(db)
      while (icebreakerTasks.length) {
        const id = generatePushId()
        batch.set(
          doc(db, 'user', `${userId}/tasks/${id}`),
          icebreakerTasks.pop(),
        )
        if (!icebreakerTasks.length) {
          batch.commit()
        }
      }
    })
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
      .finally(() => batchWriteIcebreakerTasks(userAuth.uid))
      .catch((err) => console.log(err))
  }
  return userRef
}
