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
import { SetNewTaskProject } from 'components/TaskEditor/set-new-task-project'
import { getTaskDocsInProjectColumnNotCompleted, check, addTask, updateFireStore } from '../../backend/handleTasks'
import 'components/TaskEditor/styles/main.scss'
import 'components/TaskEditor/styles/light.scss'
import { useAutosizeTextArea, useChecklist } from 'hooks'
import useScreenType from 'react-screentype-hook'

export const TeamPage = ({
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
  const { currentUser } = useAuth()
  const [disabled, setDisabled] = useState(true)
  const { taskEditorToShow, setTaskEditorToShow } = useTaskEditorContextValue()
  const { isLight } = useThemeContextValue()
  const { tasks } = useTasks()
  const { scheduleCreated } = useScheduleCreated()
  const { checklist } = useChecklist()
  const screenType = useScreenType()
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

    await addTask(currentUser && currentUser.id, project.selectedProjectId, startSchedule.date, endSchedule.date, taskName, taskId,
      boardStatus, defaultGroup, taskDescription, taskPriority, taskTimeLength, index, scheduleCreated)
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
    await updateFireStore(currentUser && currentUser.id, task.taskId, task.projectId, task.boardStatus, task.index, projects, taskName, 
                          taskDescription, taskPriority, taskTimeLength, scheduleCreated, endSchedule.date, startSchedule.date, 
                          defaultGroup, task.projectId, project.selectedProjectName, project.selectedProjectId)
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
  }, [defaultGroup])

  useEffect(() => {
    if (taskEditorToShow === 'NEW') {
      setShowAddTaskForm(true)
    }
  }, [taskEditorToShow])

  const splitTaskAttributes = () => {
    if (isPopup || isQuickAdd) {
      return screenType.isMobile
    } else if (defaultGroup) {
      return screenType.isMobile
    } else {
      return !projectIsList || screenType.isMobile
    }
  }

  return (
    <div
      className={`add-task__wrapper ${isQuickAdd && 'quick-add__wrapper'}`}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      { (
        <form
          className='add-task'
          onSubmit={(event) =>
            isEdit ? updateTaskInFirestore(event) : addTaskToFirestore(event)
          }
          style={{ width: "700px", marginLeft: "60px", marginTop: "50px" }}

          // change width here
        >
            <div
            className={`add-task__container${projectIsList ? '--list' : ''} ${
              isQuickAdd ? ' quick-add__container' : ''
            }`}
          >

            <textarea
              className='add-task__input textarea'
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              ref={textAreaRef}
              rows={1}
              type='text'
              placeholder='Some title...'
              style = {{height:"30px", margin: "11px 0px 0px 0px"}}

              // change height here
            />
            <div
              style={{
                display: 'flex',
                flexDirection: splitTaskAttributes() ? 'column' : 'row',
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
                </div>
              </div>
            </div>
          </div>
          <div
            className={`add-task__container${projectIsList ? '--list' : ''} ${
              isQuickAdd ? ' quick-add__container' : ''
            }`}
          >

            <textarea
              className='add-task__input textarea'
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              ref={textAreaRef}
              rows={1}
              type='text'
              placeholder='Some description...'
              style = {{height:"100px", margin: "5px 0px 0px 0px", paddingTop: "7.5px"}}

            // change height here

            />
            <div
              style={{
                display: 'flex',
                flexDirection: splitTaskAttributes() ? 'column' : 'row',
              }}
            >
              <div
                className='add-task__attributes'
                style={{
                  marginRight: splitTaskAttributes() ? '0px' : '6px',
                  marginBottom: splitTaskAttributes() ? '10px' : '0px',
                }}
              >
              </div>
            </div>
          </div>
          <div
            className={`add-task__actions ${
              isQuickAdd || isPopup ? 'quick-add__actions' : ''
            }`}
          >
            <div>
            <button className = 'work-day-btn__selected' style = {{height:"80px", width:"80px"}}>hi</button>
            <button className = 'work-day-btn__selected' style = {{height:"80px", width:"80px"}}>hi</button>
            <button className = 'work-day-btn__selected' style = {{height:"80px", width:"80px"}}>hi</button>
            <button className = 'work-day-btn__selected' style = {{height:"80px", width:"80px"}}>+</button>
            </div>
            <div>
            <button className = 'work-day-btn__selected' style = {{marginTop:"15px",height:"80px", width:"80px", borderRadius:"10px"}}>hi</button>
            <button className = 'work-day-btn__selected' style = {{marginTop:"15px",height:"80px", width:"80px", borderRadius:"10px"}}>hi</button>
            <button className = 'work-day-btn__selected' style = {{marginTop:"15px",height:"80px", width:"80px", borderRadius:"10px"}}>hi</button>
            <button className = 'work-day-btn__selected' style = {{marginTop:"15px",height:"80px", width:"80px", borderRadius:"10px"}}>+</button>
            </div>
            <div>
            <button
              className=' action add-task__actions--add-task'
              type='submit'
              disabled={isEdit ? false : disabled}
              style={{marginTop: "15px"}}
            >
              {isEdit ? 'Save' : 'Create Team'}
            </button>
            <button
            style={{marginTop: "15px"}}
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
          </div>
        </form>
      )}

      
    </div>
    
  )
}


// mobile view also required