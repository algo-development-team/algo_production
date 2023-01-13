import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useCalendarInfo = () => {
  const { currentUser } = useAuth()
  const [calendarId, setCalendarId] = useState(null)
  const [calendarIds, setCalendarIds] = useState([])
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/userInfo`),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let calendarIdResult = null
      let calendarIdsResult = []
      let timeZoneResult = Intl.DateTimeFormat().resolvedOptions().timeZone
      querySnapshot.forEach((doc) => {
        if (doc.data()?.calendarId) {
          calendarIdResult = doc.data()?.calendarId
        }
        if (doc.data()?.calendarIds) {
          calendarIdsResult = doc.data()?.calendarIds
        }
        if (doc.data()?.timeZone) {
          timeZoneResult = doc.data()?.timeZone
        }
      })

      setCalendarId(calendarIdResult)
      setCalendarIds(calendarIdsResult)
      setTimeZone(timeZoneResult)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return {
    setCalendarId,
    setCalendarIds,
    setTimeZone,
    calendarId,
    calendarIds,
    timeZone,
    loading,
  }
}
