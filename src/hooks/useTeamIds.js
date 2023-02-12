import { collection, onSnapshot, query } from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useTeamIds = () => {
  const { currentUser } = useAuth()
  const [teamIds, setTeamIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(collection(db, 'userInfo'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let result = []
      querySnapshot.forEach((doc) => {
        let teamIds = []
        if (doc.data()?.userId) {
          teamIds.push(doc.data()?.userId)
        } else if (doc.data()?.teams) {
          teamIds = teamIds.concat(doc.data()?.teams)
        }
        result = teamIds
      })
      setTeamIds(result)
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  return { setTeamIds, teamIds, loading }
}
