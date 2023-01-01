import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useScheduleCreated = () => {
  const { currentUser } = useAuth()
  const [scheduleCreated, setScheduleCreated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/userInfo`),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = false
      querySnapshot.forEach((doc) => {
        if (doc.data()?.scheduleCreated === true) {
          result = true
        }
      })

      setScheduleCreated(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setScheduleCreated, scheduleCreated, loading }
}
