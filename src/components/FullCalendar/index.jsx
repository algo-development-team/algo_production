import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import rrulePlugin from '@fullcalendar/rrule'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { useExternalEventsContextValue } from 'context'
import { generatePushId, generateEventId } from '../../utils'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import {
  getUserGoogleCalendarsEvents,
  addEventToUserGoogleCalendar,
  deleteEventFromUserGoogleCalendar,
  updateEventFromUserGoogleCalendar,
  addWebhookToGoogleCalendar,
  getFormattedGoogleCalendarEvent,
  updateGoogleCalendarEvents,
} from '../../google'
import {
  useGoogleValue,
  useCalendarsEventsValue,
  useThemeContextValue,
  useAutoScheduleButtonClickedValue,
  useAvailableTimesValue,
  useTaskListValue,
} from 'context'
import { useAuth, useUnselectedCalendarIds, useTasks } from 'hooks'
import moment from 'moment'
import './calendar.scss'
import {
  getEventsInfo,
  updateEventsInfo,
} from '../../backend/handleUserEventsInfo'
import { quickAddTask, handleCheckTask } from '../../backend/handleUserTasks'
import {
  GoogleEventColours,
  isValidGoogleEventColorId,
} from '../../handleColorPalette'
import { roundClosestValidTimeLength } from '../../handleMoment'
import { useOverlayContextValue } from 'context'
import { stripTags } from '../../handleHTML'
import {
  getFormattedEventTime,
  formatEventTimeLength,
  getRecurringEventDuration,
} from './eventTimeHelpers'
import {
  getFormattedRRule,
  getRRuleAndExdates,
  updateDtStartInRRuleStr,
  destructRRuleStr,
  extractValuesFromNameValuePairs,
  getRRuleDeleteThisEvent,
  getRecurrenceDeleteThisEvent,
  getRecurrenceFromPrevNonRecurringEvent,
  getRecurrenceFromPrevRecurringEvent,
} from './rruleHelpers'
import { NonRecurringEvent, RecurringEvent } from './event'
import { updateTask, addTask } from '../../backend/handleUserTasks'

const USER_SELECTED_CALENDAR = 'primary'

