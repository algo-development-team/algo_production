import {
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { timeZone } from 'handleCalendars'
import { db } from '_firebase'

/* CONVERTED */
export const createUserDoc = async (userId) => {
  const userRef = doc(db, 'user', userId)
  return userRef
}

/* CONVERTED */
export const getUserInfoOld = async (userId) => {
  try {
    const userInfoQuery = await query(
      collection(db, 'user'),
      where('userId', '==', userId),
    )
    const userInfoDocs = await getDocs(userInfoQuery)
    const userInfoDocList = []
    userInfoDocs.forEach((userInfoDoc) => {
      userInfoDocList.push(userInfoDoc)
    })
    if (userInfoDocs.empty === true) {
      return { empty: true, userInfoDoc: null, failed: false }
    }
    return { empty: false, userInfoDoc: userInfoDocList[0], failed: false }
  } catch (error) {
    console.log(error)
    return { empty: true, userInfoDoc: null, failed: true }
  }
}

/* CONVERTED */
export const getUserInfo = async (userId) => {
  try {
    const userInfoQuery = await query(
      collection(db, 'user'),
      where('userId', '==', userId),
    )
    const userInfoDocs = await getDocs(userInfoQuery)
    const userInfoList = []
    userInfoDocs.forEach((userInfoDoc) => {
      userInfoList.push(userInfoDoc.data())
    })
    return userInfoList[0]
  } catch (error) {
    console.log(error)
    return null
  }
}

/* CONVERTED */
export const getUserDefaultData = async (userId) => {
  try {
    const userRef = doc(db, 'user', userId)
    const userSnapshot = await getDoc(userRef)
    if (userSnapshot.exists()) {
      const userDefaultData = userSnapshot.data()
      return userDefaultData
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

/* CONVERTED */
export const getDefaultUserInfo = (userId, email) => {
  const defaultPreferences = new Array(24).fill(0) // all preferences are urgent
  const defaultPersonalPreferences = new Array(24).fill(0) // all preferences are personal work
  const defaultUserInfo = {
    userId: userId,
    teams: [],
    workTimeRange: '9:00-17:00',
    sleepTimeRange: '23:00-07:00',
    preferences: defaultPreferences,
    personalPreferences: defaultPersonalPreferences,
    workDays: [false, true, true, true, true, true, false],
    isSetup: false,
    calendarId: null,
    calendarIds: [{ id: email, selected: true, summary: email, colorId: 7 }],
    timeZone: timeZone,
    checklist: [],
    scheduleCreated: false,
    isGrouping: true,
    isWeekly: true,
    startingDay: 5,
    beforeMeetingBufferTime: 0,
    afterMeetingBufferTime: 0,
    beforeWorkBufferTime: 0,
    afterWorkBufferTime: 0,
    beforeSleepBufferTime: 0,
    afterSleepBufferTime: 0,
  }
  return defaultUserInfo
}

/* CONVERTED */
export const initializeUserInfo = async (userRef, newUserInfo) => {
  setDoc(userRef, newUserInfo)
    .finally(() => console.log('user initialized'))
    .catch((error) => console.log(error))
}

/* CONVERTED */
export const updateUserInfo = async (userId, newUserInfo) => {
  try {
    const userInfoQuery = await query(
      collection(db, 'user'),
      where('userId', '==', userId),
    )
    const userInfoDocs = await getDocs(userInfoQuery)
    userInfoDocs.forEach(async (userInfo) => {
      await updateDoc(userInfo.ref, newUserInfo)
    })
  } catch (error) {
    console.log(error)
  }
}

/* CONVERTED */
export const projectTasksDelete = async (userId, projectId) => {
  try {
    const tasksQuery = await query(
      collection(db, 'task'),
      where('projectId', '==', projectId),
    )
    const taskDocs = await getDocs(tasksQuery)
    taskDocs.forEach(async (taskDoc) => {
      await deleteDoc(taskDoc.ref)
    })
  } catch (error) {
    console.log(error)
  }
}
