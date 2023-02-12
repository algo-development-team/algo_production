import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useTeamIds } from './useTeamIds'
import { db } from '_firebase'

export const useProjectIds = () => {
  const [projectIds, setProjectIds] = useState([])
  const [loading, setLoading] = useState(true)
  const { teamIds } = useTeamIds()

  useEffect(() => {
    setLoading(true)

    const unsubscribes = []

    if (teamIds) {
      let result = []

      for (const teamId of teamIds) {
        let subresult = []

        let q = query(collection(db, 'team'), where('teamId', '==', teamId))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.data()?.projects) {
              subresult = doc.data()?.projects
            }
          })
        })

        result = result.concat(subresult)
        unsubscribes.push(unsubscribe)
      }
      setProjectIds(result)
      setLoading(false)
    }

    // return unsubscribes
  }, [teamIds])

  return { setProjectIds, projectIds, loading }
}