export const FullCalendar = () => {
  const { AutoScheduleButtonClicked, setAutoScheduleButtonClicked } =
    useAutoScheduleButtonClickedValue()
  const { AvailableTimes, setAvailableTimes } = useAvailableTimesValue()
  const { TaskList, setTaskList } = useTaskListValue()
  const [view, setView] = useState(`dayGridWeek`)
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { googleCalendars } = useGoogleValue()
  const { currentUser } = useAuth()
  const { unselectedCalendarIds } = useUnselectedCalendarIds()
  const { calendarsEvents, setCalendarsEvents, calendarsEventsFetched } =
    useCalendarsEventsValue()
  const [nextSyncTokens, setNextSyncTokens] = useState({})
  const [resourceIds, setResourceIds] = useState({})
  const { isLight } = useThemeContextValue()
  const { setShowDialog, setDialogProps } = useOverlayContextValue()
  const { tasks, setTasks, loading: tasksLoading } = useTasks()

  const googleCalendarsLoaded = () => {
    return googleCalendars.length > 0
  }

  const getTask = (taskId) => {
    return tasks.find((task) => task.taskId === taskId)
  }

  const getEventCalendarIdAndKey = (eventId) => {
    let calendarId = null // Google Calendar ID
    let calendarKey = null // Key in calendarsEvents
    for (const key in calendarsEvents) {
      if (
        calendarsEvents[key].find(
          (calendarEvent) => calendarEvent.id === eventId,
        )
      ) {
        calendarKey = key
        if (key === 'custom') {
          calendarId = USER_SELECTED_CALENDAR
        } else {
          calendarId = key
        }
        break
      }
    }
    return { calendarId: calendarId, calendarKey: calendarKey }
  }

  const getEventIdFromEventInstance = (eventInstance) => {
    return eventInstance.split('_')[0]
  }

  const getSelectedCalendarsEvents = (mixedCalendarsEvents) => {
    let events = []
    for (const key in mixedCalendarsEvents) {
      if (!unselectedCalendarIds.includes(key)) {
        events = events.concat(mixedCalendarsEvents[key])
      }
    }

    return events
  }

  const getEventProperties = (event) => {
    return {
      allDay: event.allDay, // boolean
      id: event.id, // string
      title: event.title, // string
      start: event.start, // JS Date Object
      end: event.end, // JS Date Object
      startStr: event.startStr, // ISOString or YYYY-MM-DD
      endStr: event.endStr, // ISOString or YYYY-MM-DD
      backgroundColor: event.backgroundColor, // Hex Code
      description: event.extendedProps.description, // string
      location: event.extendedProps.location, // string
      meetLink: event.extendedProps.meetLink, // string (URL)
      attendees: event.extendedProps.attendees, // array of string (email[])
      recurring: event.extendedProps.recurring, // boolean
      dtStart: event.extendedProps?.dtStart || null, // ISO8601 | null
      rruleStr: event.extendedProps?.rruleStr || null, // string (RRule.toString()) | null
      recurrence: event.extendedProps?.recurrence || null, // array of string (RRule.toString()[]) | null
      taskId: event.extendedProps?.taskId, // string | null
    }
  }

  useEffect(() => {
    const ws = new WebSocket(
      `wss://${process.env.REACT_APP_NGROK_BODY}/webhooks/google/calendar`,
    )

    ws.addEventListener('open', (event) => {
      console.log('WebSocket connection established')
    })

    ws.addEventListener('message', (event) => {
      console.log(`Received message: ${event.data}`)
    })

    return () => {
      ws.close()
    }
  }, [])

  /* TESTED */
  useEffect(() => {
    const fetchGoogleCalendarEvents = async () => {
      const googleCalendarIds = googleCalendars.map(
        (googleCalendar) => googleCalendar.id,
      )
      const { fetchedCalendarsEvents, nextSyncTokens } =
        await getUserGoogleCalendarsEvents(currentUser.id, googleCalendarIds)
      setNextSyncTokens(nextSyncTokens)
      const newCalendarsEvents = { ...calendarsEvents }

      const deletedEventInstances = {}

      for (const key in fetchedCalendarsEvents) {
        fetchedCalendarsEvents[key].forEach((event) => {
          if (event.status === 'cancelled') {
            const formattedEventTime = getFormattedEventTime(
              event.originalStartTime?.dateTime,
              event.originalStartTime?.date,
            )
            if (
              !Object.keys(deletedEventInstances).includes(
                getEventIdFromEventInstance(event.id),
              )
            ) {
              deletedEventInstances[getEventIdFromEventInstance(event.id)] = [
                formattedEventTime,
              ]
            } else {
              deletedEventInstances[getEventIdFromEventInstance(event.id)].push(
                formattedEventTime,
              )
            }
          }
        })
      }

      const googleCalendarEventsUpdateDetails = []

      for (const key in fetchedCalendarsEvents) {
        const eventsData = fetchedCalendarsEvents[key].map((event) => {
          const id = event.id
          let title = event.summary
          const backgroundColor = isValidGoogleEventColorId(event.colorId)
            ? GoogleEventColours[event.colorId - 1].hex
            : GoogleEventColours[6].hex
          let description = stripTags(event?.description || '')
          const location = event?.location || ''
          const meetLink = event.conferenceData?.entryPoints[0].uri || ''
          const attendees = event?.attendees || []

          const start = event.start?.dateTime || event.start?.date

          let taskId = event?.extendedProperties?.private?.taskId || null

          if (taskId) {
            const googleCalendarEventUpdateDetails = {
              id: id,
              calendarId: key,
              summary: title,
              description: description,
            }

            const task = getTask(taskId)

            if (task) {
              // task exists, update title and description
              // UPDATE FROM GOOGLE CALENDAR FROM HERE IF TASK TITLE IS UPDATED
              if (title !== task.name || description !== task.description) {
                title = task.name
                description = task.description
                googleCalendarEventUpdateDetails.summary = title
                googleCalendarEventUpdateDetails.description = description
                googleCalendarEventsUpdateDetails.push(
                  googleCalendarEventUpdateDetails,
                )
              }
            } else {
              // task no longer exists, remove taskId
              taskId = null
            }
          }

          if (event.recurrence) {
            const allDay = event.start?.dateTime ? false : true
            const rruleAndExdates = getRRuleAndExdates(event.recurrence, allDay)
            const dtStart = getFormattedEventTime(start, allDay)
            const recurrence = event.recurrence
            const eventEnd = event.end?.dateTime || event.end?.date
            const duration = getRecurringEventDuration(start, eventEnd)
            const formattedDuration = formatEventTimeLength(duration)
            const formattedRRule = getFormattedRRule(
              dtStart,
              rruleAndExdates.rrule,
              [
                ...(deletedEventInstances[event.id] || []),
                ...rruleAndExdates.exdates,
              ],
            )

            const recurringEvent = new RecurringEvent(
              id,
              title,
              backgroundColor,
              description,
              location,
              meetLink,
              attendees,
              taskId,
              formattedRRule,
              formattedDuration,
              dtStart,
              recurrence,
            )

            return recurringEvent
          } else {
            const end = event.end?.dateTime || event.end?.date

            const nonRecurringEvent = new NonRecurringEvent(
              id,
              title,
              backgroundColor,
              description,
              location,
              meetLink,
              attendees,
              taskId,
              start,
              end,
            )

            return nonRecurringEvent
          }
        })

        newCalendarsEvents[key] = eventsData
      }

      setCalendarsEvents(newCalendarsEvents)

      updateGoogleCalendarEvents(
        currentUser.id,
        googleCalendarEventsUpdateDetails,
      )
    }

    if (
      currentUser &&
      !tasksLoading &&
      googleCalendarsLoaded() &&
      !calendarsEventsFetched
    ) {
      fetchGoogleCalendarEvents()
      const fetchedResourceIds = {}
      googleCalendars.forEach(async (googleCalendar) => {
        const result = await addWebhookToGoogleCalendar(
          currentUser.id,
          googleCalendar.id,
        )
        fetchedResourceIds[googleCalendar.id] = result.resourceId
      })
      setResourceIds(fetchedResourceIds)
    }
  }, [currentUser, tasksLoading, googleCalendars, calendarsEventsFetched])

  /* TESTED */
  const handleRecurringEventAdjustment = (info) => {
    const { event, oldEvent } = info

    const oldStart = oldEvent.start
    const { allDay, id, start, end, dtStart, rruleStr, recurrence } =
      getEventProperties(event)

    // if event is dragged to a new day, then return early
    if (
      moment(oldStart).format('YYYY-MM-DD') !==
      moment(start).format('YYYY-MM-DD')
    ) {
      info.revert()
      alert('Recurring events cannot be dragged to a new day.')
      return
    }

    const change = moment(start).diff(moment(oldStart), 'minutes')
    const duration = moment(end).diff(moment(start), 'minutes')
    const formattedDuration = formatEventTimeLength(duration)

    const dtStartTime = moment(dtStart)
    const newDtStartTime = dtStartTime.clone().add(change, 'minutes')
    const newDtEndTime = newDtStartTime.clone().add(duration, 'minutes')
    const formattedNewDtStartTime = allDay
      ? newDtStartTime.format('YYYY-MM-DD')
      : newDtStartTime.toISOString()
    const formattedNewDtEndTime = allDay
      ? newDtEndTime.format('YYYY-MM-DD')
      : newDtEndTime.toISOString()
    const formattedNewDtstart = getFormattedEventTime(newDtStartTime)
    const newRRuleStr = updateDtStartInRRuleStr(rruleStr, formattedNewDtstart)

    const { calendarId, calendarKey } = getEventCalendarIdAndKey(id)

    setCalendarsEvents((prevCalendarsEvents) => {
      const newCalendarsEvents = { ...prevCalendarsEvents }
      const events = newCalendarsEvents[calendarKey]
      const newEvents = events.map((prevEvent) => {
        if (prevEvent.id === id) {
          prevEvent.updateRecurringFields(
            newRRuleStr,
            formattedDuration,
            formattedNewDtstart,
            recurrence,
          )
        }
        return prevEvent
      })
      newCalendarsEvents[calendarKey] = newEvents
      return newCalendarsEvents
    })

    const formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
      startTime: formattedNewDtStartTime,
      endTime: formattedNewDtEndTime,
      allDay: allDay,
    })

    updateEventFromUserGoogleCalendar(
      currentUser.id,
      calendarId,
      id,
      formattedGoogleCalendarEvent,
    )
  }

  /* TESTED */
  const handleNonRecurringEventAdjustment = (info) => {
    const { event } = info

    const { allDay, id, start, end, startStr, endStr } =
      getEventProperties(event)
    const { calendarId, calendarKey } = getEventCalendarIdAndKey(id)

    setCalendarsEvents((prevCalendarsEvents) => {
      const newCalendarsEvents = { ...prevCalendarsEvents }
      const events = newCalendarsEvents[calendarKey]
      const newEvents = events.map((prevEvent) => {
        if (prevEvent.id === id) {
          prevEvent.updateNonRecurringFields(start, end)
        }
        return prevEvent
      })
      newCalendarsEvents[calendarKey] = newEvents
      return newCalendarsEvents
    })

    const formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
      startTime: startStr,
      endTime: endStr,
      allDay: allDay,
    })

    updateEventFromUserGoogleCalendar(
      currentUser.id,
      calendarId,
      id,
      formattedGoogleCalendarEvent,
    )
  }

  /* TESTED */
  const handleEventAdjustment = (info) => {
    const { recurring } = getEventProperties(info.event)

    if (recurring) {
      handleRecurringEventAdjustment(info)
    } else {
      handleNonRecurringEventAdjustment(info)
    }
  }

  /* TESTED */
  const updateCalendarsEvents = (calendarKey, eventId, newEvent) => {
    setCalendarsEvents((prevCalendarsEvents) => {
      const newCalendarsEvents = { ...prevCalendarsEvents }
      const events = newCalendarsEvents[calendarKey]
      const newEvents = events.map((prevEvent) => {
        if (prevEvent.id === eventId) {
          return newEvent
        }
        return prevEvent
      })
      newCalendarsEvents[calendarKey] = newEvents
      return newCalendarsEvents
    })
  }

  const showEventPopup = (info, calendar) => {
    info.jsEvent.preventDefault()

    const {
      allDay,
      id,
      title,
      start,
      end,
      startStr,
      endStr,
      backgroundColor,
      description,
      location,
      meetLink,
      attendees,
      recurring,
      dtStart,
      rruleStr,
      recurrence,
      taskId,
    } = getEventProperties(info.event)

    const task = getTask(taskId)

    const duration = moment(end).diff(moment(start), 'minutes')
    const formattedDuration = formatEventTimeLength(duration)
    const recurrenceId = getFormattedEventTime(start, allDay)
    const colorId =
      GoogleEventColours.findIndex((colour) => colour.hex === backgroundColor) +
      1

    const { calendarId, calendarKey } = getEventCalendarIdAndKey(id)

    setDialogProps({
      taskname: title,
      taskdescription: description,
      taskbackgroundcolor: backgroundColor,
      location: location,
      meetLink: meetLink,
      attendees: attendees,
      recurring: recurring,
      start: start,
      rruleStr: rruleStr,
      eventId: id,
      calendarId: calendarId,
      task: task,
      /* TESTED */
      remove: (recurringEventEditOption) => {
        if (recurring && recurringEventEditOption === 'THIS_EVENT') {
          const newRRule = getRRuleDeleteThisEvent(rruleStr, recurrenceId)
          const newRecurrence = getRecurrenceDeleteThisEvent(
            recurrence,
            recurrenceId,
          )

          // update at calendarsEvents
          let updatedEvent = null

          const newCalendarsEvents = { ...calendarsEvents }
          newCalendarsEvents[calendarKey] = newCalendarsEvents[calendarKey].map(
            (prevEvent) => {
              if (prevEvent.id === id) {
                prevEvent.updateRecurringFields(
                  newRRule,
                  formattedDuration,
                  dtStart,
                  newRecurrence,
                )
              }
              return prevEvent
            },
          )

          setCalendarsEvents(newCalendarsEvents)

          info.event.remove()
          if (updatedEvent) {
            calendar.addEvent(updatedEvent)
          }

          const formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
            recurrence: newRecurrence,
          })

          // update at Google Calendar
          updateEventFromUserGoogleCalendar(
            currentUser.id,
            calendarId,
            id,
            formattedGoogleCalendarEvent,
          )
        } else {
          // remove from calendarsEvents
          const newCalendarsEvents = { ...calendarsEvents }
          for (const key in newCalendarsEvents) {
            newCalendarsEvents[key] = newCalendarsEvents[key].filter(
              (event) => event.id !== id,
            )
          }

          setCalendarsEvents(newCalendarsEvents)

          // remove from FullCalendar
          info.event.remove()

          // remove from Google Calendar
          deleteEventFromUserGoogleCalendar(currentUser.id, calendarId, id)
        }
      },
      /* TESTED */
      copy: () => {
        const newId = generateEventId()

        let newEvent = null
        let formattedGoogleCalendarEvent = null

        if (recurring) {
          newEvent = new RecurringEvent(
            newId,
            title,
            backgroundColor,
            description,
            location,
            meetLink,
            attendees,
            taskId,
            rruleStr,
            formattedDuration,
            dtStart,
            recurrence,
          )

          formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
            id: newId,
            summary: title,
            description: description,
            colorId: colorId,
            location: location,
            attendees: attendees,
            recurrence: recurrence,
            startTime: startStr,
            endTime: endStr,
            allDay: allDay,
            taskId: taskId,
          })
        } else {
          newEvent = new NonRecurringEvent(
            newId,
            title,
            backgroundColor,
            description,
            location,
            meetLink,
            attendees,
            taskId,
            start,
            end,
          )

          formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
            id: newId,
            summary: title,
            description: description,
            colorId: colorId,
            location: location,
            attendees: attendees,
            startTime: startStr,
            endTime: endStr,
            allDay: allDay,
            taskId: taskId,
          })
        }

        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })
        calendar.addEvent(newEvent)

        // add to Google Calendar
        addEventToUserGoogleCalendar(
          currentUser.id,
          USER_SELECTED_CALENDAR,
          formattedGoogleCalendarEvent,
        )
      },
      /* TESTED */
      backlog: async () => {
        if (taskId) {
          /* if id exists, then remove it from scheduledTasks array in Firestore */
          const eventsInfo = await getEventsInfo(currentUser.id)
          const scheduledTasks = eventsInfo.scheduledTasks
          const newScheduledTasks = scheduledTasks.filter(
            (scheduledTaskId) => scheduledTaskId !== taskId,
          )
          updateEventsInfo(currentUser.id, {
            scheduledTasks: newScheduledTasks,
          })
        } else {
          /* if id does not exists, then create a quick task, and add it to notScheduledTasks array in Firestore */
          const newTaskId = generatePushId()
          const taskTimeLength = moment(end).diff(moment(start), 'minutes')

          await quickAddTask(
            currentUser.id,
            title,
            newTaskId,
            description,
            taskTimeLength,
            'DUPLICATE',
          )
        }
      },
      /* TESTED */
      save: (
        updatedTitle,
        updatedBackgroundColor,
        updatedDescription,
        updatedLocation,
        updatedMeetLink,
        updatedAttendees,
        isRecurring,
        newDtstart, // JS Date object
        newRRule, // RRule object
        updatedTaskProjectId,
        updatedStartDate, // 'DD-MM-YYYY'
        updatedEndDate, // 'DD-MM-YYYY'
        updatedPriority,
      ) => {
        let formattedNewRRule = null
        let newRecurrence = null
        let newDtstartTime = null

        if (isRecurring) {
          newDtstartTime = getFormattedEventTime(newDtstart, allDay)

          const newRRuleStr = newRRule.toString()

          let existingExdates = []
          if (recurring) {
            const destructedRRuleStr = destructRRuleStr(rruleStr)
            existingExdates = extractValuesFromNameValuePairs(
              destructedRRuleStr.exdates,
            )
          }

          formattedNewRRule = getFormattedRRule(
            newDtstartTime,
            newRRuleStr,
            existingExdates,
          )

          if (recurring) {
            newRecurrence = getRecurrenceFromPrevRecurringEvent(
              recurrence,
              newRRuleStr,
              allDay,
            )
          } else {
            newRecurrence = getRecurrenceFromPrevNonRecurringEvent(newRRuleStr)
          }
        }

        const selectedEvent = calendarsEvents[calendarKey].find(
          (event) => event.id === id,
        )

        if (!selectedEvent) {
          alert(
            'Cannot save the event. Please try again later or refresh the page.',
          )
          return
        }

        info.event.remove()

        let newEvent = null

        if (!isRecurring) {
          newEvent = new NonRecurringEvent(
            id,
            updatedTitle,
            updatedBackgroundColor,
            updatedDescription,
            updatedLocation,
            updatedMeetLink,
            updatedAttendees,
            taskId,
            start,
            end,
          )
        } else if (isRecurring) {
          newEvent = new RecurringEvent(
            id,
            updatedTitle,
            updatedBackgroundColor,
            updatedDescription,
            updatedLocation,
            updatedMeetLink,
            updatedAttendees,
            taskId,
            formattedNewRRule,
            formattedDuration,
            newDtstartTime,
            newRecurrence,
          )
        }

        calendar.addEvent(newEvent)
        updateCalendarsEvents(calendarKey, id, newEvent)

        let formattedGoogleCalendarEvent = null

        const newColorId =
          GoogleEventColours.findIndex(
            (colour) => colour.hex === updatedBackgroundColor,
          ) + 1

        if (isRecurring) {
          const newDtstartStr = moment(newDtstart).toISOString()
          const newDtendStr = moment(newDtstart)
            .add(duration, 'minutes')
            .toISOString()

          formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
            id: id,
            summary: updatedTitle,
            description: updatedDescription,
            colorId: newColorId,
            location: updatedLocation,
            attendees: updatedAttendees,
            recurrence: newRecurrence,
            startTime: newDtstartStr, // change this to ISOString of newDtstart
            endTime: newDtendStr, // change this to ISOString of newDtend
            allDay: allDay,
            taskId: taskId,
          })
        } else {
          formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
            id: id,
            summary: updatedTitle,
            description: updatedDescription,
            colorId: newColorId,
            location: updatedLocation,
            attendees: updatedAttendees,
            recurrence: [],
            startTime: startStr,
            endTime: endStr,
            allDay: allDay,
            taskId: taskId,
          })
        }

        updateEventFromUserGoogleCalendar(
          currentUser.id,
          calendarId,
          id,
          formattedGoogleCalendarEvent,
        )

        // update task fields
        if (task) {
          const updatedTask = {
            name: updatedTitle,
            description: updatedDescription,
            projectId: updatedTaskProjectId,
            startDate: updatedStartDate,
            date: updatedEndDate,
            priority: updatedPriority,
          }

          updateTask(currentUser.id, taskId, updatedTask)

          const updatedTasks = tasks.map((task) => {
            if (task.taskId === taskId) {
              return {
                ...task,
                ...updatedTask,
              }
            }
            return task
          })
          setTasks(updatedTasks)
        }
      },
      addEventAsTask: async (
        projectId,
        startDate,
        endDate,
        title,
        description,
        priority,
      ) => {
        const newTaskId = generatePushId()
        const roundedTimeLength = roundClosestValidTimeLength(duration)

        addTask(
          currentUser.id,
          projectId,
          startDate,
          endDate,
          title,
          newTaskId,
          'TODO',
          description,
          priority,
          roundedTimeLength,
          0, // REPLACE INDEX HERE WITH APPROPRIATE VALUE LATER
        )

        /* stores the taskId to scheduledTasks array in eventsInfo collection */
        const eventsInfo = await getEventsInfo(currentUser.id)
        const scheduledTasks = eventsInfo.scheduledTasks
        const newScheduledTasks = [...scheduledTasks, newTaskId]
        updateEventsInfo(currentUser.id, {
          scheduledTasks: newScheduledTasks,
        })
      },
    })
    setShowDialog('BLOCK')
  }

  useEffect(() => {
    const externalEvents = new Draggable(externalEventsRef.current, {
      itemSelector: '.fc-event',
      eventData: function (eventEl) {
        const draggedEvent = JSON.parse(eventEl.dataset.event)
        return {
          id: generateEventId(),
          title: eventEl.innerText,
          duration: formatEventTimeLength(draggedEvent.timeLength),
          backgroundColor: draggedEvent.backgroundColor,
        }
      },
    })

    if (!currentUser) return null
    if (tasksLoading) return null

    const calendar = new Calendar(calendarRef.current, {
      height: 'calc(100vh - 64px)',
      plugins: [
        rrulePlugin,
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        googleCalendarPlugin,
      ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: true,
      droppable: true,
      dayMaxEventRows: true,
      views: {
        timeGrid: {
          dayMaxEventRows: 3, // adjust to 6 only for timeGridWeek/timeGridDay
        },
      },
      // scrollTimeReset: false,
      // scrollTime: null,
      selectable: true,
      eventBorderColor: '#3788D8',
      initialView: `${view}`, // set the default view to timeGridWeek
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00',
      googleCalendarApiKey: process.env.REACT_APP_GOOGLE_API_KEY, // replace with your API key
      datesSet: function (info) {
        setView(info.view.type)
      },
      drop: async function (info) {
        const draggedEvent = JSON.parse(info.draggedEl.dataset.event)

        const newId = generateEventId()

        const allDay = draggedEvent.allDay
        const title = draggedEvent.name
        const description = draggedEvent.description
        const backgroundColor = draggedEvent.backgroundColor
        const taskId = draggedEvent.taskId

        const start = info.date
        const end = moment(info.date)
          .add(draggedEvent.timeLength, 'minutes')
          .toDate()
        const startTime = allDay
          ? start.toISOString().slice(0, 10)
          : start.toISOString()
        const endTime = allDay
          ? end.toISOString().slice(0, 10)
          : end.toISOString()
        const colorId =
          GoogleEventColours.findIndex(
            (colour) => colour.hex === backgroundColor,
          ) + 1

        const location = ''
        const meetLink = ''
        const attendees = []

        const newEvent = new NonRecurringEvent(
          newId,
          title,
          backgroundColor,
          description,
          location,
          meetLink,
          attendees,
          taskId,
          start,
          end,
        )

        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })

        const formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
          id: newId,
          summary: title,
          description: description,
          colorId: colorId,
          startTime: startTime,
          endTime: endTime,
          allDay: allDay,
          taskId: taskId,
        })

        // add to Google Calendar
        addEventToUserGoogleCalendar(
          currentUser.id,
          USER_SELECTED_CALENDAR,
          formattedGoogleCalendarEvent,
        )

        /* stores the taskId to scheduledTasks array in eventsInfo collection */
        const eventsInfo = await getEventsInfo(currentUser.id)
        const scheduledTasks = eventsInfo.scheduledTasks
        const newScheduledTasks = [...scheduledTasks, draggedEvent.taskId]
        updateEventsInfo(currentUser.id, {
          scheduledTasks: newScheduledTasks,
        })
      },
      eventClick: function (info) {
        showEventPopup(info, calendar)
      },
      select: function (info) {
        const newId = generateEventId()

        const allDay = info.allDay
        const start = info.startStr
        const end = info.endStr

        const newEvent = new NonRecurringEvent(
          newId,
          'New Event',
          GoogleEventColours[6].hex,
          '',
          '',
          '',
          [],
          null,
          start,
          end,
        )

        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })

        const formattedGoogleCalendarEvent = getFormattedGoogleCalendarEvent({
          id: newId,
          summary: 'New Event',
          startTime: start,
          endTime: end,
          allDay: allDay,
        })

        // add to Google Calendar
        addEventToUserGoogleCalendar(
          currentUser.id,
          USER_SELECTED_CALENDAR,
          formattedGoogleCalendarEvent,
        )
      },
      eventResize: function (info) {
        handleEventAdjustment(info)
      },
      eventDrop: function (info) {
        handleEventAdjustment(info)
      },
      events: getSelectedCalendarsEvents(calendarsEvents),
      eventContent: function (info) {
        // create a div to hold the event content
        const eventEl = document.createElement('div')
        eventEl.classList.add('fc-event')

        // create a span to hold the event time range
        const timeRangeEl = document.createElement('p')
        timeRangeEl.classList.add('fc-event-time-range')
        timeRangeEl.innerText = info.timeText
        eventEl.appendChild(timeRangeEl)

        const taskId = info.event.extendedProps?.taskId

        if (taskId) {
          // create a checkbox for the checkmark
          const checkmarkInput = document.createElement('input')
          checkmarkInput.type = 'checkbox'
          checkmarkInput.classList.add('checkmark-input')
          const task = getTask(taskId)
          if (task?.boardStatus === 'COMPLETE') {
            checkmarkInput.checked = true
          }
          eventEl.appendChild(checkmarkInput)

          // attach an onClick event listener to the checkbox
          checkmarkInput.addEventListener('click', function () {
            handleCheckTask(currentUser.id, taskId)
          })
        }

        // create a span to hold the event title
        const titleEl = document.createElement('span')
        titleEl.classList.add('fc-event-title')
        titleEl.innerText = info.event.title
        eventEl.appendChild(titleEl)

        return { domNodes: [eventEl] }
      },
      now: new Date(), // set the current time
      nowIndicator: true, // display a red line through the current time
      handleWindowResize: true,
      eventBorderColor: isLight ? '#fff' : '#1f1f1f',
    })

    /* AUTO-SCHEDULE CODE STARTS */
    const avtimes = AvailableTimes
    const tlist = TaskList

    const addEventsToFullCalendar = (tlist, avtimes) => {
      if (AvailableTimes != null && TaskList != null) {
        const newCustomEvents = [...calendarsEvents.custom]
        let m = 0
        let t = avtimes[m].start
        let buffer = 0
        let smalltasknumber = 0
        let y = 0
        for (let i = 0; i < tlist.length; i++) {
          if (
            moment(avtimes[avtimes.length - 1].end).diff(moment(t), 'minutes') <
            tlist[i].timeLength
          ) {
            break
          }
          if (tlist[i].timeLength >= 0) {
            if (tlist[i].timeLength < 120) {
              smalltasknumber = smalltasknumber + 1
            }
            buffer = 0
          }
          if (tlist[i].timeLength >= 120) {
            buffer = 15
          }
          if (tlist[i].timeLength >= 240) {
            buffer = 30
          }
          if (tlist[i].timeLength >= 480) {
            buffer = 60
          }
          if (smalltasknumber === 3) {
            buffer = 15
            smalltasknumber = 0
          }
          const diff = moment(avtimes[m].end).diff(
            moment(t).clone().add(tlist[i].timeLength, 'minutes'),
            'minutes',
          )
          if (diff < 0) {
            let a = null
            for (let p = m + 1; p < avtimes.length; p++) {
              if (
                moment(avtimes[p].end).diff(
                  moment(avtimes[p].start),
                  'minutes',
                ) >= tlist[i].timeLength
              ) {
                m = p
                t = avtimes[p].start
                a = 1
                break
              }
            }
            if (a !== null) {
              y = 2
              // for nothing
            } else {
              y = 1
            }
          }
          if (y === 1) {
            break
          }
          const newEvent1 = {
            id: tlist[i].id,
            title: tlist[i].name,
            start: moment(t).format('YYYY-MM-DD HH:mm'),
            end: moment(t)
              .add(tlist[i].timeLength, 'minutes')
              .format('YYYY-MM-DD HH:mm'),
            taskId: tlist[i].id,
            description: tlist[i].description,
          }
          t = moment(t).add(tlist[i].timeLength, 'minutes')
          t = moment(t).add(buffer, 'minutes')
          calendar.addEvent(newEvent1)
          newCustomEvents.push(newEvent1)
        }
        setCalendarsEvents({
          ...calendarsEvents,
          custom: newCustomEvents,
        })
      } else {
        if (AvailableTimes === null) {
          console.log('no available times')
        }
        if (TaskList === null) {
          console.log('tasklist empty')
        }
        console.log('cannot schedule')
      }
    }
    if (AutoScheduleButtonClicked === true) {
      addEventsToFullCalendar(tlist, avtimes)
      setAutoScheduleButtonClicked(false)
      setAvailableTimes(null)
      setTaskList(null)
    }
    /* AUTO-SCHEDULE CODE ENDS */

    calendar.render()

    // Update the current time every 5 minutes
    const intervalId = setInterval(() => {
      setCurrentTime(new Date())
    }, 5 * 60 * 1000) // 5 minutes in milliseconds
    return () => {
      calendar.destroy()
      externalEvents.destroy()
      clearInterval(intervalId)
    }
  }, [
    isLight,
    calendarsEvents,
    tasksLoading,
    unselectedCalendarIds,
    externalEventsRef,
    currentTime,
    googleCalendars,
    AutoScheduleButtonClicked,
    AvailableTimes,
    TaskList,
  ])

  return <div ref={calendarRef}></div>
}
