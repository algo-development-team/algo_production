import featherIcon from 'assets/svg/feather-sprite.svg'
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useAuth } from 'hooks'
import { db } from '_firebase'
import {
  getTaskDocsInProjectColumnNotCompleted,
  getTaskDocsInProjectColumnCompleted,
} from '../../handleUserTasks'

export const TaskCheckbox = ({
  projectId,
  columnId,
  taskId,
  taskIndex,
  taskPriority,
}) => {
  const { currentUser } = useAuth()

  const completeTaskHandler = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      const columnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
        currentUser && currentUser.id,
        projectId,
        columnId,
      )

      columnTaskDocs.forEach(async (taskDoc) => {
        if (taskDoc.data().index > taskIndex) {
          await updateDoc(taskDoc.ref, {
            index: taskDoc.data().index - 1,
          })
        }
      })

      const columnTasksDocsCompleted =
        await getTaskDocsInProjectColumnCompleted(
          currentUser && currentUser.id,
          projectId,
          columnId,
        )

      const columnTasksCompleted = []
      columnTasksDocsCompleted.forEach((taskDoc) => {
        columnTasksCompleted.push(taskDoc.data())
      })

      let newIndex = 0
      if (columnTasksCompleted.length > 0) {
        const maxIndex = Math.max(
          ...columnTasksCompleted.map((task) => task.index),
        )
        newIndex = maxIndex + 1
      }

      const taskQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('taskId', '==', taskId),
      )
      const taskDocs = await getDocs(taskQuery)
      taskDocs.forEach(async (taskDoc) => {
        await updateDoc(taskDoc.ref, {
          completed: true,
          index: newIndex,
        })
      })
      // TASK INDEX HERE (COMPLETED)
    } catch (error) {
      console.log(error)
    }
  }

  const getBorderColor = (priority) => {
    switch (priority) {
      case 4:
        return '#ff7066'
      case 3:
        return '#ff9a14'
      case 2:
        return '#5297ff'
      case 1:
        return 'inherit'
      default:
        return 'inherit'
    }
  }

  return (
    <div
      className='task__checkbox'
      onClick={(event) => completeTaskHandler(event)}
      style={{ borderColor: getBorderColor(taskPriority), borderWidth: '2px' }}
    >
      <svg
        className='task__checkbox--icon'
        width='12'
        height='12'
        fill='none'
        stroke='#fff'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <use xlinkHref={`${featherIcon}#check`}></use>
      </svg>
    </div>
  )
}
