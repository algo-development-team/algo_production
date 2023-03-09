import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { useExternalEventsContextValue } from 'context'
import { generatePushId } from '../../utils'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import { getUserGoogleCalendarsEvents } from '../../google'
import { useGoogleValue, useCalendarsEventsValue } from 'context'
import { useAuth, useUnselectedCalendarIds } from 'hooks'
import moment from 'moment'

/*
 * events cache
 * 2. use localstorge to store events, making it instantly appearing when reloading the page
 */

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

      const calendarsEventsData = {}
      calendarsEventsData.custom = []
      for (const key in fetchedCalendarsEvents) {
        const eventsData = fetchedCalendarsEvents[key].map((event) => {
          return {
            id: event.id,
            title: event.summary,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            url: event.htmlLink,
          }
        })
        calendarsEventsData[key] = eventsData
      }
      setCalendarsEvents(calendarsEventsData)

      // cache the events
      localStorage.setItem(
        'algo_calendars_events',
        JSON.stringify(calendarsEventsData),
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
        return {
          id: generatePushId(),
          title: eventEl.innerText,
        }
      },
    })

    const calendar = new Calendar(calendarRef.current, {
      height: 'calc(100vh - 64px)',
      plugins: [
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
      selectable: true,
      initialView: 'timeGridWeek', // set the default view to timeGridWeek
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00',
      googleCalendarApiKey: process.env.REACT_APP_GOOGLE_API_KEY, // replace with your API key
      drop: function (info) {
        const draggedEvent = JSON.parse(info.draggedEl.dataset.event)
        const newEvent = {
          id: generatePushId(),
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
      },
      eventClick: function (info) {
        info.jsEvent.preventDefault()
        if (window.confirm('Are you sure you want to delete this event?')) {
          // remove from state
          setCalendarsEvents({
            ...calendarsEvents,
            custom: calendarsEvents.custom.filter(
              (event) => event.id !== info.event.id,
            ),
          })
          // remove from calendar
          info.event.remove()
        }
      },
      select: function (info) {
        const newEvent = {
          id: generatePushId(),
          title: 'New Event',
          start: info.startStr,
          end: info.endStr,
        }

        setCalendarsEvents({
          ...calendarsEvents,
          custom: [...calendarsEvents.custom, newEvent],
        })
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

/*
events: {
  googleCalendarId: currentUser.email, // replace with your calendar ID
  className: 'gcal-event',
  editable: true,
  displayEventEnd: true,
  color: '#378006',
  textColor: '#fff',
  borderColor: '#378006',
}
*/
