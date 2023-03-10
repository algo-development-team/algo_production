import { useThemeContextValue } from 'context'
import React, { useState, useRef } from 'react'
import { SetNewTaskSchedule } from 'components/TaskEditor/set-new-task-schedule.jsx'
import 'components/TaskEditor//styles/main.scss'
import 'components/TaskEditor//styles/light.scss'
import { useAutosizeTextArea} from 'hooks'
import { useCalendarsEventsValue } from 'context'


export const Block = ({ closeOverlay, taskname, taskdescription, info}) => {
    const [startSchedule, setStartSchedule] = useState({ day: '', date: '' })
    const [endSchedule, setEndSchedule] = useState({ day: '', date: '' })
    const [endtimeSchedule, setEndtimeSchedule] = useState({ hours: '', minutes: '' })
    const [starttimeSchedule, setStarttimeSchedule] = useState({ hours: '', minutes: '' })
    const [taskName, setTaskName] = useState(taskname)
    const [taskDescription, setTaskDescription] = useState(taskdescription)
    const { isLight } = useThemeContextValue()
    const { calendarsEvents, setCalendarsEvents } = useCalendarsEventsValue()
    const textAreaRef = useRef(null)
    const handleDelete = () => {
      console.log(info);
        info.jsEvent.preventDefault()
          // remove from state
          setCalendarsEvents({
            ...calendarsEvents,
            custom: calendarsEvents.custom.filter(
              (event) => event.id !== info.event.id,
            ),
          })
          console.log(calendarsEvents);
          // remove from calendar
          info.event.remove()
      }
    const task = {blocks: [],
        boardStatus:"TODO",
        completed:false,
        date:"",
        deadlineType:
        "HARD",
        description:"Click + button to add new project.",
        eventIds:[],
        important:false,
        index:0,
        isBlockedBy:[],
        name:"Start your own project! 🚀",
        priority:3,
        projectId:"welcome",
        startDate:"",
        taskId:"icebreaker_1",
        timeLength:15}
  
    useAutosizeTextArea(textAreaRef.current, taskDescription)
  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div className='quick-add-task__wrapper'>
      <div
      className={`add-task__wrapper`}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {(
        <form
          className='add-task'
          style={{ width: `${''}` }}
        >
          <div
            className={`add-task__container`}
          >
            {/* Title Editor Section */}
            <input
              className={`add-task__input title`}
              value={taskName}
              onChange={(event) => {
                setTaskName(event.target.value)
              }}
              required
              type='text'
              placeholder={`${taskname}`}
            />

            <textarea
              className='add-task__input textarea'
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              ref={textAreaRef}
              rows={1}
              type='text'
              placeholder={`${taskdescription}`}
            />
            <div
              className='add-task__attributes'
              style={{ marginBottom: '10px' }}
            >
             <button onClick ={ handleDelete }>Delete?</button>
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
                    isQuickAdd={false}
                    isPopup={true}
                    schedule={startSchedule}
                    setSchedule={setStartSchedule}
                    task={task}
                    defaultText='Start Date'
                  />
                  <SetNewTaskSchedule
                    isQuickAdd={false}
                    isPopup={true}
                    schedule={endSchedule}
                    setSchedule={setEndSchedule}
                    task={task}
                    defaultText='End Date'
                  />
                  <SetNewTaskSchedule
                    isQuickAdd={false}
                    isPopup={true}
                    schedule={starttimeSchedule}
                    setSchedule={setStarttimeSchedule}
                    task={task}
                    defaultText='Start Time'
                  />
                  <SetNewTaskSchedule
                    isQuickAdd={false}
                    isPopup={true}
                    schedule={endtimeSchedule}
                    setSchedule={setEndtimeSchedule}
                    task={task}
                    defaultText='End Time'
                  />
                </div>
                <div className='add-task__attributes--right'></div>
              </div>
            </div>

            

          <div
            className={`add-task__actions ${'quick-add__actions'}`}
          >
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
      </div>
    </div>
  )
}
