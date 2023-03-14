import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useScheduledTasks = () => {
  const { currentUser } = useAuth()
  const [scheduledTasks, setScheduledTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/eventsInfo`),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = []
      querySnapshot.forEach((doc) => {
        if (doc.data()?.scheduledTasks) {
          result = doc.data()?.scheduledTasks
        }
      })

      setScheduledTasks(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setScheduledTasks, scheduledTasks, loading }
}
