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
import { SetNewTaskLinkedTasks } from './set-new-task-linked-tasks'
import { MenuButton } from './menu-button'
import {
  getTaskDocsInProjectColumnNotCompleted,
  check,
  addTask,
  updateTaskFromFields,
} from '../../backend/handleUserTasks'
import './styles/main.scss'
import './styles/light.scss'
import { useAutosizeTextArea, useChecklist } from 'hooks'
import { useResponsiveSizes } from 'hooks'
import { TaskSimpleView } from '../TaskSimpleView'
import { includesAny } from '../../handleArray'

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
  const [taskBlocks, setTaskBlocks] = useState(isEdit && task.blocks)
  const [taskIsBlockedBy, setTaskIsBlockedBy] = useState(
    isEdit && task.isBlockedBy,
  )
  const [showBlocksAdder, setShowBlocksAdder] = useState(false)
  const [showIsBlockedByAdder, setShowIsBlockedByAdder] = useState(false)
  const [blocksAdderPrompt, setBlocksAdderPrompt] = useState('')
  const [isBlockedByAdderPrompt, setIsBlockedByAdderPrompt] = useState('')
  const [blocksAdderTasks, setBlocksAdderTasks] = useState([])
  const [isBlockedByAdderTasks, setIsBlockedByAdderTasks] = useState([])
  const [linkedTaskBlocks, setLinkedTaskBlocks] = useState([])
  const [linkedTaskIsBlockedBy, setLinkedTaskIsBlockedBy] = useState([])
  const [removedTaskBlocks, setRemovedTaskBlocks] = useState([])
  const [removedTaskIsBlockedBy, setRemovedTaskIsBlockedBy] = useState([])
  const [disabled, setDisabled] = useState(true)
  const [tasksMap, setTasksMap] = useState({})
  const { currentUser } = useAuth()
  const { taskEditorToShow, setTaskEditorToShow } = useTaskEditorContextValue()
  const { isLight } = useThemeContextValue()
  const { tasks } = useTasks()
  const { scheduleCreated } = useScheduleCreated()
  const { checklist } = useChecklist()
  const { sizes } = useResponsiveSizes()
  const { defaultProject } = selectedProject
  const textAreaRef = useRef(null)
  useAutosizeTextArea(textAreaRef.current, taskDescription)

  /***
   * TODOS:
   * 1. Create a task dependency tree
   * 2. Filter out tasks that are already blocking the task recursively using the getChildNodeIds function from ../../handleArray
   * 3. Filter out tasks that the task is already blocking
   * 4. Prevent the task popup from closing when the user clicks on the Link button
   * 5. Show the linked tasks in the input as bubbles
   * 6. Fix the spacing between the buttons
   * After that, start working on the schedule prompt search bar
   * ***/

  useEffect(() => {
    if (tasks) {
      const tasksMap = {}
      tasks.forEach((task) => {
        tasksMap[task.taskId] = task
      })
      setTasksMap(tasksMap)
    }
  }, [tasks])

  useEffect(() => {
    if (task) {
      if (blocksAdderPrompt === '') {
        setBlocksAdderTasks(
          tasks.filter((projectTask) => projectTask.taskId !== task.taskId),
        )
        return
      }
      const newBlocksAdderTasks = tasks
        .filter((projectTask) => projectTask.taskId !== task.taskId)
        .filter((projectTask) =>
          includesAny(
            projectTask.name.toLowerCase(),
            blocksAdderPrompt
              .toLowerCase()
              .split(' ')
              .filter((substr) => substr !== ''),
          ),
        )
      setBlocksAdderTasks(newBlocksAdderTasks)
    } else {
      if (blocksAdderPrompt === '') {
        setBlocksAdderTasks(tasks)
        return
      }
      const newBlocksAdderTasks = tasks.filter((projectTask) =>
        includesAny(
          projectTask.name.toLowerCase(),
          blocksAdderPrompt
            .toLowerCase()
            .split(' ')
            .filter((substr) => substr !== ''),
        ),
      )
      setBlocksAdderTasks(newBlocksAdderTasks)
    }
  }, [blocksAdderPrompt, tasks, task])

  useEffect(() => {
    if (task) {
      if (isBlockedByAdderPrompt === '') {
        setIsBlockedByAdderTasks(
          tasks.filter((projectTask) => projectTask.taskId !== task.taskId),
        )
        return
      }
      const newIsBlockedByAdderTasks = tasks
        .filter((projectTask) => projectTask.taskId !== task.taskId)
        .filter((projectTask) =>
          includesAny(
            projectTask.name.toLowerCase(),
            isBlockedByAdderPrompt
              .toLowerCase()
              .split(' ')
              .filter((substr) => substr !== ''),
          ),
        )
      setIsBlockedByAdderTasks(newIsBlockedByAdderTasks)
    } else {
      if (isBlockedByAdderPrompt === '') {
        setIsBlockedByAdderTasks(tasks)
        return
      }
      const newIsBlockedByAdderTasks = tasks.filter((projectTask) =>
        includesAny(
          projectTask.name.toLowerCase(),
          isBlockedByAdderPrompt
            .toLowerCase()
            .split(' ')
            .filter((substr) => substr !== ''),
        ),
      )
      setIsBlockedByAdderTasks(newIsBlockedByAdderTasks)
    }
  }, [isBlockedByAdderPrompt, tasks, task])

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
      taskBlocks,
      taskIsBlockedBy,
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
    setTaskBlocks([])
    setTaskIsBlockedBy([])
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

  const handleRemoveBlocks = (taskId) => {
    setRemovedTaskBlocks([...removedTaskBlocks, taskId])
    setTaskBlocks(taskBlocks.filter((block) => block !== taskId))
  }

  const handleRemoveIsBlockedBy = (taskId) => {
    setRemovedTaskIsBlockedBy([...removedTaskIsBlockedBy, taskId])
    setTaskIsBlockedBy(taskIsBlockedBy.filter((block) => block !== taskId))
  }

  const updateTaskInFirestore = async (e) => {
    e.preventDefault()
    await updateTaskFromFields(
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
      taskBlocks,
      taskIsBlockedBy,
      linkedTaskBlocks.map((linkedTask) => linkedTask.taskId),
      linkedTaskIsBlockedBy.map((linkedTask) => linkedTask.taskId),
      removedTaskBlocks,
      removedTaskIsBlockedBy,
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
    if (!taskDeadlineType) {
      setTaskDeadlineType('HARD')
    }
    if (!taskBlocks) {
      setTaskBlocks([])
    }
    if (!taskIsBlockedBy) {
      setTaskIsBlockedBy([])
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
                <MenuButton
                  type='BLOCKS'
                  value={showBlocksAdder}
                  setValue={setShowBlocksAdder}
                />
                <MenuButton
                  type='IS_BLOCKED_BY'
                  value={showIsBlockedByAdder}
                  setValue={setShowIsBlockedByAdder}
                />
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
            <div>
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

            {/* Blocks Editor Section */}
            {(includesAny(Object.keys(tasksMap), taskBlocks) ||
              showBlocksAdder) && <h5>Blocks</h5>}
            {taskBlocks.map((taskId) => {
              if (tasksMap[taskId]) {
                return (
                  <TaskSimpleView
                    task={tasksMap[taskId]}
                    handleClose={() => handleRemoveBlocks(taskId)}
                  />
                )
              } else {
                return null
              }
            })}

            <div style={{ marginBottom: '10px' }}>
              <div className='add-task__attributes'>
                <div className='add-task__attributes--left'>
                  {showBlocksAdder && (
                    <SetNewTaskLinkedTasks
                      isQuickAdd={isQuickAdd}
                      isPopup={isPopup}
                      prompt={blocksAdderPrompt}
                      setPrompt={setBlocksAdderPrompt}
                      linkedTasks={linkedTaskBlocks}
                      setLinkedTasks={setLinkedTaskBlocks}
                      tasks={blocksAdderTasks}
                      task={task}
                    />
                  )}
                </div>
                <div className='add-task__attributes--right'></div>
              </div>
            </div>

            <div>
              <div className='add-task__attributes'>
                <div className='add-task__attributes--left'>
                  {showBlocksAdder && (
                    <>
                      <button
                        // className=' action add-task__actions--add-task'
                        className={` action  ${
                          isLight ? 'action__cancel' : 'action__cancel--dark'
                        }`}
                        onClick={() => {
                          const newTaskBlocks = [
                            ...taskBlocks,
                            ...linkedTaskBlocks.map(
                              (linkedTask) => linkedTask.taskId,
                            ),
                          ]
                          setTaskBlocks(newTaskBlocks)
                        }}
                      >
                        Link
                      </button>
                      <button
                        className={` action  ${
                          isLight ? 'action__cancel' : 'action__cancel--dark'
                        }`}
                        onClick={() => {
                          setShowBlocksAdder(false)
                          setBlocksAdderPrompt('')
                          setLinkedTaskBlocks([])
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                <div className='add-task__attributes--right'></div>
              </div>
            </div>

            {/* Is Blocked By Editor Section */}
            {(includesAny(Object.keys(tasksMap), taskIsBlockedBy) ||
              showIsBlockedByAdder) && <h5>Is Blocked By</h5>}
            {taskIsBlockedBy.map((taskId) => {
              if (tasksMap[taskId]) {
                return (
                  <TaskSimpleView
                    task={tasksMap[taskId]}
                    handleClose={() => handleRemoveIsBlockedBy(taskId)}
                  />
                )
              } else {
                return null
              }
            })}

            <div style={{ marginBottom: '10px' }}>
              <div className='add-task__attributes'>
                <div className='add-task__attributes--left'>
                  {showIsBlockedByAdder && (
                    <SetNewTaskLinkedTasks
                      isQuickAdd={isQuickAdd}
                      isPopup={isPopup}
                      prompt={isBlockedByAdderPrompt}
                      setPrompt={setIsBlockedByAdderPrompt}
                      linkedTasks={linkedTaskIsBlockedBy}
                      setLinkedTasks={setLinkedTaskIsBlockedBy}
                      tasks={isBlockedByAdderTasks}
                      task={task}
                    />
                  )}
                </div>
                <div className='add-task__attributes--right'></div>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div className='add-task__attributes'>
                <div className='add-task__attributes--left'>
                  {showIsBlockedByAdder && (
                    <>
                      <button
                        className=' action add-task__actions--add-task'
                        onClick={() => {
                          const newTaskIsBlockedBy = [
                            ...taskIsBlockedBy,
                            ...linkedTaskIsBlockedBy.map(
                              (linkedTask) => linkedTask.taskId,
                            ),
                          ]
                          setTaskIsBlockedBy(newTaskIsBlockedBy)
                        }}
                      >
                        Link
                      </button>
                      <button
                        className={` action  ${
                          isLight ? 'action__cancel' : 'action__cancel--dark'
                        }`}
                        onClick={() => {
                          setShowIsBlockedByAdder(false)
                          setIsBlockedByAdderPrompt('')
                          setLinkedTaskIsBlockedBy([])
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
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
