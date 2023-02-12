import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { useAuth, useProjectIds } from 'hooks'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collatedTasksExist } from 'utils'
import { db } from '_firebase'

export const useTasks = () => {
  const { projectId, defaultGroup } = useParams()
  const selectedProject = projectId || defaultGroup
  const { currentUser } = useAuth()
  const { projectIds } = useProjectIds()

  const [tasks, setTasks] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let queries = []
    if (selectedProject && !collatedTasksExist(selectedProject)) {
      queries.push(
        query(
          collection(db, 'task'),
          where('projectId', '==', selectedProject),
          orderBy('index', 'asc'),
        ),
      )
    } else if (selectedProject === 'Inbox' || selectedProject === 0) {
      if (currentUser.id) {
        queries.push(
          query(
            collection(db, 'task'),
            where('projectId', '==', currentUser.id),
            orderBy('index', 'asc'),
          ),
        )
      }
    } else {
      if (currentUser.id) {
        queries.push(
          query(
            collection(db, 'task'),
            where('projectId', '==', currentUser.id),
            orderBy('index', 'asc'),
          ),
        )
        for (const customProjectId of projectIds) {
          if (customProjectId !== currentUser.id) {
            queries.push(
              query(
                collection(db, 'task'),
                where('projectId', '==', customProjectId),
                orderBy('index', 'asc'),
              ),
            )
          }
        }
      }
    }

    const unsubscribes = []

    setTasks((tasks) => [])
    for (const q of queries) {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data()?.completed !== true) {
            setTasks((tasks) => {
              return [...tasks, doc.data()]
            })
          }
        })
      })
      unsubscribes.push(unsubscribe)
    }

    setLoading(false)
    return unsubscribes
  }, [selectedProject, currentUser, projectIds])
  return { setTasks, tasks, loading }
}
