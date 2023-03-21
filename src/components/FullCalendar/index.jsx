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
import { useAuth, useUnselectedCalendarIds } from 'hooks'
import moment from 'moment'
import './calendar.scss'
import { timeZone } from 'handleCalendars'
import { RRule } from 'rrule'
import {
  getEventsInfo,
  updateEventsInfo,
} from '../../backend/handleUserEventsInfo'
import { quickAddTask } from '../../backend/handleUserTasks'
import { getHighlightBlue } from '../../handleColorPalette'
import { useOverlayContextValue } from 'context'
import { stripTags } from '../../handleHTML'
import { generatePushId } from 'utils'

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

  const getSelectedCalendarsEvents = (mixedCalendarsEvents) => {
    let events = []
    for (const key in mixedCalendarsEvents) {
      if (!unselectedCalendarIds.includes(key)) {
        events = events.concat(mixedCalendarsEvents[key])
      }
    }

    return events
  }

  const mapWeekday = (weekday) => {
    const mapping = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
    return mapping[weekday]
  }

  const mapFreq = (freq) => {
    const mapping = ['yearly', 'monthly', 'weekly', 'daily']
    return mapping[freq]
  }

  useEffect(() => {
    const fetchGoogleCalendarEvents = async () => {
      const cachedCalendarsEvents = localStorage.getItem(
        'algo_calendars_events',
      )
      if (cachedCalendarsEvents) {
        setCalendarsEvents(JSON.parse(cachedCalendarsEvents))
      }

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
      for (const key in fetchedCalendarsEvents) {
        const eventsData = fetchedCalendarsEvents[key].map((event) => {
          if (event.recurrence) {
            const rule = new RRule.fromString(
              event.recurrence[event.recurrence.length - 1],
            )
            const recurrenceObject = rule.origOptions

            const recurringEvent = {
              id: event.id,
              title: event.summary,
              rrule: {
                freq: mapFreq(recurrenceObject.freq),
                dtstart: event.start?.dateTime || event.start?.date,
              },
              url: event.htmlLink,
              taskId: event?.extendedProperties?.shared?.taskId,
              description: stripTags(event?.description || ''),
            }

            if (recurrenceObject.interval) {
              recurringEvent.rrule.interval = recurrenceObject.interval
            }

            if (recurrenceObject.byweekday) {
              recurringEvent.rrule.byweekday = recurrenceObject.byweekday.map(
                ({ weekday }) => mapWeekday(weekday),
              )
            }

            if (recurrenceObject.until) {
              recurringEvent.rrule.until = moment(
                recurrenceObject.until,
              ).format('YYYY-MM-DD')
            }

            return recurringEvent
          } else {
            const nonRecurringEvent = {
              id: event.id,
              title: event.summary,
              start: event.start?.dateTime || event.start?.date,
              end: event.end?.dateTime || event.end?.date,
              url: event.htmlLink,
              taskId: event?.extendedProperties?.shared?.taskId,
              description: stripTags(event?.description || ''),
            }

            return nonRecurringEvent
          }
        })

        newCalendarsEvents[key] = eventsData
      }
      setCalendarsEvents(newCalendarsEvents)

      // cache the events
      localStorage.setItem(
        'algo_calendars_events',
        JSON.stringify(newCalendarsEvents),
      )
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

  useEffect(() => {
    const externalEvents = new Draggable(externalEventsRef.current, {
      itemSelector: '.fc-event',
      eventData: function (eventEl) {
        const draggedEvent = JSON.parse(eventEl.dataset.event)
        return {
          id: generateEventId(),
          title: eventEl.innerText,
          duration: `00:${draggedEvent.timeLength}`,
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
        }
        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })

        const newGoogleCalendarEvent = {
          id: id,
          summary: draggedEvent.name,
          description: draggedEvent.description,
          start: {
            dateTime: info.dateStr,
            timeZone: timeZone,
          },
          end: {
            dateTime: moment(info.date)
              .add(draggedEvent.timeLength, 'minutes')
              .toISOString(),
            timeZone: timeZone,
          },
          extendedProperties: {
            shared: {
              taskId: draggedEvent.taskId,
            },
          },
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
        info.jsEvent.preventDefault()

        const taskname = info.event.title
        const taskdescription = info.event.extendedProps?.description
        const start = new Date(info.event.start)
        const end = new Date(info.event.end)

        setDialogProps({
          taskname: taskname,
          taskdescription: taskdescription,
          remove: () => {
            const newCalendarsEvents = { ...calendarsEvents }
            for (const key in newCalendarsEvents) {
              newCalendarsEvents[key] = newCalendarsEvents[key].filter(
                (event) => event.id !== info.event.id,
              )
            }

            setCalendarsEvents(newCalendarsEvents)
            // remove from calendar
            info.event.remove()

            /* find the id of calendar that the event belongs to */
            let calendarId = null
            for (const key in calendarsEvents) {
              if (
                calendarsEvents[key].find(
                  (calendarEvent) => calendarEvent.id === info.event.id,
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

            // delete from Google Calendar
            deleteEventFromUserGoogleCalendar(
              currentUser.id,
              calendarId,
              info.event.id,
            )
          },
          copy: () => {
            const id = generateEventId()
            const newEvent = {
              end: info.event.endStr,
              id: id,
              start: info.event.startStr,
              title: info.event.title,
            }

            setCalendarsEvents({
              ...calendarsEvents,
              custom: [...calendarsEvents.custom, newEvent],
            })
            calendar.addEvent(newEvent)

            // add to Google Calendar
            const newGoogleCalendarEvent = {
              id: id,
              summary: info.event.title,
              start: {
                dateTime: info.event.startStr,
                timeZone: timeZone,
              },
              end: {
                dateTime: info.event.endStr,
                timeZone: timeZone,
              },
            }

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
              )
            }
          },
          start: start,
          end: end,
        })
        setShowDialog('BLOCK')
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
        }

        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })

        // add to Google Calendar
        const newGoogleCalendarEvent = {
          id: id,
          summary: 'New Event',
          start: {
            dateTime: info.startStr,
            timeZone: timeZone,
          },
          end: {
            dateTime: info.endStr,
            timeZone: timeZone,
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

        const updatedGoogleCalendarEvent = {
          start: {
            dateTime: event.startStr,
            timeZone: timeZone,
          },
          end: {
            dateTime: event.endStr,
            timeZone: timeZone,
          },
        }

        /* find the id of calendar that the event belongs to */
        let calendarId = null
        for (const key in calendarsEvents) {
          if (
            calendarsEvents[key].find(
              (calendarEvent) => calendarEvent.id === event.id,
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

        updateEventFromUserGoogleCalendar(
          currentUser.id,
          calendarId,
          event.id,
          updatedGoogleCalendarEvent,
        )
      },
      eventDrop: function (eventDropInfo) {
        const { event } = eventDropInfo

        const updatedGoogleCalendarEvent = {
          start: {
            dateTime: event.startStr,
            timeZone: timeZone,
          },
          end: {
            dateTime: event.endStr,
            timeZone: timeZone,
          },
        }

        /* find the id of calendar that the event belongs to */
        let calendarId = null
        for (const key in calendarsEvents) {
          if (
            calendarsEvents[key].find(
              (calendarEvent) => calendarEvent.id === event.id,
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

        updateEventFromUserGoogleCalendar(
          currentUser.id,
          calendarId,
          event.id,
          updatedGoogleCalendarEvent,
        )
      },
      events: getSelectedCalendarsEvents(calendarsEvents),
      now: new Date(), // set the current time
      nowIndicator: true, // display a red line through the current time
      handleWindowResize: true,
      eventBackgroundColor: getHighlightBlue(isLight),
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
