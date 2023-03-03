import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import { useExternalEventsContextValue } from 'context'
import { useAuth } from 'hooks'

export const FullCalendar = () => {
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const { currentUser } = useAuth()

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
      height: '900px',
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        googleCalendarPlugin,
      ],
      googleCalendarApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
      eventSources: [
        {
          googleCalendarId: currentUser.email, // TEMPORARY PLACEHOLDER
        },
      ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: true,
      droppable: true,
      eventClick: function (info) {
        if (window.confirm('Are you sure you want to delete this event?')) {
          info.event.remove()
        }
      },
    })

    calendar.render()

    return () => {
      calendar.destroy()
      externalEvents.destroy()
    }
  }, [])

  return (
    <div>
      <div>
        <div ref={calendarRef}></div>
      </div>
    </div>
  )
}
