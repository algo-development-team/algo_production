import React, { useState, useRef, useEffect } from 'react'
import 'components/TaskEditor/styles/main.scss'
import 'components/TaskEditor/styles/light.scss'
import { useAutosizeTextArea } from 'hooks'
import { useCalendarsEventsValue } from 'context'
import { ReactComponent as CopyIcon } from 'assets/svg/copy.svg'
import { ReactComponent as DeleteIcon } from 'assets/svg/trash.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/x.svg'
import { ReactComponent as BacklogIcon } from 'assets/svg/backlog.svg'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './datepicker.scss'
import moment from 'moment'
import TimePicker from 'react-time-picker'

export const Block = ({
  closeOverlay,
  taskname,
  taskdescription,
  remove,
  copy,
  backlog,
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
    copy()
    closeOverlay()
  }

  const handleBacklog = () => {
    remove()
    backlog()
    closeOverlay()
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
                  <BacklogIcon
                    className='action-btn'
                    onClick={() => handleBacklog()}
                  />
                  <CopyIcon
                    className='action-btn'
                    onClick={() => handleCopy()}
                  />
                  <DeleteIcon
                    className='action-btn'
                    onClick={() => handleDelete()}
                  />
                  <CloseIcon
                    className='action-btn'
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
                    <button className=' action add-task__actions--add-task'>
                      Save
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
