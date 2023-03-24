import React, { useState, useRef, useEffect } from 'react'
import 'components/TaskEditor/styles/main.scss'
import 'components/TaskEditor/styles/light.scss'
import { useAutosizeTextArea } from 'hooks'
import { ReactComponent as CopyIcon } from 'assets/svg/copy.svg'
import { ReactComponent as DeleteIcon } from 'assets/svg/trash.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/x.svg'
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg'
import { ReactComponent as BacklogIcon } from 'assets/svg/backlog.svg'
import { MyDatePicker } from './block/my-date-picker'
import { MyTimePicker } from './block/my-time-picker'
import { useResponsiveSizes } from 'hooks'
import { SetProjectColourDropdown } from './ProjectEditor/set-project-colour'
import { GoogleEventColours } from 'handleColorPalette'
import { cropLabel } from 'handleLabel'
import { isValidEmail } from 'handleEmail'
import { ReactComponent as GoogleCalendarIcon } from 'assets/svg/google-calendar.svg'

export const Block = ({
  closeOverlay,
  allDay,
  taskname,
  taskdescription,
  taskbackgroundcolor,
  location,
  meetLink,
  attendees,
  start,
  end,
  remove,
  copy,
  backlog,
  save,
}) => {
  const [taskName, setTaskName] = useState(taskname)
  const [taskDescription, setTaskDescription] = useState(taskdescription)
  const [startDate, setStartDate] = useState(start)
  const [endDate, setEndDate] = useState(end)
  const textAreaRef = useRef(null)
  const { sizes } = useResponsiveSizes()
  const [eventColour, setEventColour] = useState({
    name:
      GoogleEventColours.find(
        (GoogleEventColour) => GoogleEventColour.hex === taskbackgroundcolor,
      )?.name || 'Undefined',
    hex: taskbackgroundcolor,
  })
  const [showSelectColourDropdown, setShowSelectColourDropdown] =
    useState(false)
  const [selectedColour, setSelectedColour] = useState(eventColour)
  const [eventLocation, setEventLocation] = useState(location)
  const [eventMeetLink, setEventMeetLink] = useState(meetLink)
  const [eventAttendees, setEventAttendees] = useState(attendees)
  const [newEventAttendee, setNewEventAttendee] = useState('')

  useEffect(() => {
    setSelectedColour(eventColour)

    return () => {
      setSelectedColour(null)
    }
  }, [eventColour])

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

  const handleSave = () => {
    save(taskName, taskDescription, startDate, endDate, eventColour.hex)
    closeOverlay()
  }

  useAutosizeTextArea(textAreaRef.current, taskDescription)

  const titleAndOptions = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'inline-block' }}>
          <input
            className='add-task__input title'
            value={taskName}
            onChange={(event) => {
              setTaskName(event.target.value)
            }}
            required
            type='text'
            placeholder={`${taskname}`}
          />
        </div>
        <div style={{ display: 'inline-block', textAlign: 'right' }}>
          <BacklogIcon className='action-btn' onClick={() => handleBacklog()} />
          <CopyIcon className='action-btn' onClick={() => handleCopy()} />
          <DeleteIcon className='action-btn' onClick={() => handleDelete()} />
          <CloseIcon className='action-btn' onClick={() => closeOverlay()} />
        </div>
      </div>
    )
  }

  const dateAndTimePickers = () => {
    if (sizes.phone) {
      return (
        <div className='add-project__form-group' role='button'>
          <label>Time</label>
          <div className='add-task__attributes--left'>
            <MyDatePicker date={startDate} setDate={setStartDate} />
            <MyTimePicker time={startDate} setTime={setStartDate} />
          </div>
          <div className='add-task__attributes--left'>
            <MyDatePicker date={endDate} setDate={setEndDate} />
            <MyTimePicker time={endDate} setTime={setEndDate} />
          </div>
        </div>
      )
    } else {
      return (
        <div className='add-project__form-group' role='button'>
          <label>Time</label>
          <div className='add-task__attributes--left'>
            <MyDatePicker date={startDate} setDate={setStartDate} />
            <MyTimePicker time={startDate} setTime={setStartDate} />
            <h3 style={{ marginRight: '7px', marginLeft: '7px' }}>to</h3>
            <MyDatePicker date={endDate} setDate={setEndDate} />
            <MyTimePicker time={endDate} setTime={setEndDate} />
          </div>
        </div>
      )
    }
  }

  const googleMeetEditor = () => {
    return (
      <div className='add-project__form-group' role='button'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            columnGap: '10px',
          }}
        >
          <div style={{ display: 'inline-block' }}>
            <label>Google Meet</label>
            {eventMeetLink !== '' ? (
              <div className='google-meet-join-button'>
                <GoogleCalendarIcon strokeWidth='.1' height={24} width={24} />
                <a href={eventMeetLink} target='_blank' rel='noreferrer'>
                  Join Google Meet
                </a>
                <CloseIcon
                  height={12}
                  width={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEventMeetLink('')
                  }}
                />
              </div>
            ) : (
              <div className='google-meet-schedule-button'>
                <GoogleCalendarIcon strokeWidth='.1' height={24} width={24} />
                <p>Add Google Meet</p>
              </div>
            )}
          </div>
          {eventMeetLink !== '' && (
            <div style={{ display: 'inline-block' }}>
              <label>Attendees</label>
              {eventAttendees.map((eventAttendee, i) => {
                return (
                  <div className='attendee-icon'>
                    <span>{cropLabel(eventAttendee, 30)}</span>
                    <CloseIcon
                      height={12}
                      width={12}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const newAttendees = [...eventAttendees]
                        newAttendees.splice(i, 1)
                        setEventAttendees(newAttendees)
                      }}
                    />
                  </div>
                )
              })}
              <div style={{ display: 'flex' }}>
                <input
                  className='add-task__input--no-bottom-margin'
                  type='text'
                  placeholder='Add attendee email'
                  value={newEventAttendee}
                  onChange={(e) => {
                    setNewEventAttendee(e.target.value)
                  }}
                />
                <PlusIcon
                  onClick={(e) => {
                    e.preventDefault()
                    if (
                      !eventAttendees.includes(newEventAttendee) &&
                      isValidEmail(newEventAttendee)
                    ) {
                      const newAttendees = [...eventAttendees]
                      newAttendees.push(newEventAttendee)
                      setEventAttendees(newAttendees)
                    }
                    setNewEventAttendee('')
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const locationEditor = () => {
    return (
      <div className='add-project__form-group' role='button'>
        <label>Location</label>
        <input
          className='add-task__input'
          value={eventLocation}
          onChange={(event) => {
            setEventLocation(event.target.value)
          }}
          type='text'
          placeholder='Add location'
        />
      </div>
    )
  }

  const eventColorSelector = () => {
    return (
      <div>
        <div className='add-project__form-group' role='button'>
          <label>Color</label>
          <div
            className='add-project__select-color'
            onClick={() =>
              setShowSelectColourDropdown(!showSelectColourDropdown)
            }
          >
            <span
              className='add-project__selected-color'
              style={{ backgroundColor: `${selectedColour.hex}` }}
            />
            <span className='add-project__selected-color-name'>
              {selectedColour.name}
            </span>
            {showSelectColourDropdown && (
              <SetProjectColourDropdown
                setProjectColour={setEventColour}
                projectColour={eventColour}
                showSelectColourDropdown={showSelectColourDropdown}
                setShowSelectColourDropdown={setShowSelectColourDropdown}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  const descriptionEditor = () => {
    return (
      <div style={{ marginTop: '20px' }}>
        <textarea
          className='add-task__input textarea'
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          ref={textAreaRef}
          rows={1}
          type='text'
          placeholder='Write something...'
        />
      </div>
    )
  }

  return (
    <>
      <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
        <div
          className='event__wrapper'
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <div className='add-task__wrapper'>
            {
              <form className='add-task'>
                <div className={`add-task__container`}>
                  {titleAndOptions()}
                  {!allDay && dateAndTimePickers()}
                  {googleMeetEditor()}
                  {locationEditor()}
                  {eventColorSelector()}
                  {descriptionEditor()}
                  <div
                    style={{
                      display: 'flex',
                      marginBottom: '10px',
                    }}
                  >
                    <div className='add-task__attributes'>
                      <button
                        className=' action add-task__actions--add-task'
                        onClick={() => handleSave()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </>
  )
}
