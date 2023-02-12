import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useIsSetup = () => {
  const { currentUser } = useAuth()
  const [isSetup, setIsSetup] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(collection(db, 'userInfo'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = true
      querySnapshot.forEach((doc) => {
        if (!doc.data()?.isSetup) {
          result = doc.data()?.isSetup
        }
      })

      setIsSetup(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setIsSetup, isSetup, loading }
}
