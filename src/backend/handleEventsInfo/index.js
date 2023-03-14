import { getDocs, updateDoc, collection, query } from 'firebase/firestore'
import { db } from '_firebase'

export const getEventsInfo = async (userId) => {
  try {
    const eventsInfoQuery = await query(
      collection(db, 'user', `${userId}/eventsInfo`),
    )
    const eventsInfoDocs = await getDocs(eventsInfoQuery)
    const eventsInfoDocList = []
    eventsInfoDocs.forEach((eventsInfoDoc) => {
      eventsInfoDocList.push(eventsInfoDoc.data())
    })
    return eventsInfoDocList[0]
  } catch (error) {
    console.log(error)
    return null
  }
}

export const updateEventsInfo = async (userId, newEventsInfo) => {
  try {
    const eventsInfoQuery = await query(
      collection(db, 'user', `${userId}/eventsInfo`),
    )
    const eventsInfoDocs = await getDocs(eventsInfoQuery)
    eventsInfoDocs.forEach(async (eventsInfo) => {
      await updateDoc(eventsInfo.ref, newEventsInfo)
    })
  } catch (error) {
    console.log(error)
  }
}
