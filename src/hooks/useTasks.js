import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useAuth } from 'hooks'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collatedTasksExist } from 'utils'
import { db } from '_firebase'

export const useTasks = () => {
  const { projectId, defaultGroup } = useParams()
  const selectedProject = projectId || defaultGroup

  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let q = query(
      collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
    )
    if (selectedProject && !collatedTasksExist(selectedProject)) {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('projectId', '==', selectedProject),
      )
    } else if (selectedProject === 'Checklist') {
      // NO CHANGES TO q HERE
    } else if (selectedProject === 'Inbox' || selectedProject === 0) {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('projectId', '==', ''),
      )
    } else if (selectedProject === 'Scheduled') {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('date', '!=', ''),
        where('completed', '==', false),
      )
    } else if (selectedProject === 'Important') {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('important', '==', true),
      )
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const result = []
      querySnapshot.forEach((doc) => {
        if (doc.data()?.completed !== true) {
          result.push(doc.data())
        }
      })

      if (selectedProject === 'Scheduled') {
        let resultSortedByDate = result.sort((a, b) => {
          return moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY'))
        })
        setTasks(resultSortedByDate)
        setLoading(false)
      } else {
        setTasks(result)
      }
    })
    return unsubscribe
  }, [selectedProject, currentUser])
  return { setTasks, tasks, loading }
}
