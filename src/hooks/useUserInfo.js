import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useUserInfo = () => {
  const { currentUser } = useAuth()
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(collection(db, 'userInfo'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = []
      let snapshotIdx = 0
      querySnapshot.forEach((doc) => {
        if (snapshotIdx === 0) {
          result = doc.data()
        }
        snapshotIdx++
      })

      setUserInfo(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setUserInfo, userInfo, loading }
}
