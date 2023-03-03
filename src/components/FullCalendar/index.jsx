import React, { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import googleCalendarPlugin from '@fullcalendar/google-calendar'

export const FullCalendar = () => {
  const [fix, setFix] = useState(false)
  // for fixing events and preventing them from moving during autoscheduling
  const externalEventsRef = useRef(null)
  const calendarRef = useRef(null)
  const checkboxRef = useRef(null)

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
      height: '450px',
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        googleCalendarPlugin,
      ],
      // googleCalendarApiKey: '<YOUR API KEY>',
      // eventSources: [
      //   {
      //     googleCalendarId: 'abcd1234@group.calendar.google.com'
      //   },
      //   {
      //     googleCalendarId: 'efgh5678@group.calendar.google.com',
      //     className: 'nice-event'
      //   }
      // ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: true,
      droppable: true,
      drop: function (info) {
        if (checkboxRef.current.checked) {
          info.draggedEl.parentNode.removeChild(info.draggedEl)
        }
      },
      eventClick: function (info) {
        // if(fix == true) {
        //   ...
        // }
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
      <div ref={externalEventsRef}>
        <p>
          <strong>Draggable Events</strong>
        </p>
        <div
          className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
          style={{ maxWidth: '100px' }}
        >
          <div className='fc-event-main'>My Event 1</div>
        </div>
        <div
          className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
          style={{ maxWidth: '100px' }}
        >
          <div className='fc-event-main'>My Event 2</div>
        </div>
        <div
          className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
          style={{ maxWidth: '100px' }}
        >
          <div className='fc-event-main'>My Event 3</div>
        </div>
        <div
          className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
          style={{ maxWidth: '100px' }}
        >
          <div className='fc-event-main'>My Event 4</div>
        </div>
        <div
          className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
          style={{ maxWidth: '100px' }}
        >
          <div className='fc-event-main'>My Event 5</div>
        </div>
        <p>
          <input type='checkbox' id='drop-remove' ref={checkboxRef} />
          <label htmlFor='drop-remove'>remove after drop</label>
        </p>
      </div>

      <div>
        <div ref={calendarRef}></div>
      </div>
    </div>
  )
}
