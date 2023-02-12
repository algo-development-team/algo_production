import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '_firebase'
import { useProjectIds } from './useProjectIds'

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { projectIds } = useProjectIds()

  useEffect(() => {
    setLoading(true)

    const unsubscribes = []

    if (projectIds) {
      let result = []

      for (const projectId of projectIds) {
        let subresult = []

        let q = query(
          collection(db, 'project'),
          where('projectId', '==', projectId),
        )
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            subresult.push(doc.data())
          })
        })

        result = result.concat(subresult)
        unsubscribes.push(unsubscribe)
      }
      setProjects(result)
      setLoading(false)
    }

    return unsubscribes
  }, [projectIds])

  return { setProjects, projects, loading }
}
