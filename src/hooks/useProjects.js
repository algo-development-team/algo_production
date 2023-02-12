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
      setProjects((projects) => [])
      for (const projectId of projectIds) {
        let q = query(
          collection(db, 'project'),
          where('projectId', '==', projectId),
        )
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setProjects((projects) => {
              return [...projects, doc.data()]
            })
          })
        })

        unsubscribes.push(unsubscribe)
      }
      setLoading(false)
    }

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe()
      }
    }
  }, [projectIds])

  return { setProjects, projects, loading }
}
