import { ReactComponent as TooltipIcon } from 'assets/svg/tooltip-trigger.svg'
import { useOverlayContextValue } from 'context/overlay-context'
import './styles/light.scss'
import './styles/menu-button.scss'

export const OptionsButton = ({
  taskId,
  projectId,
  columnId,
  scheduleId,
  taskIndex,
  targetIsProject,
  targetIsColumn,
  targetIsBoardTask,
  targetIsTask,
  targetIsSchedule,
  columns,
  isHeaderButton,
}) => {
  const { setShowDialog, setDialogProps } = useOverlayContextValue()

  const menuTriggerHandler = (event, elementPosition) => {
    event.stopPropagation()
    event.preventDefault()

    setDialogProps(
      Object.assign(
        { elementPosition },
        targetIsTask && {
          projectId: projectId,
          columnId: columnId,
          taskId: taskId,
          taskIndex: taskIndex,
          targetIsTask: targetIsTask,
        },
        targetIsBoardTask && {
          projectId: projectId,
          columnId: columnId,
          taskId: taskId,
          taskIndex: taskIndex,
          targetIsBoardTask: targetIsBoardTask,
        },
        targetIsColumn && {
          projectId: projectId,
          columnId: columnId,
          columns: columns,
          targetIsColumn: targetIsColumn,
        },
        targetIsProject && {
          projectId: projectId,
          targetIsProject: targetIsProject,
        },
        targetIsSchedule && {
          scheduleId: scheduleId,
          targetIsSchedule: targetIsSchedule,
        },
      ),
    )
    setShowDialog('MENU_LIST')
  }

  return (
    <button
      className={`menu__trigger ${
        isHeaderButton ? 'menu__trigger--header' : ''
      }`}
      onClick={(event) =>
        menuTriggerHandler(event, event.currentTarget.getBoundingClientRect())
      }
    >
      <TooltipIcon />
    </button>
  )
}
