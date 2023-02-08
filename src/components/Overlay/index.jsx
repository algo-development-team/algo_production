/* eslint-disable default-case */
import { ConfrimDeleteProject } from 'components/ConfirmDeleteProject'
import { SetNewTaskProjectPopper } from 'components/dropdowns/set-new-task-project-popper'
import { SetNewTaskSchedulePopper } from 'components/dropdowns/set-new-task-schedule-popper'
import { SetNewTaskPriorityPopper } from 'components/dropdowns/set-new-task-priority-popper'
import { SetNewTaskTimeLengthPopper } from 'components/dropdowns/set-new-task-time-length-popper'
import { MenuList } from 'components/MenuList'
import { UserOptions } from 'components/UserOption'
import { ViewOptions } from 'components/ViewOptions'
import { useOverlayContextValue } from 'context/overlay-context'
import { useEffect } from 'react'
import './main.scss'
import { ProjectEditor } from './ProjectEditor'
import { TeamEditor } from './TeamEditor'
import { QuickAddTaskDialog } from './quick-add-task-dialog'
import { TaskPopup } from './task-popup'
import { GoogleCalendarAuth } from './google-calendar-auth'
import { Setting } from './setting'
import { ScheduleCreated } from './schedule-created'
import { ProductGuide } from './product-guide'

export const Overlay = () => {
  const { showDialog, setShowDialog, dialogProps } = useOverlayContextValue()
  const closeOverlay = () => {
    setShowDialog('')
  }
  useEffect(() => {
    setShowDialog(false)
  }, [])
  const renderSwitch = (params) => {
    switch (showDialog) {
      case 'ADD_PROJECT':
        return <ProjectEditor closeOverlay={closeOverlay} />
      case 'ADD_TEAM':
        return <TeamEditor closeOverlay={closeOverlay} />
      case 'QUICK_ADD_TASK':
        return <QuickAddTaskDialog closeOverlay={closeOverlay} />
      case 'TASK_POPUP':
        return (
          <TaskPopup
            closeOverlay={closeOverlay}
            taskId={dialogProps.task.taskId}
            task={dialogProps.task}
            isEdit
          />
        )
      case 'GOOGLE_CALENDAR_AUTH':
        return <GoogleCalendarAuth closeOverlay={closeOverlay} />
      case 'SETTING':
        return <Setting closeOverlay={closeOverlay} />
      case 'SCHEDULE_CREATED':
        return <ScheduleCreated closeOverlay={closeOverlay} />
      case 'PRODUCT_GUIDE':
        return <ProductGuide closeOverlay={closeOverlay} />
      case 'SETUP_GUIDE':
        return <ScheduleCreated closeOverlay={closeOverlay} />
      case 'USER_OPTIONS':
        return (
          <UserOptions
            closeOverlay={closeOverlay}
            xPosition={dialogProps.elementPosition.x}
            yPosition={dialogProps.elementPosition.y}
          />
        )
      case 'VIEW_OPTIONS':
        return (
          <ViewOptions
            closeOverlay={closeOverlay}
            xPosition={dialogProps.elementPosition.x}
            yPosition={dialogProps.elementPosition.y}
            projectId={dialogProps.projectId}
          />
        )
      case 'MENU_LIST':
        return (
          <MenuList
            closeOverlay={closeOverlay}
            taskId={dialogProps.taskId}
            columnId={dialogProps.columnId}
            projectId={dialogProps.projectId}
            taskIndex={dialogProps.taskIndex}
            columns={dialogProps.columns}
            xPosition={dialogProps.elementPosition.x}
            yPosition={dialogProps.elementPosition.y}
            targetIsProject={dialogProps.targetIsProject}
            targetIsColumn={dialogProps.targetIsColumn}
            targetIsTask={dialogProps.targetIsTask}
            taskIsImportant={dialogProps.taskIsImportant}
          />
        )
      case 'SET_SCHEDULE':
        return (
          <SetNewTaskSchedulePopper
            closeOverlay={closeOverlay}
            setSchedule={dialogProps.setSchedule}
            projectId={dialogProps.projectId}
            xPosition={dialogProps.elementPosition.x}
            yPosition={dialogProps.elementPosition.y}
          />
        )
      case 'SET_PROJECT':
        return (
          <SetNewTaskProjectPopper
            closeOverlay={closeOverlay}
            setProject={dialogProps.setProject}
            projectId={dialogProps.projectId}
            xPosition={dialogProps.elementPosition.x}
            yPosition={dialogProps.elementPosition.y}
            setPopupSelectedProject={dialogProps.setPopupSelectedProject}
          />
        )
      case 'SET_TASK_PRIORITY':
        return (
          <SetNewTaskPriorityPopper
            closeOverlay={closeOverlay}
            setTaskPriority={dialogProps.setTaskPriority}
            projectId={dialogProps.projectId}
            xPosition={dialogProps.elementPosition.x}
            yPosition={dialogProps.elementPosition.y}
            setPopupSelectedProject={dialogProps.setPopupSelectedProject}
          />
        )
      case 'SET_TASK_TIME_LENGTH':
        return (
          <SetNewTaskTimeLengthPopper
            closeOverlay={closeOverlay}
            setTaskTimeLength={dialogProps.setTaskTimeLength}
            projectId={dialogProps.projectId}
            xPosition={dialogProps.elementPosition.x}
            yPosition={dialogProps.elementPosition.y}
            setPopupSelectedProject={dialogProps.setPopupSelectedProject}
          />
        )
      case 'EDIT_PROJECT':
        return (
          <ProjectEditor
            isEdit
            projectToEdit={dialogProps.project}
            closeOverlay={closeOverlay}
          />
        )
      case 'CONFIRM_DELETE':
        return (
          <ConfrimDeleteProject
            closeOverlay={closeOverlay}
            projectId={dialogProps.projectId}
          />
        )
    }
  }
  return <>{renderSwitch(showDialog)}</>
}
