import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import rrulePlugin from '@fullcalendar/rrule'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { useExternalEventsContextValue } from 'context'
import { generateEventId } from '../../utils'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import {
  getUserGoogleCalendarsEvents,
  addEventToUserGoogleCalendar,
  deleteEventFromUserGoogleCalendar,
  updateEventFromUserGoogleCalendar,
  addWebhookToGoogleCalendar,
} from '../../google'
import {
  useGoogleValue,
  useCalendarsEventsValue,
  useThemeContextValue,
} from 'context'
import { useAuth, useUnselectedCalendarIds, useTasks } from 'hooks'
import moment from 'moment'
import './calendar.scss'
import { timeZone } from 'handleCalendars'
import {
  getEventsInfo,
  updateEventsInfo,
} from '../../backend/handleUserEventsInfo'
import { quickAddTask, handleCheckTask } from '../../backend/handleUserTasks'
import {
  GoogleEventColours,
  isValidGoogleEventColorId,
} from '../../handleColorPalette'
import { useOverlayContextValue } from 'context'
import { stripTags } from '../../handleHTML'
import { generatePushId } from 'utils'
import { getFormattedEventTime } from '../../handleMoment'
import { RRule } from 'rrule'
import { compareByFieldSpecs } from '@fullcalendar/core/internal'

const USER_SELECTED_CALENDAR = 'primary'

