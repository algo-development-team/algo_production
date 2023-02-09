import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useTeamIds } from './useTeamIds'
import { db } from '_firebase'

export const useTeams = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const { teamIds } = useTeamIds()

  useEffect(() => {
    setLoading(true)

    const unsubscribes = []

    if (teamIds) {
      let result = []

      for (const teamId of teamIds) {
        let q = query(collection(db, 'team'), where('teamId', '==', teamId))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            result.push(doc.data())
          })
        })

        unsubscribes.push(unsubscribe)
      }
      setTeams(result)
      setLoading(false)
    }

    // return unsubscribes
  }, [teamIds])

  return { setTeams, teams, loading }
}
