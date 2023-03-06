import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { useExternalEventsContextValue, useGoogleValue } from 'context'
import { generatePushId } from '../../utils'

export const FullCalendar = () => {
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const { googleCalendars } = useGoogleValue()
  const [events, setEvents] = useState([])

  useEffect(() => {
    console.log('googleCalendars:', googleCalendars) // TESTING
  }, [googleCalendars])

  useEffect(() => {
    console.log('events', events) // TESTING
  }, [events])

  useEffect(() => {
    const externalEvents = new Draggable(externalEventsRef.current, {
      itemSelector: '.fc-event',
      eventData: function (eventEl) {
        return {
          title: eventEl.innerText,
        }
      },
    })

    const calendar = new Calendar(calendarRef.current, {
      height: 'calc(100vh - 64px)',
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
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
      eventClick: function (info) {
        if (window.confirm('Are you sure you want to delete this event?')) {
          // remove from calendar
          info.event.remove()
          // remove from state
          setEvents(events.filter((event) => event.id !== info.event.id))
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
      slotMinHeight: 20,
    })

    calendar.render()

    return () => {
      calendar.destroy()
      externalEvents.destroy()
    }
  }, [events, externalEventsRef])

  return (
    <div>
      <div>
        <div ref={calendarRef}></div>
      </div>
    </div>
  )
}
