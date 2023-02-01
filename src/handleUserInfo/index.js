import {
  getDocs,
  addDoc,
  updateDoc,
  collection,
  query,
  doc,
  getDoc,
} from 'firebase/firestore'
import { timeZone } from 'handleCalendars'
import { db } from '_firebase'
import moment from 'moment'

export const getUserInfo = async (userId) => {
  try {
    const userInfoQuery = await query(
      collection(db, 'user', `${userId}/userInfo`),
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

export const getDefaultUserInfo = (email) => {
  const defaultPreferences = new Array(24).fill(0) // all preferences are urgent
  const defaultPersonalPreferences = new Array(24).fill(0) // all preferences are personal work
  const defaultUserInfo = {
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

// helper function exclusive to user initialization
export const initializeUserInfo = async (userId, newUserInfo) => {
  try {
    await addDoc(collection(db, 'user', `${userId}/userInfo`), newUserInfo)
  } catch (error) {
    console.log(error)
  }
}

export const updateUserInfo = async (userId, newUserInfo) => {
  try {
    const userInfoQuery = await query(
      collection(db, 'user', `${userId}/userInfo`),
    )
    const userInfoDocs = await getDocs(userInfoQuery)
    userInfoDocs.forEach(async (userInfo) => {
      await updateDoc(userInfo.ref, newUserInfo)
    })
  } catch (error) {
    console.log(error)
  }
}
