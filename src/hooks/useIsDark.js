import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useIsDark = () => {
  const { currentUser } = useAuth()
  const [isDark, setIsDark] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/userInfo`),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = true
      querySnapshot.forEach((doc) => {
        if (!doc.data()?.isDark) {
          result = false
        }
      })

      setIsDark(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setIsDark, isDark, loading }
}