export const FullCalendar = () => {
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { googleCalendars } = useGoogleValue()
  const { currentUser } = useAuth()
  const { unselectedCalendarIds } = useUnselectedCalendarIds()
  const { calendarsEvents, setCalendarsEvents } = useCalendarsEventsValue()
  const [nextSyncTokens, setNextSyncTokens] = useState({})
  const [resourceIds, setResourceIds] = useState({})
  const { isLight } = useThemeContextValue()
  const { setShowDialog, setDialogProps } = useOverlayContextValue()
  const { tasks } = useTasks()

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

  const formatEventTimeLength = (timeLength) => {
    const minutes = timeLength

    // Calculate hours and minutes
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    // Format as HH:MM
    const formattedHours = ('0' + hours).slice(-2)
    const formattedMinutes = ('0' + remainingMinutes).slice(-2)

    return formattedHours + ':' + formattedMinutes
  }

  const getEventCalendarId = (eventId) => {
    let calendarId = null
    for (const key in calendarsEvents) {
      if (
        calendarsEvents[key].find(
          (calendarEvent) => calendarEvent.id === eventId,
        )
      ) {
        if (key === 'custom') {
          calendarId = USER_SELECTED_CALENDAR
        } else {
          calendarId = key
        }
        break
      }
    }
    return calendarId
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

  const getRecurringEventDuration = (eventStart, eventEnd) => {
    return Math.floor(
      moment.duration(moment(eventEnd).diff(moment(eventStart))).asMinutes(),
    )
  }

  const getFormattedRRule = (dtStart, rruleString, exdates) => {
    for (const exdate of exdates) {
      rruleString = rruleString.concat(`\nEXDATE:${exdate}`)
    }
    return `DTSTART:${dtStart}\n${rruleString}`
  }

  const getFormattedEventTimeFromExdateString = (exdateString) => {
    // Extract the timezone and date-time information from the string
    const tz = exdateString.split(':')[0].split('=')[1] // "America/Toronto"
    const dt = exdateString.split(':')[1] // "20230406T000000"

    // Create a Date object from the date-time information in the given timezone
    const date = new Date(
      dt.slice(0, 4),
      dt.slice(4, 6) - 1,
      dt.slice(6, 8),
      dt.slice(9, 11),
      dt.slice(11, 13),
      dt.slice(13, 15),
    )
    date.toLocaleString('en-US', { timeZone: tz }) // "4/6/2023, 12:00:00 AM"

    // Convert the date object to UTC format
    const utc = date.toISOString() // "2023-04-06T04:00:00.000Z"

    // Extract only the date and time information from the UTC string and remove the milliseconds
    const dtutc = utc.slice(0, 17) + '00Z' // "2023-04-06T04:00:00Z"

    // Subtract 1 day and convert to required format
    const dtreq =
      new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 8) +
      dtutc.slice(8) // "20230405T210000Z"

    return getFormattedEventTime(dtreq, false)
  }

  const getRRuleAndExdates = (strings, allDay) => {
    const rruleAndExdates = { rrule: null, exdates: [] }
    for (let i = 0; i < strings.length; i++) {
      if (!rruleAndExdates.rrule && strings[i].startsWith('RRULE')) {
        rruleAndExdates.rrule = strings[i]
      } else if (strings[i].startsWith('EXDATE')) {
        rruleAndExdates.exdates.push(
          getFormattedEventTimeFromExdateString(strings[i], allDay),
        )
      }
    }
    return rruleAndExdates // return null if no string starts with "RRULE:"
  }

  const getDayOfWeek = (date, freq) => {
    /* 0: YEARLY, 1: MONTHLY, 2: WEEKLY, 3: DAILY */
    if (freq === 0 || freq === 3) {
      return []
    }

    const dayOfWeek = date.day()
    const daysOfWeek = [
      RRule.SU,
      RRule.MO,
      RRule.TU,
      RRule.WE,
      RRule.TH,
      RRule.FR,
      RRule.SA,
    ]
    let weekday = daysOfWeek[dayOfWeek]

    if (freq === 1) {
    }

    return weekday
  }

  const updateRRule = (rruleObj, byweekday) => {
    if (rruleObj.rrule.origOptions.length > 1) return null

    rruleObj.origOptions.byweekday = byweekday
    const modifiedString = rruleObj.toString()
    return modifiedString
  }

  useEffect(() => {
    const fetchGoogleCalendarEvents = async () => {
      const googleCalendarIds = googleCalendars.map(
        (googleCalendar) => googleCalendar.id,
      )
      const { fetchedCalendarsEvents, nextSyncTokens } =
        await getUserGoogleCalendarsEvents(
          currentUser && currentUser.id,
          googleCalendarIds,
        )
      setNextSyncTokens(nextSyncTokens)
      const newCalendarsEvents = { ...calendarsEvents }

      const deletedEventInstances = {}

      for (const key in fetchedCalendarsEvents) {
        fetchedCalendarsEvents[key].map((event) => {
          if (event.status === 'cancelled') {
            const formattedEventTime = getFormattedEventTime(
              event.originalStartTime?.dateTime,
              event.originalStartTime?.date,
            )
            if (
              !Object.keys(deletedEventInstances).includes(
                event.id.split('_')[0],
              )
            ) {
              deletedEventInstances[event.id.split('_')[0]] = [
                formattedEventTime,
              ]
            } else {
              deletedEventInstances[event.id.split('_')[0]].push(
                formattedEventTime,
              )
            }
          }
        })
      }

      for (const key in fetchedCalendarsEvents) {
        const eventsData = fetchedCalendarsEvents[key].map((event) => {
          if (event.recurrence) {
            const allDay = event.start?.dateTime ? false : true
            const rruleAndExdates = getRRuleAndExdates(event.recurrence, allDay)

            console.log(event.summary, ': ', rruleAndExdates) // DEBUGGING

            const eventStart = event.start?.dateTime || event.start?.date
            const dtStart = getFormattedEventTime(eventStart, allDay)
            const eventEnd = event.end?.dateTime || event.end?.date
            const duration = getRecurringEventDuration(eventStart, eventEnd)
            const formattedDuration = formatEventTimeLength(duration)
            const formattedRRule = getFormattedRRule(
              dtStart,
              rruleAndExdates.rrule,
              [
                ...(deletedEventInstances[event.id] || []),
                ...rruleAndExdates.exdates,
              ],
            )

            const recurringEvent = {
              id: event.id,
              title: event.summary,
              url: event.htmlLink,
              rrule: formattedRRule,
              taskId: event?.extendedProperties?.shared?.taskId,
              description: stripTags(event?.description || ''),
              backgroundColor: isValidGoogleEventColorId(event.colorId)
                ? GoogleEventColours[event.colorId - 1].hex
                : GoogleEventColours[6].hex,
              duration: formattedDuration,
              rruleStr: formattedRRule, // stores current rrule for FullCalendar event, if rruleStr is non-empty string, then event is recurring
              recurrence: event.recurrence, // stores recurrence data from Google Calendar
              dtStart: dtStart, // stores start time of recurring event
            }

            if (event?.location) {
              recurringEvent.location = event?.location
            }
            if (event.conferenceData && event.conferenceData.entryPoints) {
              recurringEvent.meetLink = event.conferenceData.entryPoints[0].uri
            }
            if (event?.attendees) {
              recurringEvent.attendees = event?.attendees
            }

            return recurringEvent
          } else {
            const eventStart = event.start?.dateTime || event.start?.date
            const eventEnd = event.end?.dateTime || event.end?.date

            const nonRecurringEvent = {
              id: event.id,
              title: event.summary,
              start: eventStart,
              end: eventEnd,
              url: event.htmlLink,
              taskId: event?.extendedProperties?.shared?.taskId,
              description: stripTags(event?.description || ''),
              backgroundColor: isValidGoogleEventColorId(event.colorId)
                ? GoogleEventColours[event.colorId - 1].hex
                : GoogleEventColours[6].hex,
            }
            if (event?.location) {
              nonRecurringEvent.location = event?.location
            }
            if (event.conferenceData && event.conferenceData.entryPoints) {
              nonRecurringEvent.meetLink =
                event.conferenceData.entryPoints[0].uri
            }
            if (event?.attendees) {
              nonRecurringEvent.attendees = event?.attendees
            }

            return nonRecurringEvent
          }
        })

        newCalendarsEvents[key] = eventsData
      }

      setCalendarsEvents(newCalendarsEvents)
    }

    if (currentUser && googleCalendars.length > 0) {
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
  }, [currentUser, googleCalendars])

  const handleEventAdjustment = (event) => {
    const allDay = event.allDay
    const start = event.start
    const end = event.end
    const duration = moment(end).diff(moment(start), 'minutes')

    const rruleStr = event.extendedProps?.rruleStr || ''
    const dtStart = event.extendedProps?.dtStart || ''
    const dtStartTime = moment(dtStart)
    const dtEndTime = dtStartTime.clone().add(duration, 'minutes')
    const recurrence = event.extendedProps?.recurrence || []

    const rruleAndExdates = getRRuleAndExdates(recurrence, allDay)
    console.log('rruleAndExdates', rruleAndExdates) // DEBUGGING

    const rruleObj = RRule.fromString(rruleAndExdates.rrule)
    const freq = rruleObj.origOptions.freq
    console.log('rruleObj', rruleObj) // DEBUGGING

    const newByweekday = [getDayOfWeek(moment(start), freq)]
    console.log('newByweekday', newByweekday) // DEBUGGING

    const updatedRRule = updateRRule(rruleObj, newByweekday)
    console.log('updatedRRule', updatedRRule) // DEBUGGING

    if (!updatedRRule) return

    /*
    const calendarId = getEventCalendarId(event.id)

    const updatedGoogleCalendarEvent = {
      start: !event.allDay
        ? {
            dateTime: dtStartTime.toISOString(),
            timeZone: timeZone,
          }
        : {
            date: dtStartTime.toISOString(),
          },
      end: !event.allDay
        ? {
            dateTime: dtEndTime.toISOString(),
            timeZone: timeZone,
          }
        : {
            date: dtEndTime.toISOString(),
          },
    }

    if (rruleStr !== '') {
    }

    updateEventFromUserGoogleCalendar(
      currentUser.id,
      calendarId,
      event.id,
      updatedGoogleCalendarEvent,
    )
    */
  }

  const showEventPopup = (info, calendar) => {
    info.jsEvent.preventDefault()

    const allDay = info.event.allDay
    const taskname = info.event.title
    const taskdescription = info.event.extendedProps?.description
    const taskbackgroundcolor = info.event.backgroundColor
    const start = info.event.start
    const end = info.event.end
    const duration = moment(end).diff(moment(start), 'minutes')

    const location = info.event.extendedProps?.location || ''
    const meetLink = info.event.extendedProps?.meetLink || ''
    const attendees = info.event.extendedProps?.attendees || []
    const rruleStr = info.event.extendedProps?.rruleStr || ''
    const recurrence = info.event.extendedProps?.recurrence || []
    const dtStart = info.event.extendedProps?.dtStart || ''
    const dtStartTime = moment(dtStart)
    const dtEndTime = dtStartTime.clone().add(duration, 'minutes')

    const recurrenceId = getFormattedEventTime(start, allDay)

    const calendarId = getEventCalendarId(info.event.id)
    const eventId = info.event.id

    setDialogProps({
      allDay: allDay,
      taskname: taskname,
      taskdescription: taskdescription,
      taskbackgroundcolor: taskbackgroundcolor,
      location: location,
      meetLink: meetLink,
      attendees: attendees,
      rruleStr: rruleStr,
      eventId: eventId,
      calendarId: calendarId,
      remove: (recurringEventEditOption) => {
        /* find the id of calendar that the event belongs to */
        const calendarId = getEventCalendarId(info.event.id)
        const calendarsEventsKey =
          calendarId === 'primary' ? 'custom' : calendarId

        const exdate = `EXDATE;TZID=${timeZone}:${recurrenceId}`
        const newRecurrence = [...recurrence, exdate]

        if (rruleStr !== '' && recurringEventEditOption === 'THIS_EVENT') {
          const newRRule = rruleStr + '\nEXDATE:' + recurrenceId

          // update at calendarsEvents
          let updatedEvent = null

          const newCalendarsEvents = { ...calendarsEvents }
          newCalendarsEvents[calendarsEventsKey] = newCalendarsEvents[
            calendarsEventsKey
          ].map((event) => {
            if (event.id === info.event.id) {
              updatedEvent = {
                ...event,
                rrule: newRRule,
                rruleStr: newRRule,
                recurrence: newRecurrence,
              }
              return updatedEvent
            } else {
              return event
            }
          })

          info.event.remove()
          if (updatedEvent) {
            calendar.addEvent(updatedEvent)
          }

          const updatedGoogleCalendarEvent = {
            recurrence: newRecurrence,
          }

          // update at Google Calendar
          updateEventFromUserGoogleCalendar(
            currentUser.id,
            calendarId,
            info.event.id,
            updatedGoogleCalendarEvent,
          )
        } else {
          // remove from calendarsEvents
          const newCalendarsEvents = { ...calendarsEvents }
          for (const key in newCalendarsEvents) {
            newCalendarsEvents[key] = newCalendarsEvents[key].filter(
              (event) => event.id !== info.event.id,
            )
          }

          setCalendarsEvents(newCalendarsEvents)

          // remove from FullCalendar
          info.event.remove()

          // remove from Google Calendar
          deleteEventFromUserGoogleCalendar(
            currentUser.id,
            calendarId,
            info.event.id,
          )
        }
      },
      copy: () => {
        const id = generateEventId()

        let newEvent = null
        let newGoogleCalendarEvent = null

        if (rruleStr !== '') {
          newEvent = {
            id: id,
            duration: formatEventTimeLength(duration),
            title: info.event.title,
            backgroundColor: info.event.backgroundColor,
            rrule: rruleStr,
            rruleStr: rruleStr,
            recurrence: recurrence,
            dtStart: dtStart,
          }

          newGoogleCalendarEvent = {
            id: id,
            summary: info.event.title,
            start: !info.event.allDay
              ? {
                  dateTime: dtStartTime.toISOString(),
                  timeZone: timeZone,
                }
              : {
                  date: dtStartTime.toISOString(),
                },
            end: !info.event.allDay
              ? {
                  dateTime: dtEndTime.toISOString(),
                  timeZone: timeZone,
                }
              : {
                  date: dtEndTime.toISOString(),
                },
            recurrence: recurrence,
          }
        } else {
          newEvent = {
            id: id,
            start: info.event.startStr,
            end: info.event.endStr,
            title: info.event.title,
            backgroundColor: info.event.backgroundColor,
          }

          newGoogleCalendarEvent = {
            id: id,
            summary: info.event.title,
            start: !info.event.allDay
              ? {
                  dateTime: info.event.startStr,
                  timeZone: timeZone,
                }
              : {
                  date: info.event.startStr,
                },
            end: !info.event.allDay
              ? {
                  dateTime: info.event.endStr,
                  timeZone: timeZone,
                }
              : {
                  date: info.event.endStr,
                },
          }
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
          newGoogleCalendarEvent,
        )
      },
      backlog: async () => {
        const id = info.event.extendedProps?.taskId

        if (id) {
          /* if id exists, then remove it from scheduledTasks array in Firestore */
          const eventsInfo = await getEventsInfo(currentUser.id)
          const scheduledTasks = eventsInfo.scheduledTasks
          const newScheduledTasks = scheduledTasks.filter(
            (taskId) => taskId !== info.event.extendedProps.taskId,
          )
          updateEventsInfo(currentUser.id, {
            scheduledTasks: newScheduledTasks,
          })
        } else {
          /* if id does not exists, then create a quick task, and add it to notScheduledTasks array in Firestore */
          const taskId = generatePushId()
          const taskTimeLength = moment(info.event.end).diff(
            moment(info.event.start),
            'minutes',
          )

          await quickAddTask(
            currentUser.id,
            taskname,
            taskId,
            taskdescription,
            taskTimeLength,
            'DUPLICATE',
          )
        }
      },
      save: (
        taskName,
        taskDescription,
        backgroundColor,
        location,
        meetLink,
        attendees,
      ) => {
        // update the event in FullCalendar
        info.event.setProp('title', taskName)
        info.event.setProp('backgroundColor', backgroundColor)
        info.event.setExtendedProp('description', taskDescription)
        info.event.setExtendedProp('location', location)
        info.event.setExtendedProp('meetLink', meetLink)
        info.event.setExtendedProp('attendees', attendees)

        const calendarId = getEventCalendarId(info.event.id)
        const calendarsEventsKey =
          calendarId === 'primary' ? 'custom' : calendarId

        // update the event in calendarsEvents
        const newCalendarsEvents = { ...calendarsEvents }
        newCalendarsEvents[calendarsEventsKey] = newCalendarsEvents[
          calendarsEventsKey
        ].map((event) => {
          if (event.id === info.event.id) {
            const updatedEvent = {
              ...event,
              title: taskName,
              backgroundColor: backgroundColor,
              description: taskDescription,
            }
            if (attendees.length > 0) {
              updatedEvent.attendees = attendees
            }
            return updatedEvent
          } else {
            return event
          }
        })

        // adjust the start and end date such that it is in the same day as the original event

        // update the event in Google Calendar
        const updatedGoogleCalendarEvent = {
          summary: taskName,
          description: taskDescription,
          colorId:
            GoogleEventColours.findIndex(
              (colour) => colour.hex === backgroundColor,
            ) + 1,
          attendees: attendees,
        }

        updateEventFromUserGoogleCalendar(
          currentUser.id,
          calendarId,
          info.event.id,
          updatedGoogleCalendarEvent,
        )
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
      initialView: 'timeGridWeek', // set the default view to timeGridWeek
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00',
      googleCalendarApiKey: process.env.REACT_APP_GOOGLE_API_KEY, // replace with your API key
      drop: async function (info) {
        const draggedEvent = JSON.parse(info.draggedEl.dataset.event)

        const id = generateEventId()

        // add to FullCalendar
        const newEvent = {
          id: id,
          title: draggedEvent.name,
          start: info.date,
          allDay: info.allDay,
          end: moment(info.date)
            .add(draggedEvent.timeLength, 'minutes')
            .toDate(),
          taskId: draggedEvent.taskId,
          description: draggedEvent.description,
          backgroundColor: draggedEvent.backgroundColor,
        }
        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })

        const newGoogleCalendarEvent = {
          id: id,
          summary: draggedEvent.name,
          description: draggedEvent.description,
          start: !info.allDay
            ? {
                dateTime: info.dateStr,
                timeZone: timeZone,
              }
            : {
                date: info.dateStr,
              },
          end: !info.allDay
            ? {
                dateTime: moment(info.date)
                  .add(draggedEvent.timeLength, 'minutes')
                  .toISOString(),
                timeZone: timeZone,
              }
            : {
                date: moment(info.dateStr, 'YYYY-MM-DD')
                  .add(1, 'days')
                  .format('YYYY-MM-DD'),
              },
          extendedProperties: {
            shared: {
              taskId: draggedEvent.taskId,
            },
          },
          colorId:
            GoogleEventColours.findIndex(
              (colour) => colour.hex === draggedEvent.backgroundColor,
            ) + 1,
        }

        // add to Google Calendar
        addEventToUserGoogleCalendar(
          currentUser.id,
          USER_SELECTED_CALENDAR,
          newGoogleCalendarEvent,
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
        const id = generateEventId()

        // add to FullCalendar
        const newEvent = {
          id: id,
          title: 'New Event',
          start: info.startStr,
          end: info.endStr,
          taskId: null,
          description: '',
          backgroundColor: GoogleEventColours[6].hex,
        }

        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })

        // add to Google Calendar
        const newGoogleCalendarEvent = {
          id: id,
          summary: 'New Event',
          start: !info.allDay
            ? {
                dateTime: info.startStr,
                timeZone: timeZone,
              }
            : {
                date: info.startStr,
              },
          end: !info.allDay
            ? {
                dateTime: info.endStr,
                timeZone: timeZone,
              }
            : {
                date: info.endStr,
              },
        }

        // add to Google Calendar
        addEventToUserGoogleCalendar(
          currentUser.id,
          USER_SELECTED_CALENDAR,
          newGoogleCalendarEvent,
        )
      },
      eventResize: function (eventResizeInfo) {
        const { event } = eventResizeInfo

        handleEventAdjustment(event)
      },
      eventDrop: function (eventDropInfo) {
        const { event } = eventDropInfo

        handleEventAdjustment(event)
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
          const task = tasks.find((task) => task.taskId === taskId)
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
    unselectedCalendarIds,
    externalEventsRef,
    currentTime,
    googleCalendars,
  ])

  return <div ref={calendarRef}></div>
}
