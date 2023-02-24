import featherIcon from 'assets/svg/feather-sprite.svg'
import { useThemeContextValue } from 'context'
import { useTaskEditorContextValue } from 'context/board-task-editor-context'
import {
  useAuth,
  useProjects,
  useScheduleCreated,
  useSelectedProject,
  useTasks,
} from 'hooks'
import moment from 'moment'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { generatePushId } from 'utils'
import { SetNewTaskProject } from './set-new-task-project'
import { SetNewTaskSchedule } from './set-new-task-schedule'
import { SetNewTaskPriority } from './set-new-task-priority'
import { SetNewTaskTimeLength } from './set-new-task-time-length'
import { SetNewTaskDeadlineType } from './set-new-task-deadline-type'
import { MenuButton } from './menu-button'
import {
  getTaskDocsInProjectColumnNotCompleted,
  check,
  addTask,
  updateFireStore,
} from '../../backend/handleUserTasks'
import './styles/main.scss'
import './styles/light.scss'
import { useAutosizeTextArea, useChecklist } from 'hooks'
import { useResponsiveSizes } from 'hooks'

export const TaskEditor = ({
  column,
  isQuickAdd,
  isEdit,
  isPopup,
  task,
  closeOverlay,
}) => {
  const params = useParams()
  const { defaultGroup, projectId } = params
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
  const [taskDeadlineType, setTaskDeadlineType] = useState(
    isEdit && task.deadlineType,
  )
  const [disabled, setDisabled] = useState(true)
  const { currentUser } = useAuth()
  const { taskEditorToShow, setTaskEditorToShow } = useTaskEditorContextValue()
  const { isLight } = useThemeContextValue()
  const { tasks } = useTasks()
  const { scheduleCreated } = useScheduleCreated()
  const { checklist } = useChecklist()
  const { sizes } = useResponsiveSizes()
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

    let index = 0
    if (defaultGroup === 'Checklist') {
      await check(checklist, currentUser && currentUser.id, taskId)
    } else if (defaultGroup === 'Scheduled') {
      const inboxTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
        currentUser && currentUser.id,
        '',
        'NOSECTION',
      )
      const newProjectTasks = []
      inboxTaskDocs.forEach((taskDoc) => {
        newProjectTasks.push(taskDoc.data())
      })

      if (newProjectTasks.length > 0) {
        const maxIndex = Math.max(...newProjectTasks.map((task) => task.index))
        index = maxIndex + 1
      }
    } else {
      index = getMaxIndex(tasks, boardStatus) + 1
    }
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
      taskDeadlineType,
      index,
      scheduleCreated,
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
    /*The default day is 'Today' only for the Scheduled*/
    if (defaultGroup === 'Scheduled') {
      setEndSchedule({ day: 'Today', date: moment().format('DD-MM-YYYY') })
    } else {
      setEndSchedule({ day: '', date: '' })
    }
    setTaskDeadlineType('HARD')
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

  const updateTaskInFirestore = async (e) => {
    e.preventDefault()
    await updateFireStore(
      currentUser && currentUser.id,
      task.taskId,
      task.projectId,
      task.boardStatus,
      task.index,
      projects,
      taskName,
      taskDescription,
      taskPriority,
      taskTimeLength,
      taskDeadlineType,
      scheduleCreated,
      endSchedule.date,
      startSchedule.date,
      defaultGroup,
      task.projectId,
      project.selectedProjectName,
      project.selectedProjectId,
    )
    setTaskEditorToShow('')
    isPopup && closeOverlay()
  }

  const { defaultProject } = selectedProject

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
    } else {
      setTaskPriority(taskPriority)
    }
    if (!taskTimeLength && taskTimeLength !== 0) setTaskTimeLength(60)
    if (!taskDeadlineType) {
      setTaskDeadlineType('HARD')
    } else {
      setTaskDeadlineType(taskDeadlineType)
    }
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

            {/* Menu Buttons Section */}
            <div
              className='add-task__attributes'
              style={{ marginBottom: '10px' }}
            >
              <div className='add-task__attributes--left'>
                {defaultGroup !== 'Checklist' &&
                  defaultGroup !== 'Scheduled' && (
                    <MenuButton type='LINK_TASKS' />
                  )}
              </div>
              <div className='add-task__attributes--right'></div>
            </div>

            {/* Description Editor Section */}
            <textarea
              className='add-task__input textarea'
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              ref={textAreaRef}
              rows={1}
              type='text'
              placeholder='Some description...'
            />

            {/* Project Editor Section */}
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

            {/* Deadline Type Editor Section */}
            <div style={{ marginBottom: '10px' }}>
              <div className='add-task__attributes'>
                <div className='add-task__attributes--left'>
                  {endSchedule.date !== '' && (
                    <SetNewTaskDeadlineType
                      isQuickAdd={isQuickAdd}
                      isPopup={isPopup}
                      taskDeadlineType={taskDeadlineType}
                      setTaskDeadlineType={setTaskDeadlineType}
                      task={task}
                    />
                  )}
                </div>
                <div className='add-task__attributes--right'></div>
              </div>
            </div>

            {/* Link Tasks Editor Section */}
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
