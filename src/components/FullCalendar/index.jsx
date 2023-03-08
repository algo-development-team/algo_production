import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { useExternalEventsContextValue } from 'context'
import { generatePushId } from '../../utils'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import { getUserGoogleCalendarEvents } from '../../google'
import { useGoogleValue } from 'context'
import { useAuth } from 'hooks'
import moment from 'moment'

export const FullCalendar = () => {
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const [events, setEvents] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const { googleCalendars } = useGoogleValue()
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchGoogleCalendarEvents = async () => {
      const googleCalendarIds = googleCalendars.map(
        (googleCalendar) => googleCalendar.id,
      )
      const fetchedEvents = await getUserGoogleCalendarEvents(
        currentUser.id,
        googleCalendarIds,
      )
      console.log('fetchedEvents:', fetchedEvents) // TESTING
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
        setEvents([...events, newEvent])
      },
      eventClick: function (info) {
        info.jsEvent.preventDefault()
        if (window.confirm('Are you sure you want to delete this event?')) {
          // remove from state
          setEvents(events.filter((event) => event.id !== info.event.id))
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

        setEvents([...events, newEvent])
      },
      events: events,
      eventSources: googleCalendars.map((googleCalendar) => {
        return {
          googleCalendarId: googleCalendar.id,
          className: 'gcal-event',
          editable: true,
          displayEventEnd: true,
        }
      }),
      now: new Date(), // set the current time
      nowIndicator: true, // display a red line through the current time
    })

    calendar.render()

    // Update the current time every 5 minutes
    const intervalId = setInterval(() => {
      setCurrentTime(new Date())
    }, 5 * 60 * 1000) // 5 minutes in milliseconds

    // Refresh the events every 5 minutes
    setInterval(() => {
      calendar.getEventSources().forEach((eventSource) => {
        eventSource.refetch()
      })
    }, 5 * 60 * 1000)

    return () => {
      calendar.destroy()
      externalEvents.destroy()
      clearInterval(intervalId)
    }
  }, [events, externalEventsRef, currentTime, googleCalendars])

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
