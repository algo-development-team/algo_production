import React, { useState, useRef, useEffect } from 'react'
import 'components/TaskEditor/styles/main.scss'
import 'components/TaskEditor/styles/light.scss'
import { useAutosizeTextArea } from 'hooks'
import { useCalendarsEventsValue } from 'context'
import { ReactComponent as CopyIcon } from 'assets/svg/copy.svg'
import { ReactComponent as DeleteIcon } from 'assets/svg/trash.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/x.svg'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './datepicker.scss'
import moment from 'moment'
import { generatePushId } from 'utils'
import TimePicker from 'react-time-picker'

export const Block = ({
  closeOverlay,
  taskname,
  taskdescription,
  info,
  remove,
  start,
  end,
}) => {
  const [startSchedule, setStartSchedule] = useState({
    time: `${moment(start).format('HH:mm')}`,
  })
  const [endSchedule, setEndSchedule] = useState({
    time: `${moment(end).format('HH:mm')}`,
  })
  const [taskName, setTaskName] = useState(taskname)
  const [taskDescription, setTaskDescription] = useState(taskdescription)
  const { calendarsEvents, setCalendarsEvents } = useCalendarsEventsValue()
  const textAreaRef = useRef(null)
  const [startDate, setStartDate] = useState(start)
  const [endDate, setEndDate] = useState(end)

  function MyTimePicker() {
    const [time, setTime] = useState(`${moment(start).format('hh:mm A')}`)

    const onChange = (newTime) => {
      setTime(newTime)
    }
    return (
      <TimePicker
        onChange={onChange}
        value={time}
        disableClock={true}
        format='hh:mm A'
        step={900}
        use12Hours={true}
      />
    )
  }

  const StartDatePickerComponent = () => {
    return (
      <DatePicker
        className='my-datepicker'
        showIcon
        selected={startDate}
        dateFormat='dd/MM/yyyy'
        onChange={(date) => setStartDate(date)}
      />
    )
  }

  const EndDatePickerComponent = () => {
    return (
      <DatePicker
        className='my-datepicker'
        showIcon
        dateFormat='dd/MM/yyyy'
        selected={endDate}
        onChange={(date) => setEndDate(date)}
      />
    )
  }

  const startdate = () => {
    const startyear = moment(startDate).format('YYYY')
    const startmonth = moment(startDate).format('MM')
    const startday = moment(startDate).format('DD')
    const time12hr = `${startSchedule.time}`
    const starthour = moment(time12hr, 'h:mm A').format('HH')
    const startminute = moment(time12hr, 'h:mm A').format('mm')
    const starttimezone = moment(startDate).format('Z')
    const formattedDateTimeString = moment(startDate).format(
      '[GMT]ZZ [(Eastern Standard Time)]',
    )
    const startdate1 = `${startyear}-${startmonth}-${startday}`
    const startdate = moment(startdate1, 'YYYY-MM-DD').format('ddd MMM yyyy')
    const starttime = `${startdate} ${starthour}:${startminute}:00 ${starttimezone} ${formattedDateTimeString}`
    const datetimeString = `${starttime}`
    return datetimeString
  }

  const enddate = () => {
    const startyear = moment(endDate).format('YYYY')
    const startmonth = moment(endDate).format('MM')
    const startday = moment(endDate).format('DD')
    const time12hr = `${endSchedule.time}`
    const starthour = moment(time12hr, 'h:mm A').format('HH')
    const startminute = moment(time12hr, 'h:mm A').format('mm')
    const starttimezone = moment(endDate).format('Z')
    const formattedDateTimeString = moment(endDate).format(
      '[GMT]ZZ [(Eastern Standard Time)]',
    )
    const startdate1 = `${startyear}-${startmonth}-${startday}`
    const startdate = moment(startdate1, 'YYYY-MM-DD').format('ddd MMM yyyy')
    const starttime = `${startdate} ${starthour}:${startminute}:00 ${starttimezone} ${formattedDateTimeString}`
    const datetimeString = `${starttime}`
    return datetimeString
  }

  const handleDelete = () => {
    remove()
    closeOverlay()
  }

  const handleCopy = () => {
    info.jsEvent.preventDefault()
    const eventToCopy = info.event
    const copiedEvent = { ...eventToCopy }
    const newId = generatePushId()
    copiedEvent.id = newId
    setCalendarsEvents({
      ...calendarsEvents,
      custom: [...calendarsEvents.custom, copiedEvent],
    })
    // calendar.addEvent(copiedEvent);
    closeOverlay()
  }

  useEffect(() => {
    info.jsEvent.preventDefault()
    const star = startdate()
    const ende = enddate()
    info.event.setDates(startDate, endDate)
  }, [startDate, endDate])

  const task = {
    blocks: [],
    boardStatus: 'TODO',
    completed: false,
    date: '',
    deadlineType: 'HARD',
    description: 'Click + button to add new project.',
    eventIds: [],
    important: false,
    index: 0,
    isBlockedBy: [],
    name: 'Start your own project! 🚀',
    priority: 3,
    projectId: 'welcome',
    startDate: '',
    taskId: 'icebreaker_1',
    timeLength: 15,
  }

  useAutosizeTextArea(textAreaRef.current, taskDescription)

  return (
    <>
      <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
        <div
          className={`add-task__wrapper`}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          {
            <form className='add-task' style={{ maxWidth: '600px' }}>
              <div className={`add-task__container`}>
                <div>
                  <input
                    className={`add-task__input title`}
                    value={taskName}
                    onChange={(event) => {
                      setTaskName(event.target.value)
                    }}
                    style={{ maxWidth: '300px', minWidth: '300px' }}
                    required
                    type='text'
                    placeholder={`${taskname}`}
                  />
                  <CopyIcon
                    onClick={() => handleCopy()}
                    style={{
                      maxHeight: '25px',
                      maxWidth: '25px',
                      marginRight: '10px',
                    }}
                  />
                  <DeleteIcon
                    style={{
                      maxHeight: '25px',
                      maxWidth: '25px',
                      marginRight: '10px',
                    }}
                    onClick={() => handleDelete()}
                  />
                  <CloseIcon
                    style={{ maxHeight: '25px', maxWidth: '25px' }}
                    onClick={() => closeOverlay()}
                  />
                </div>
                <div>
                  <div
                    className='add-task__attributes--left'
                    style={{ marginLeft: '13px' }}
                  >
                    <StartDatePickerComponent />
                    <MyTimePicker />
                    <h3 style={{ marginRight: '10px', marginLeft: '4px' }}>
                      to
                    </h3>
                    <MyTimePicker />
                    <EndDatePickerComponent />
                  </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <textarea
                    className='add-task__input textarea'
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    ref={textAreaRef}
                    rows={1}
                    type='text'
                    placeholder={`${taskdescription}`}
                  />
                </div>

                {/* Start Date, End Date, Priority, and Time Length Editors Section */}
                <div
                  style={{
                    display: 'flex',
                    marginBottom: '10px',
                  }}
                >
                  <div className='add-task__attributes'>
                    <button
                      onClick={() => {
                        info.jsEvent.preventDefault()
                        console.log('info', info) // DEBUGGING
                      }}
                    >
                      Get Info
                    </button>
                  </div>
                </div>
              </div>
            </form>
          }
        </div>
      </div>
    </>
  )
}
