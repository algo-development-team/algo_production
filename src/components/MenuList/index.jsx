import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg'
import { ReactComponent as RemoveFromOrAddToChecklistIcon } from 'assets/svg/checklist.svg'
import { useChecklist } from 'hooks'
import { updateUserInfo } from '../../backend/handleUserInfo'
import { updateProjectColumns } from '../../backend/handleUserProjects'
import {
  useOverlayContextValue,
  useTaskEditorContextValue,
  useColumnEditorContextValue,
} from 'context'
import { useAuth } from 'hooks'
import { columnTaskDelete, taskDelete } from '../../backend/handleUserTasks'
import './styles/light.scss'
import './styles/menu-list.scss'
import { useParams } from 'react-router-dom'

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

  const handleProjectDeleteConfirmation = () => {
    setDialogProps({ projectId: projectId })
    setShowDialog('CONFIRM_DELETE')
  }

  const { checklist } = useChecklist()

  const handleColumnTasksDelete = async () => {
    // column task delete
    await columnTaskDelete(currentUser && currentUser.id, projectId, columnId)
  }

  const handleTaskDelete = async () => {
    // Task Delete
    await taskDelete(currentUser && currentUser.id, projectId, columnId, taskIndex, taskId)
  }

  const deleteHandler = async (e) => {
    e.stopPropagation()
    closeOverlay()
    if (targetIsProject) {
      handleProjectDeleteConfirmation()
    } else if (targetIsColumn) {
      const newColumns = columns.filter((column) => column.id !== columnId)
      await updateProjectColumns(currentUser && currentUser.id, projectId, newColumns)
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
                <RemoveFromOrAddToChecklistIcon />
              </div>

              <span className='menu__list--content'>
                {defaultGroup === 'Checklist'
                  ? 'Remove Task From Checklist'
                  : 'Add Task To Checklist'}
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
