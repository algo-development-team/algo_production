import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg'
import { useChecklist, useCalendarInfo } from 'hooks'
import { updateUserInfo } from 'handleUserInfo'
import {
  useOverlayContextValue,
  useTaskEditorContextValue,
  useColumnEditorContextValue,
} from 'context'
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useAuth } from 'hooks'
import { db } from '_firebase'
import {
  getTaskDocsInProjectColumnNotCompleted,
  getTask,
} from '../../handleUserTasks'
import './styles/light.scss'
import './styles/menu-list.scss'
import { useParams } from 'react-router-dom'
import { insertEvent } from 'googleCalendar'
import moment from 'moment'
import { roundUp15Min } from 'handleMoment'
import { getTaskColorId } from 'handleColorId'
import { timeZone } from 'handleCalendars'
import { updateTask } from 'handleUserTasks'

export const MenuList = ({
  closeOverlay,
  projectId,
  columnId,
  taskId,
  taskIndex,
  columns,
  xPosition,
  yPosition,
  targetIsProject,
  targetIsColumn,
  targetIsTask,
  taskIsImportant,
  targetIsBoardTask,
}) => {
  const { currentUser } = useAuth()
  const { setTaskEditorToShow } = useTaskEditorContextValue()
  const { setColumnEditorToShow } = useColumnEditorContextValue()
  const { setShowDialog, setDialogProps } = useOverlayContextValue()
  const { defaultGroup } = useParams()
  const { calendarId, loading } = useCalendarInfo()
  const { checklist } = useChecklist()

  const handleProjectDeleteConfirmation = () => {
    setDialogProps({ projectId: projectId })
    setShowDialog('CONFIRM_DELETE')
  }

  const handleColumnDelete = async () => {
    const newColumns = columns.filter((column) => column.id !== columnId)

    try {
      const projectQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/projects`),
        where('projectId', '==', projectId),
      )
      const projectDocs = await getDocs(projectQuery)
      projectDocs.forEach(async (projectDoc) => {
        await updateDoc(projectDoc.ref, {
          columns: newColumns,
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleColumnTasksDelete = async () => {
    try {
      const taskQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('projectId', '==', projectId),
        where('boardStatus', '==', columnId),
      )
      const taskDocs = await getDocs(taskQuery)
      taskDocs.forEach(async (taskDoc) => {
        await deleteDoc(taskDoc.ref)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleTaskDelete = async () => {
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
      // UPDATE TASK INDEX HERE (COMPLETED)
      const q = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('taskId', '==', taskId),
      )
      const taskDocs = await getDocs(q)
      taskDocs.forEach(async (taskDoc) => {
        await deleteDoc(taskDoc.ref)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const deleteHandler = async (e) => {
    e.stopPropagation()
    closeOverlay()
    if (targetIsProject) {
      handleProjectDeleteConfirmation()
    } else if (targetIsColumn) {
      await handleColumnDelete()
      await handleColumnTasksDelete()
    } else {
      await handleTaskDelete()
    }
  }

  const editHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (targetIsTask) {
      setTaskEditorToShow(taskId)
      closeOverlay(e)
    } else if (targetIsColumn) {
      setColumnEditorToShow({ projectId, columnId })
      closeOverlay(e)
    } else if (targetIsProject) {
      setShowDialog('EDIT_PROJECT')
    }
  }

  const addtochecklistHandler = async (e) => {
    if (checklist.includes(taskId)) {
      return
    }
    try {
      const newChecklist = Array.from(checklist)
      newChecklist.push(taskId)
      await updateUserInfo(currentUser && currentUser.id, {
        checklist: newChecklist,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const removefromchecklistHandler = async (e) => {
    try {
      const newChecklist = checklist.filter(
        (existingtaskId) => existingtaskId !== taskId,
      )
      await updateUserInfo(currentUser && currentUser.id, {
        checklist: newChecklist,
      })
    } catch (error) {
      console.log(error)
    }
  }

  /* inserts the task as time block at current time in Google Calendar */
  const doNowAtCalendar = async (e) => {
    const task = await getTask(currentUser && currentUser.id, taskId)
    const duration = Math.min(task.timeLength, 120) // duration set to 2 hours max
    const now = moment.now()
    const startTime = roundUp15Min(now)
    const endTime = moment(startTime).add(duration, 'minutes')
    if (!loading) {
      const item = await insertEvent(
        calendarId,
        startTime.toISOString(),
        endTime.toISOString(),
        timeZone,
        task.name,
        task.description,
        getTaskColorId(task.priority),
      )
      // update task's eventId
      const updatedEventsId = Array.from(task.eventIds)
      updatedEventsId.push(item.id)
      await updateTask(currentUser && currentUser.id, taskId, {
        eventIds: updatedEventsId,
      })
    }
  }

  const computeXPosition = () => {
    let computedXPosition
    if (!targetIsBoardTask) {
      const { innerWidth: width } = window

      computedXPosition = xPosition - 100

      if (width < 1200 && width - xPosition < 100) {
        computedXPosition = xPosition - 130
      } else if (width < 900 && width - xPosition > 100) {
        computedXPosition = xPosition + 150
      }
    } else {
      computedXPosition = xPosition
      console.log('BOARDDD', targetIsBoardTask)
    }

    return computedXPosition
  }

  return (
    <div
      className='option__overlay'
      onClick={(e) => {
        e.stopPropagation()
        closeOverlay(e)
      }}
    >
      <div
        className='menu__list'
        style={{ top: `${yPosition}px`, left: `${computeXPosition()}px` }}
      >
        <ul>
          <li className='menu__list--item' onClick={(e) => editHandler(e)}>
            <div className='menu__list--icon'>
              <EditIcon />
            </div>
            <span className='menu__list--content'>
              Edit{' '}
              {targetIsProject ? 'Project' : targetIsColumn ? 'Column' : 'Task'}
            </span>
          </li>

          <li className='menu__list--item' onClick={(e) => deleteHandler(e)}>
            <div className='menu__list--icon'>
              <DeleteIcon />
            </div>

            <span className='menu__list--content'>
              Delete{' '}
              {targetIsProject ? 'Project' : targetIsColumn ? 'Column' : 'Task'}
            </span>
          </li>

          {targetIsTask && (
            <li
              className='menu__list--item'
              onClick={(e) => {
                defaultGroup === 'Checklist'
                  ? removefromchecklistHandler(e)
                  : addtochecklistHandler(e)
              }}
            >
              <div className='menu__list--icon'>
                <DeleteIcon />
              </div>

              <span className='menu__list--content'>
                {defaultGroup === 'Checklist'
                  ? 'Remove Task From Checklist'
                  : 'Add Task To Checklist'}
              </span>
            </li>
          )}
          {targetIsTask && (
            <li
              className='menu__list--item'
              onClick={(e) => {
                doNowAtCalendar(e)
              }}
            >
              <div className='menu__list--icon'>
                <EditIcon />
              </div>

              <span className='menu__list--content'>Do Now (Calendar)</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
