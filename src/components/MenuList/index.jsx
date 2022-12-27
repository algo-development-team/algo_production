import { ReactComponent as ArchiveIcon } from 'assets/svg/archive.svg'
import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg'
import featherIcon from 'assets/svg/feather-sprite.svg'
import { useOverlayContextValue, useTaskEditorContextValue } from 'context'
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useAuth } from 'hooks'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '_firebase'
import './styles/light.scss'
import './styles/menu-list.scss'

export const MenuList = ({
  closeOverlay,
  taskId,
  projectId,
  columnId,
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
  const navigate = useNavigate()
  const { setTaskEditorToShow } = useTaskEditorContextValue()
  const { setShowDialog, showDialog, setDialogProps } = useOverlayContextValue()

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

  const handleProjectOrTaskDelete = async () => {
    try {
      const q = await query(
        collection(
          db,
          'user',
          `${currentUser && currentUser.id}/${
            targetIsProject ? 'projects' : 'tasks'
          }`,
        ),
        where(
          `${targetIsProject ? 'projectId' : 'taskId'}`,
          '==',
          targetIsProject ? projectId : taskId,
        ),
      )
      const docs = await getDocs(q)
      docs.forEach(async (taskDoc) => {
        await deleteDoc(taskDoc.ref)
      })
      targetIsProject && navigate('/app/Checklist')
    } catch (error) {
      console.log(error)
    }
  }

  const handleProjectTasksDelete = async () => {
    try {
      const taskQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('projectId', '==', projectId),
      )
      const taskDocs = await getDocs(taskQuery)
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
      return
    } else if (targetIsColumn) {
      await handleColumnDelete()
      await handleColumnTasksDelete()
      return
    }

    await handleProjectOrTaskDelete()
    await handleProjectTasksDelete()
  }

  const editHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (targetIsTask) {
      console.log(taskId)
      setTaskEditorToShow(taskId)
      closeOverlay(e)
    } else if (targetIsColumn) {
      console.log('show popup for editing column...') // DEBUGGING
    } else if (targetIsProject) {
      setShowDialog('EDIT_PROJECT')
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
        </ul>
      </div>
    </div>
  )
}
