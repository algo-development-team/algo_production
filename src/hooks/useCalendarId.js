import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useCalendarId = () => {
  const { currentUser } = useAuth()
  const [calendarId, setCalendarId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/userInfo`),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = null
      querySnapshot.forEach((doc) => {
        if (doc.data()?.calendarId) {
          result = doc.data()?.calendarId
        }
      })

      setCalendarId(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setCalendarId, calendarId, loading }
}
