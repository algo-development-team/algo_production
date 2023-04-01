import React, { useState, useRef, useEffect } from 'react'
import 'components/TaskEditor/styles/main.scss'
import 'components/TaskEditor/styles/light.scss'
import { useAutosizeTextArea } from 'hooks'
import { ReactComponent as CopyIcon } from 'assets/svg/copy.svg'
import { ReactComponent as DeleteIcon } from 'assets/svg/trash.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/x.svg'
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg'
import { ReactComponent as BacklogIcon } from 'assets/svg/backlog.svg'
import { ReactComponent as CheckCircleIcon } from 'assets/svg/check-circle.svg'
import { ReactComponent as RemoveCircleIcon } from 'assets/svg/remove-circle.svg'
import { ReactComponent as QuestionCircleIcon } from 'assets/svg/question-circle.svg'
import { SetProjectColourDropdown } from './ProjectEditor/set-project-colour'
import { GoogleEventColours } from 'handleColorPalette'
import { cropLabel } from 'handleLabel'
import { isValidEmail } from 'handleEmail'
import { ReactComponent as GoogleMeetIcon } from 'assets/svg/google-meet-logo.svg'
import { ReactComponent as ZoomIcon } from 'assets/svg/zoom-logo.svg'
import { RRule } from 'rrule'
import { createGoogleMeet, deleteGoogleMeet } from '../../google'
import { useAuth } from 'hooks'
import moment from 'moment'

const defaultRecurrenceFieldValues = {
  repeatEvery: 1,
  frequency: 'WEEKLY',
  repeatOn: [], // set this to be the current day of the week
  ends: 'NEVER',
  endsOn: new Date(), // set this to be two months later than the current date
  endsAfter: 1,
}

