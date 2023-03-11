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
} from '../../google'
import { useGoogleValue, useCalendarsEventsValue } from 'context'
import { useAuth, useUnselectedCalendarIds } from 'hooks'
import moment from 'moment'
import './calendar.scss'
import { timeZone } from 'handleCalendars'
import { RRule } from 'rrule'

export const FullCalendar = () => {
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { googleCalendars } = useGoogleValue()
  const { currentUser } = useAuth()
  const { unselectedCalendarIds } = useUnselectedCalendarIds()
  const { calendarsEvents, setCalendarsEvents } = useCalendarsEventsValue()

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
      const fetchedCalendarsEvents = await getUserGoogleCalendarsEvents(
        currentUser.id,
        googleCalendarIds,
      )
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
      eventBorderColor: '#3788D8',
      initialView: 'timeGridWeek', // set the default view to timeGridWeek
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00',
      googleCalendarApiKey: process.env.REACT_APP_GOOGLE_API_KEY, // replace with your API key
      drop: function (info) {
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
        }

        addEventToUserGoogleCalendar(currentUser.id, newGoogleCalendarEvent)
      },
      eventClick: function (info) {
        info.jsEvent.preventDefault()

        // delete from FullCalendar
        if (window.confirm('Are you sure you want to delete this event?')) {
          // remove from state
          // iterate through all calendar events keys and remove the event from the correct calendar
          const newCalendarsEvents = { ...calendarsEvents }
          for (const key in newCalendarsEvents) {
            newCalendarsEvents[key] = newCalendarsEvents[key].filter(
              (event) => event.id !== info.event.id,
            )
          }

          setCalendarsEvents(newCalendarsEvents)
          // remove from calendar
          info.event.remove()

          // delete from Google Calendar
          deleteEventFromUserGoogleCalendar(currentUser.id, info.event.id)
        }
      },
      select: function (info) {
        const id = generateEventId()

        // add to FullCalendar
        const newEvent = {
          id: id,
          title: 'New Event',
          start: info.startStr,
          end: info.endStr,
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

        addEventToUserGoogleCalendar(currentUser.id, newGoogleCalendarEvent)
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

        updateEventFromUserGoogleCalendar(
          currentUser.id,
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

        updateEventFromUserGoogleCalendar(
          currentUser.id,
          event.id,
          updatedGoogleCalendarEvent,
        )
      },
      events: getSelectedCalendarsEvents(calendarsEvents),
      now: new Date(), // set the current time
      nowIndicator: true, // display a red line through the current time
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
    calendarsEvents,
    unselectedCalendarIds,
    externalEventsRef,
    currentTime,
    googleCalendars,
  ])

  return (
    <div>
      <div ref={calendarRef}></div>
    </div>
  )
}
