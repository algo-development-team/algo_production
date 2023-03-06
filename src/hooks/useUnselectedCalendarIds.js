import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useUnselectedCalendarIds = () => {
  const { currentUser } = useAuth()
  const [unselectedCalendarIds, setUnselectedCalendarIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/userInfo`),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = []
      querySnapshot.forEach((doc) => {
        if (doc.data()?.unselectedCalendarIds) {
          result = doc.data()?.unselectedCalendarIds
        }
      })

      setUnselectedCalendarIds(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setUnselectedCalendarIds, unselectedCalendarIds, loading }
}
