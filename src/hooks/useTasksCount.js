import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useAuth } from 'hooks'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { db } from '_firebase'

export const useTasksCount = (isDefaultGroup, projectId, name) => {
  const { currentUser } = useAuth()
  const [taskCount, setTaskCount] = useState()

  useEffect(() => {
    let q = null
    if (!isDefaultGroup) {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('projectId', '==', projectId),
        where('completed', '==', false),
      )
    } else if (isDefaultGroup && name === 'Inbox') {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('projectId', '==', ''),
        where('completed', '==', false),
      )
    } else if (isDefaultGroup && name === 'Important') {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('important', '==', true),
        where('completed', '==', false),
      )
    } else {
      q = query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('completed', '==', false),
      )
    }
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let numOfTasks = querySnapshot.docs.length
      if (isDefaultGroup && (name === 'Checklist' || name === 'Scheduled')) {
        setTaskCount(0)
      } else {
        setTaskCount(numOfTasks)
      }
    })
    return unsubscribe
  }, [isDefaultGroup, projectId])

  return taskCount
}
