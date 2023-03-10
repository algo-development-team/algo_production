import { useThemeContextValue } from 'context'
import {
  useProjects,
  useSelectedProject,
} from 'hooks'
import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { SetNewTaskProject } from 'components/TaskEditor//set-new-task-project'
import { SetNewTaskSchedule } from 'components/TaskEditor/set-new-task-schedule.jsx'
import 'components/TaskEditor//styles/main.scss'
import 'components/TaskEditor//styles/light.scss'
import { useAutosizeTextArea} from 'hooks'

export const BlockEditor = ({
  column,
  isQuickAdd,
  isEdit,
  isPopup,
  task,
  closeOverlay,
}) => {
  const params = useParams()
  const [startSchedule, setStartSchedule] = useState({ day: '', date: '' })
  const [endSchedule, setEndSchedule] = useState({ day: '', date: '' })
  const { projects } = useProjects()
  const { selectedProject, defaultState } = useSelectedProject(params, projects)
  const { projectIsList } = selectedProject
  const [project, setProject] = useState(
    isQuickAdd ? defaultState : { ...selectedProject },
  )
  const [taskName, setTaskName] = useState(isEdit && task.name)
  const [taskDescription, setTaskDescription] = useState(
    isEdit && task.description,)
  const { isLight } = useThemeContextValue()
  const textAreaRef = useRef(null)

  useAutosizeTextArea(textAreaRef.current, taskDescription)

  /***
   * TODOS: (IMPLEMENT THESE LATER)
   * 1. Create a task dependency tree
   * 2. Filter out tasks that are already blocking the task recursively using the getChildNodeIds function from ../../handleArray
   * 3. Filter out tasks that the task is already blocking
   * ***/

  return (
    <div
      className={`add-task__wrapper ${isQuickAdd && 'quick-add__wrapper'}`}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {(isQuickAdd || isEdit ? true : false) && (
        <form
          className='add-task'
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
                {(
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
                marginBottom: '10px',
              }}
            >
              <div
                className='add-task__attributes'
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
            </div>

            

          <div
            className={`add-task__actions ${
              isQuickAdd || isPopup ? 'quick-add__actions' : ''
            }`}
          >
            <button
              className=' action add-task__actions--add-task'
              type='submit'
              disabled={isEdit ? false : true}
            >
              {isEdit ? 'Save' : 'Create Task'}
            </button>
            <button
              className={` action  ${
                isLight ? 'action__cancel' : 'action__cancel--dark'
              }`}
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
