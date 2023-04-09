import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg'
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

export const MenuList = ({
  closeOverlay,
  scheduleId,
  projectId,
  columnId,
  taskId,
  taskIndex,
  columns,
  xPosition,
  yPosition,
  targetIsSchedule,
  targetIsProject,
  targetIsColumn,
  targetIsTask,
  targetIsBoardTask,
}) => {
  const { currentUser } = useAuth()
  const { setTaskEditorToShow } = useTaskEditorContextValue()
  const { setColumnEditorToShow } = useColumnEditorContextValue()
  const { setShowDialog, setDialogProps } = useOverlayContextValue()

  const handleProjectDeleteConfirmation = () => {
    setDialogProps({ projectId: projectId })
    setShowDialog('CONFIRM_DELETE')
  }

  const handleColumnTasksDelete = async () => {
    await columnTaskDelete(currentUser && currentUser.id, projectId, columnId)
  }

  const handleTaskDelete = async () => {
    await taskDelete(
      currentUser && currentUser.id,
      projectId,
      columnId,
      taskIndex,
      taskId,
    )
  }

  const deleteHandler = async (e) => {
    e.stopPropagation()
    closeOverlay()
    if (targetIsSchedule) {
      // HANDLE SCHEDULE DELETE
    } else if (targetIsProject) {
      handleProjectDeleteConfirmation()
    } else if (targetIsColumn) {
      const newColumns = columns.filter((column) => column.id !== columnId)
      await updateProjectColumns(
        currentUser && currentUser.id,
        projectId,
        newColumns,
      )
      await handleColumnTasksDelete()
    } else if (targetIsTask || targetIsBoardTask) {
      await handleTaskDelete()
    }
  }

  const editHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (targetIsSchedule) {
      // HANDLE SCHEDULE EDIT
    } else if (targetIsProject) {
      setShowDialog('EDIT_PROJECT')
    } else if (targetIsColumn) {
      setColumnEditorToShow({ projectId, columnId })
      closeOverlay(e)
    } else if (targetIsTask || targetIsBoardTask) {
      setTaskEditorToShow(taskId)
      closeOverlay(e)
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
    }

    return computedXPosition
  }

  const getOptionLabelType = () => {
    if (targetIsSchedule) {
      return 'Schedule'
    } else if (targetIsProject) {
      return 'Project'
    } else if (targetIsColumn) {
      return 'Column'
    } else if (targetIsTask || targetIsBoardTask) {
      return 'Task'
    } else {
      return ''
    }
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
              Edit {getOptionLabelType()}
            </span>
          </li>

          <li className='menu__list--item' onClick={(e) => deleteHandler(e)}>
            <div className='menu__list--icon'>
              <DeleteIcon />
            </div>

            <span className='menu__list--content'>
              Delete {getOptionLabelType()}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
