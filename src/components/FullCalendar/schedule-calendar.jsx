import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuth } from 'hooks'
import { useThemeContextValue } from 'context'

export const ScheduleCalendar = () => {
  const calendarRef = useRef(null)
  const { currentUser } = useAuth()
  const { isLight } = useThemeContextValue()

  useEffect(() => {
    if (!currentUser) return null

    const calendar = new Calendar(calendarRef.current, {
      height: 'calc(100vh - 64px)',
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      headerToolbar: {
        start: '',
        center: '',
        end: '',
      },
      headerContent: function (info) {
        return 'Family'
      },
      editable: true,
      droppable: true,
      dayMaxEventRows: true,
      views: {
        timeGrid: {
          dayMaxEventRows: 3, // adjust to 6 only for timeGridWeek/timeGridDay
        },
      },
      selectable: true,
      initialView: 'timeGridWeek', // set the default view to timeGridWeek
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00',
      select: function (info) {},
      eventResize: function (info) {},
      eventDrop: function (info) {},
      events: [],
      allDaySlot: false,
      handleWindowResize: true,
      eventBorderColor: isLight ? '#fff' : '#1f1f1f',
      initialDate: '2023-01-01',
      dayHeaderFormat: { weekday: 'short' },
    })

    calendar.render()

    return () => {
      calendar.destroy()
    }
  }, [isLight, currentUser])

  return <div ref={calendarRef}></div>
}
