import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useAutoScheduleDays = () => {
  const { currentUser } = useAuth()
  const [untilNextSunday, setUntilNextSunday] = useState(false)
  const [numDays, setNumDays] = useState(7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/userInfo`),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let numDaysResult = 7
      let untilNextSundayResult = false
      querySnapshot.forEach((doc) => {
        if (doc.data()?.numDays) {
          numDaysResult = doc.data()?.numDays
          untilNextSundayResult = doc.data()?.untilNextSunday
        }
      })

      setUntilNextSunday(untilNextSundayResult)
      setNumDays(numDaysResult)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { untilNextSunday, setUntilNextSunday, numDays, setNumDays, loading }
}
