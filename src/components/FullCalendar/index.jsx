import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { useExternalEventsContextValue } from 'context'
import { generatePushId } from '../../utils'

export const FullCalendar = () => {
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const [events, setEvents] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

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
  }, [events, externalEventsRef, currentTime])

  return (
    <div>
      <div ref={calendarRef}></div>
    </div>
  )
}
