import featherIcon from 'assets/svg/feather-sprite.svg'
import { useThemeContextValue, useCalendarsEventsValue } from 'context'
import { useTaskEditorContextValue } from 'context/board-task-editor-context'
import { useAuth, useProjects, useSelectedProject, useTasks } from 'hooks'
import moment from 'moment'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { generatePushId } from 'utils'
import { SetNewTaskProject } from './set-new-task-project'
import { SetNewTaskSchedule } from './set-new-task-schedule'
import { SetNewTaskPriority } from './set-new-task-priority'
import { SetNewTaskTimeLength } from './set-new-task-time-length'
import { addTask, updateTaskFromFields } from '../../backend/handleUserTasks'
import './styles/main.scss'
import './styles/light.scss'
import { useAutosizeTextArea, useResponsiveSizes } from 'hooks'
import { updateGoogleCalendarEvents } from '../../google'

export const TaskEditor = ({
  column,
  isQuickAdd,
  isEdit,
  isPopup,
  task,
  closeOverlay,
}) => {
  const params = useParams()
  const { defaultGroup } = params
  const [startSchedule, setStartSchedule] = useState({ day: '', date: '' })
  const [endSchedule, setEndSchedule] = useState({ day: '', date: '' })
  const { projects } = useProjects()
  const { selectedProject, defaultState } = useSelectedProject(params, projects)
  const { projectIsList } = selectedProject
  const [project, setProject] = useState(
    isQuickAdd ? defaultState : { ...selectedProject },
  )
  const [showAddTaskForm, setShowAddTaskForm] = useState(
    isQuickAdd || isEdit ? true : false,
  )
  const [taskName, setTaskName] = useState(isEdit && task.name)
  const [taskDescription, setTaskDescription] = useState(
    isEdit && task.description,
  )
  const [taskPriority, setTaskPriority] = useState(isEdit && task.priority)
  const [taskTimeLength, setTaskTimeLength] = useState(
    isEdit && task.timeLength,
  )
  const [disabled, setDisabled] = useState(true)
  const { currentUser } = useAuth()
  const { taskEditorToShow, setTaskEditorToShow } = useTaskEditorContextValue()
  const { isLight } = useThemeContextValue()
  const { tasks } = useTasks()
  const { sizes } = useResponsiveSizes()
  const { defaultProject } = selectedProject
  const { calendarsEvents, setCalendarsEvents, calendarsEventsFetched } =
    useCalendarsEventsValue()
  const textAreaRef = useRef(null)

  useAutosizeTextArea(textAreaRef.current, taskDescription)

  const getBoardStatus = () => {
    if (!projectIsList && column) {
      return column.id
    } else {
      return 'NOSECTION'
    }
  }

  const getMaxIndex = (tasks, boardStatus) => {
    const currentColumnTaskIds = tasks
      .filter((task) => task.boardStatus === boardStatus)
      .map((task) => task.index)
    if (currentColumnTaskIds.length === 0) {
      return -1
    } else {
      return Math.max(...currentColumnTaskIds)
    }
  }

  const addTaskToFirestore = async (event) => {
    event.preventDefault()
    const taskId = generatePushId()
    const boardStatus = getBoardStatus()

    let index = getMaxIndex(tasks, boardStatus) + 1
    // UPDATE TASK INDEX HERE (COMPLETED)

    resetForm()

    await addTask(
      currentUser && currentUser.id,
      project.selectedProjectId,
      startSchedule.date,
      endSchedule.date,
      taskName,
      taskId,
      boardStatus,
      defaultGroup,
      taskDescription,
      taskPriority,
      taskTimeLength,
      index,
    )
  }

  const resetForm = (event) => {
    event?.preventDefault()
    setProject({ ...selectedProject })
    isQuickAdd && closeOverlay()
    setTaskName('')
    setTaskDescription('')
    setTaskPriority(2)
    setTaskTimeLength(60)
    setStartSchedule({ day: '', date: '' })
    setEndSchedule({ day: '', date: '' })
    setTaskEditorToShow('')
  }

  const showAddTaskFormHandler = (event) => {
    resetForm(event)
    setTaskEditorToShow(column?.id || '')
    setShowAddTaskForm(!showAddTaskForm)
  }
  const handleChange = (e) => {
    e.target.value.length < 1 ? setDisabled(true) : setDisabled(false)
  }

  const getUpdatedCalendarsEvents = (taskId, newTitle, newDescription) => {
    const updatedCalendarsEvents = {}
    for (const key in calendarsEvents) {
      const calendarId = key
      const events = calendarsEvents[key]
      const updatedEvents = events.map((event) => {
        if (event.taskId === taskId) {
          event.setTitle(newTitle)
          event.setDescription(newDescription)
        }
        return event
      })
      updatedCalendarsEvents[calendarId] = updatedEvents
    }
    return updatedCalendarsEvents
  }

  const getCalendarIdsAndEventIdsWithTaskId = (taskId) => {
    const calendarIdsAndEventIds = {}
    for (const key in calendarsEvents) {
      const calendarId = key
      const events = calendarsEvents[key]
      const eventIds = events
        .filter((event) => event.taskId === taskId)
        .map((event) => {
          return {
            id: event.id,
            title: event.title,
            description: event.description,
          }
        })
      if (eventIds.length > 0) {
        calendarIdsAndEventIds[calendarId] = eventIds
      }
    }
    return calendarIdsAndEventIds
  }

  const updateTaskInFirestore = async (e) => {
    e.preventDefault()

    const taskId = task.taskId

    await updateTaskFromFields(
      currentUser && currentUser.id,
      taskId,
      task.projectId,
      task.boardStatus,
      task.index,
      projects,
      taskName,
      taskDescription,
      taskPriority,
      taskTimeLength,
      endSchedule.date,
      startSchedule.date,
      defaultGroup,
      task.projectId,
      project.selectedProjectName,
      project.selectedProjectId,
    )

    if (calendarsEventsFetched) {
      const calendarIdsAndEventIds = getCalendarIdsAndEventIdsWithTaskId(taskId)

      // UPDATE calendarsEvents FROM HERE
      const googleCalendarEventsUpdateDetails = []
      for (const calendarId in calendarIdsAndEventIds) {
        for (const { id, title, description } of calendarIdsAndEventIds[
          calendarId
        ]) {
          if (title !== taskName || description !== taskDescription) {
            const googleCalendarEventUpdateDetails = {
              id: id,
              calendarId: calendarId,
              summary: taskName,
              description: taskDescription,
            }
            googleCalendarEventsUpdateDetails.push(
              googleCalendarEventUpdateDetails,
            )
          }
        }
      }

      // update calendarsEvents with new title and description
      const updatedCalendarsEvents = getUpdatedCalendarsEvents(
        taskId,
        taskName,
        taskDescription,
      )
      setCalendarsEvents(updatedCalendarsEvents)

      updateGoogleCalendarEvents(
        currentUser && currentUser.id,
        googleCalendarEventsUpdateDetails,
      )
    }

    setTaskEditorToShow('')
    isPopup && closeOverlay()
  }

  useEffect(() => {
    if (defaultGroup || isQuickAdd) {
      setProject({
        selectedProjectId: '',
        selectedProjectName: 'Inbox',
        defaultProject,
      })
    } else {
      setProject({ ...selectedProject })
    }
    if (isEdit) {
      moment.defaultFormat = 'DD-MM-YYYY'
      setStartSchedule({
        day:
          task.startDate.length > 1
            ? moment(task.startDate, moment.defaultFormat).format('MMM DD')
            : '',
        date: task.startDate,
      })
      setEndSchedule({
        day:
          task.date.length > 1
            ? moment(task.date, moment.defaultFormat).format('MMM DD')
            : '',
        date: task.date,
      })
    }
    if (!taskPriority) {
      setTaskPriority(2)
    }
    if (!taskTimeLength && taskTimeLength !== 0) setTaskTimeLength(60)
  }, [defaultGroup])

  useEffect(() => {
    if (taskEditorToShow === 'NEW') {
      setShowAddTaskForm(true)
    }
  }, [taskEditorToShow])

  const splitTaskAttributes = () => {
    if (isPopup || isQuickAdd) {
      return sizes.smallPhone
    } else if (defaultGroup) {
      return sizes.smallPhone
    } else {
      return !projectIsList || sizes.smallPhone
    }
  }

  return (
    <div
      className={`add-task__wrapper ${isQuickAdd && 'quick-add__wrapper'}`}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {!showAddTaskForm ? (
        <div
          className='add-task__toggle'
          onClick={(event) => {
            event.stopPropagation()
            showAddTaskFormHandler(event)
          }}
        >
          <div className='add-task__icon'>
            <svg width='19' height='19' fill='none' strokeLinejoin='round'>
              <use xlinkHref={`${featherIcon}#plus`}></use>
            </svg>
          </div>
          <span>Create Task</span>
        </div>
      ) : (
        <></>
      )}
      {showAddTaskForm && (
        <form
          className='add-task'
          onSubmit={(event) =>
            isEdit ? updateTaskInFirestore(event) : addTaskToFirestore(event)
          }
          style={{ width: `${isQuickAdd ? '100%' : ''}` }}
        >
          <div
            className={`add-task__container${projectIsList ? '--list' : ''} ${
              isQuickAdd ? ' quick-add__container' : ''
            }`}
          >
            {/* Title Editor Section */}
            <input
              className={`add-task__input title${
                projectIsList ? '--list' : ''
              }`}
              value={taskName}
              onChange={(event) => {
                handleChange(event)
                setTaskName(event.target.value)
              }}
              required
              type='text'
              placeholder={'Some Title...'}
            />

            <textarea
              className='add-task__input textarea'
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              ref={textAreaRef}
              rows={1}
              type='text'
              placeholder='Some description...'
            />
            <div
              className='add-task__attributes'
              style={{ marginBottom: '10px' }}
            >
              <div className='add-task__attributes--left'>
                {defaultGroup !== 'Checklist' &&
                  defaultGroup !== 'Scheduled' && (
                    <SetNewTaskProject
                      isQuickAdd={isQuickAdd}
                      isPopup={isPopup}
                      project={project}
                      setProject={setProject}
                      task={task}
                    />
                  )}
              </div>
              <div className='add-task__attributes--right'></div>
            </div>

            {/* Start Date, End Date, Priority, and Time Length Editors Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: splitTaskAttributes() ? 'column' : 'row',
                marginBottom: '10px',
              }}
            >
              <div
                className='add-task__attributes'
                style={{
                  marginRight: splitTaskAttributes() ? '0px' : '6px',
                  marginBottom: splitTaskAttributes() ? '10px' : '0px',
                }}
              >
                <div className='add-task__attributes--left'>
                  <SetNewTaskSchedule
                    isQuickAdd={isQuickAdd}
                    isPopup={isPopup}
                    schedule={startSchedule}
                    setSchedule={setStartSchedule}
                    task={task}
                    defaultText='Start Date'
                  />
                  <SetNewTaskSchedule
                    isQuickAdd={isQuickAdd}
                    isPopup={isPopup}
                    schedule={endSchedule}
                    setSchedule={setEndSchedule}
                    task={task}
                    defaultText='Due Date'
                  />
                </div>
                <div className='add-task__attributes--right'></div>
              </div>

              <div className='add-task__attributes'>
                <div className='add-task__attributes--left'>
                  <SetNewTaskPriority
                    isQuickAdd={isQuickAdd}
                    isPopup={isPopup}
                    taskPriority={taskPriority}
                    setTaskPriority={setTaskPriority}
                    task={task}
                  />
                  <SetNewTaskTimeLength
                    isQuickAdd={isQuickAdd}
                    isPopup={isPopup}
                    taskTimeLength={taskTimeLength}
                    setTaskTimeLength={setTaskTimeLength}
                    task={task}
                  />
                </div>
                <div className='add-task__attributes--right'></div>
              </div>
            </div>
          </div>

          <div
            className={`add-task__actions ${
              isQuickAdd || isPopup ? 'quick-add__actions' : ''
            }`}
          >
            <button
              className=' action add-task__actions--add-task'
              type='submit'
              disabled={isEdit ? false : disabled}
            >
              {isEdit ? 'Save' : 'Create Task'}
            </button>
            <button
              className={` action  ${
                isLight ? 'action__cancel' : 'action__cancel--dark'
              }`}
              onClick={(event) => {
                if (isQuickAdd || isPopup) {
                  closeOverlay()
                } else {
                  showAddTaskFormHandler(event)
                }
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
