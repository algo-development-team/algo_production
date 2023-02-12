import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useChecklist = () => {
  const { currentUser } = useAuth()
  const [checklist, setChecklist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(collection(db, 'userInfo'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = []
      querySnapshot.forEach((doc) => {
        if (doc.data()?.checklist) {
          result = doc.data()?.checklist
        }
      })

      setChecklist(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setChecklist, checklist, loading }
}