export const Block = ({
  closeOverlay,
  taskname,
  taskdescription,
  taskbackgroundcolor,
  location,
  meetLink,
  attendees,
  rruleStr,
  eventId,
  calendarId,
  remove,
  copy,
  backlog,
  save,
}) => {
  const [taskName, setTaskName] = useState(taskname)
  const [taskDescription, setTaskDescription] = useState(taskdescription)
  const textAreaRef = useRef(null)
  const { currentUser } = useAuth()
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
  const [currentUserResponseStatus, setCurrentUserResponseStatus] =
    useState('needsAction')
  const [recurringEventEditType, setRecurringEventEditType] = useState('')
  const [recurringEventEditOption, setRecurringEventEditOption] =
    useState('THIS_EVENT')
  const [recurringEventOptionsType, setRecurringEventOptionsType] = useState('')
  const [recurrenceFieldValues, setRecurrenceFieldValues] = useState(
    defaultRecurrenceFieldValues,
  ) // if the event is recurring, this will be the values of the recurrence fields
  const [dtstart, setDtstart] = useState(null) // moment.js object
  const [rrule, setRRule] = useState(null) // RRule object

  useEffect(() => {
    if (rruleStr !== '') {
      const rruleStrObj = destructRRuleStr(rruleStr)
      const dtstart = moment(rruleStrObj.dtstart.split(':')[1])
      const rrule = RRule.fromString(rruleStrObj.rrule)
      setDtstart(dtstart)
      setRRule(rrule)
    }
  }, [rruleStr])

  useEffect(() => {
    for (const eventAttendee of eventAttendees) {
      if (eventAttendee?.self) {
        setCurrentUserResponseStatus(eventAttendee.responseStatus)
        break
      }
    }
  }, [eventAttendees])

  const destructRRuleStr = (rruleStr) => {
    const rruleStrArr = rruleStr.split('\n')
    const rruleStrObj = {
      dtstart: rruleStrArr[0],
      rrule: rruleStrArr[1],
      exdates: rruleStrArr.slice(2),
    }
    return rruleStrObj
  }

  const getUpdatedEventAttendees = () => {
    const updatedEventAttendees = [...eventAttendees]

    for (const updatedEventAttendee of updatedEventAttendees) {
      if (updatedEventAttendee?.self) {
        updatedEventAttendee.responseStatus = currentUserResponseStatus
        break
      }
    }

    return updatedEventAttendees
  }

  const isUserMeetingOrganizer = () => {
    if (!eventAttendees.some((eventAttendee) => eventAttendee?.self)) {
      return true
    } else {
      return eventAttendees.find((eventAttendee) => eventAttendee?.self)
        ?.organizer
    }
  }

  useEffect(() => {
    setSelectedColour(eventColour)

    return () => {
      setSelectedColour(null)
    }
  }, [eventColour])

  const handleDelete = () => {
    remove(recurringEventEditOption)
    closeOverlay()
  }

  const handleCopy = () => {
    copy()
    closeOverlay()
  }

  const handleBacklog = () => {
    remove(recurringEventEditOption)
    backlog()
    closeOverlay()
  }

  const handleSave = () => {
    save(
      taskName,
      taskDescription,
      eventColour.hex,
      eventLocation,
      eventMeetLink,
      getUpdatedEventAttendees(),
    )
    closeOverlay()
  }

  const handleAddMeetings = async () => {
    const newEventMeetLink = await createGoogleMeet(
      currentUser && currentUser.id,
      calendarId,
      eventId,
    )
    setEventMeetLink(newEventMeetLink)
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
          <BacklogIcon
            className='action-btn'
            onClick={() => {
              if (rruleStr === '') {
                handleBacklog()
              } else {
                setRecurringEventEditType('BACKLOG')
              }
            }}
          />
          <CopyIcon className='action-btn' onClick={() => handleCopy()} />
          <DeleteIcon
            className='action-btn'
            onClick={() => {
              if (rruleStr === '') {
                handleDelete()
              } else {
                setRecurringEventEditType('DELETE')
              }
            }}
          />
          <CloseIcon className='action-btn' onClick={() => closeOverlay()} />
        </div>
      </div>
    )
  }

  const recurringOptions = () => {
    return (
      <div style={{ marginBottom: '10px' }}>
        <button
          className='recurring-options-button'
          onClick={(e) => {
            e.preventDefault()
            setRecurringEventOptionsType('EDIT')
          }}
        >
          Recurring Options
        </button>
      </div>
    )
  }

  const getAcceptButtonStyle = () => {
    if (currentUserResponseStatus === 'accepted') {
      return { backgroundColor: GoogleEventColours[6].hex }
    } else {
      return {}
    }
  }

  const getDeclineButtonStyle = () => {
    if (currentUserResponseStatus === 'declined') {
      return { backgroundColor: GoogleEventColours[6].hex }
    } else {
      return {}
    }
  }

  const meetingUserResponseStatusButtons = () => {
    if (!eventAttendees.some((eventAttendee) => eventAttendee?.self))
      return null
    return (
      <div style={{ display: 'flex', marginTop: '10px', gap: '10px' }}>
        <button
          onClick={(e) => {
            e.preventDefault()
            setCurrentUserResponseStatus('accepted')
          }}
          style={getAcceptButtonStyle()}
          className='attendee-icon'
        >
          Yes
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            setCurrentUserResponseStatus('declined')
          }}
          style={getDeclineButtonStyle()}
          className='attendee-icon'
        >
          No
        </button>
      </div>
    )
  }

  const getMeetingIcon = (url) => {
    if (url.includes('meet.google.com')) {
      return <GoogleMeetIcon strokeWidth='.1' height={24} width={24} />
    } else if (url.includes('zoom.us')) {
      return <ZoomIcon strokeWidth='.1' height={24} width={24} />
    } else {
      return null
    }
  }

  const getJoinButtonText = (url) => {
    if (url.includes('meet.google.com')) {
      return 'Join Google Meet'
    } else if (url.includes('zoom.us')) {
      return 'Join Zoom Meeting'
    } else {
      return 'Join Meeting'
    }
  }

  const getResponseStatusIcon = (responseStatus) => {
    if (responseStatus === 'accepted') {
      return (
        <CheckCircleIcon
          height={16}
          width={16}
          fill={GoogleEventColours[1].hex}
        />
      )
    } else if (responseStatus === 'declined') {
      return (
        <RemoveCircleIcon
          height={16}
          width={16}
          fill={GoogleEventColours[10].hex}
        />
      )
    } else {
      return (
        <QuestionCircleIcon
          height={16}
          width={16}
          fill={GoogleEventColours[4].hex}
        />
      )
    }
  }

  const meetingEditor = () => {
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
            <label>Meeting</label>
            {eventMeetLink !== '' ? (
              <div>
                <div
                  className='google-meet-join-button'
                  style={{ cursor: 'pointer' }}
                >
                  {getMeetingIcon(eventMeetLink)}
                  <a
                    href={eventMeetLink}
                    target='_blank'
                    rel='noreferrer'
                    style={{ marginLeft: '5px' }}
                  >
                    {getJoinButtonText(eventMeetLink)}
                  </a>
                  {isUserMeetingOrganizer() && (
                    <CloseIcon
                      height={12}
                      width={12}
                      style={{ marginLeft: '5px' }}
                      onClick={() => {
                        deleteGoogleMeet(
                          currentUser && currentUser.id,
                          calendarId,
                          eventId,
                        )
                        setEventMeetLink('')
                      }}
                    />
                  )}
                </div>
                {meetingUserResponseStatusButtons()}
              </div>
            ) : (
              <div
                className='google-meet-schedule-button'
                style={{ cursor: 'pointer' }}
                onClick={() => handleAddMeetings()}
              >
                <GoogleMeetIcon strokeWidth='.1' height={24} width={24} />
                <p>Add Google Meet</p>
              </div>
            )}
          </div>
          <div style={{ display: 'inline-block' }}>
            <label>Attendees</label>
            {eventAttendees.map(({ displayName, email, responseStatus }, i) => {
              return (
                <div className='attendee-icon'>
                  {getResponseStatusIcon(responseStatus)}
                  <span style={{ marginLeft: '5px' }}>
                    {cropLabel(displayName || email, 30)}
                  </span>
                  {isUserMeetingOrganizer() && (
                    <CloseIcon
                      height={12}
                      width={12}
                      style={{ cursor: 'pointer', marginLeft: '5px' }}
                      onClick={() => {
                        const newAttendees = [...eventAttendees]
                        newAttendees.splice(i, 1)
                        setEventAttendees(newAttendees)
                      }}
                    />
                  )}
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
                    !eventAttendees.some(
                      (eventAttendee) =>
                        eventAttendee.email === newEventAttendee,
                    ) &&
                    isValidEmail(newEventAttendee)
                  ) {
                    const newAttendees = [...eventAttendees]
                    if (newEventAttendee === currentUser?.email) {
                      newAttendees.push({
                        email: newEventAttendee,
                        responseStatus: 'accepted',
                        self: true,
                        organizer: true,
                      })
                    } else {
                      newAttendees.push({
                        email: newEventAttendee,
                        responseStatus: 'needsAction',
                      })
                    }
                    setEventAttendees(newAttendees)
                  }
                  setNewEventAttendee('')
                }}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
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

  if (recurringEventEditType !== '') {
    return (
      <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
        <div
          className='event__wrapper'
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <div className='add-task__wrapper'>
            <form className='add-task'>
              <div className={`add-task__container`}>
                <h3>
                  {recurringEventEditType === 'DELETE'
                    ? 'Delete '
                    : recurringEventEditType === 'BACKLOG'
                    ? 'Backlog '
                    : ''}
                  recurring event
                </h3>
                <div>
                  <input
                    type='checkbox'
                    checked={recurringEventEditOption === 'THIS_EVENT'}
                    onClick={() => setRecurringEventEditOption('THIS_EVENT')}
                  />
                  <label>This event</label>
                </div>
                <div>
                  <input
                    type='checkbox'
                    checked={recurringEventEditOption === 'ALL_EVENTS'}
                    onClick={() => setRecurringEventEditOption('ALL_EVENTS')}
                  />
                  <label>All events</label>
                </div>
                <div
                  style={{
                    marginTop: '20px',
                    marginBottom: '10px',
                  }}
                >
                  <button
                    className=' action add-task__actions--cancel'
                    onClick={(e) => {
                      e.preventDefault()
                      setRecurringEventEditType('')
                      setRecurringEventEditOption('THIS_EVENT')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className=' action add-task__actions--add-task'
                    onClick={(e) => {
                      e.preventDefault()
                      if (recurringEventEditType === 'DELETE') {
                        handleDelete()
                      } else if (recurringEventEditType === 'BACKLOG') {
                        handleBacklog()
                      }
                    }}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (recurringEventOptionsType === 'EDIT') {
    return (
      <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
        <div
          className='event__wrapper'
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <div className='add-task__wrapper'>
            <form className='add-task'>
              <div className={`add-task__container`}>
                <h3>Recurrence Options</h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'left',
                  }}
                >
                  <button className='recurring-option-selector-button'>
                    Does not repeat
                  </button>
                  <button className='recurring-option-selector-button'>
                    Daily
                  </button>
                  <button className='recurring-option-selector-button'>
                    Weekly on Monday
                  </button>
                  <button className='recurring-option-selector-button'>
                    Monthly on the first Monday
                  </button>
                  <button className='recurring-option-selector-button'>
                    Annually on April 3
                  </button>
                  <button className='recurring-option-selector-button'>
                    Every weekday (Monday to Friday)
                  </button>
                  <button
                    className='recurring-option-selector-button'
                    onClick={(e) => {
                      e.preventDefault()
                      setRecurringEventOptionsType('CUSTOM_EDIT')
                    }}
                  >
                    Custom...
                  </button>
                </div>
                <div
                  style={{
                    marginTop: '20px',
                    marginBottom: '10px',
                  }}
                >
                  <button
                    className=' action add-task__actions--cancel'
                    onClick={(e) => {
                      e.preventDefault()
                      setRecurringEventOptionsType('')
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  } else if (recurringEventOptionsType === 'CUSTOM_EDIT') {
    return (
      <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
        <div
          className='event__wrapper'
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <div className='add-task__wrapper'>
            <form className='add-task'>
              <div className={`add-task__container`}>
                <h3>Custom Recurrence</h3>
                <div>
                  <div>
                    <label>Repeat every</label>
                    <input type='number' />
                    <select>
                      <option value='day'>Day</option>
                      <option value='week'>Week</option>
                      <option value='month'>Month</option>
                      <option value='year'>Year</option>
                    </select>
                  </div>
                  <div>
                    <p>Repeats on</p>
                    <div>
                      <span>S</span>
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                    </div>
                  </div>
                  <div>
                    <p>Ends</p>
                    <div>
                      <input type='radio' />
                      <label>Never</label>
                    </div>
                    <div>
                      <input type='radio' />
                      <label>On</label>
                      <input type='date' />
                    </div>
                    <div>
                      <input type='radio' />
                      <label>After</label>
                      <input type='number' />
                      <label>occurrences</label>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    marginBottom: '10px',
                  }}
                >
                  <button
                    className=' action add-task__actions--cancel'
                    onClick={(e) => {
                      e.preventDefault()
                      setRecurringEventOptionsType('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className=' action add-task__actions--add-task'
                    onClick={(e) => {
                      e.preventDefault()
                      setRecurringEventOptionsType('')
                    }}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div
        className='event__wrapper'
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <div className='add-task__wrapper'>
          <form className='add-task'>
            <div className={`add-task__container`}>
              {titleAndOptions()}
              {recurringOptions()}
              {meetingEditor()}
              {locationEditor()}
              {eventColorSelector()}
              {descriptionEditor()}
              <div
                style={{
                  display: 'flex',
                  marginBottom: '10px',
                }}
              >
                <button
                  className=' action add-task__actions--add-task'
                  onClick={() => {
                    handleSave()
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
