import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useAuth, useProjects } from 'hooks'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collatedTasksExist } from 'utils'
import { db } from '_firebase'

export const useTasks = () => {
  const { projectId, defaultGroup } = useParams()
  const selectedProject = projectId || defaultGroup

  const { currentUser } = useAuth()
  const { projects } = useProjects()

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

      if (selectedProject === 'Inbox' || selectedProject === 'Important') {
        let resultSortedByIndex = result.sort((a, b) => {
          if (a.index > b.index) {
            return 1
          }
          if (a.index < b.index) {
            return -1
          }
          return 0
        })
        setTasks(resultSortedByIndex)
      } else if (selectedProject === 'Scheduled') {
        let resultSortedByDate = result.sort((a, b) => {
          return moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY'))
        })
        setTasks(resultSortedByDate)
      } else {
        setTasks(result)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [selectedProject, currentUser, projects])
  return { setTasks, tasks, loading }
}
