import { useRef, useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuth, useSchedules } from 'hooks'
import { useThemeContextValue } from 'context'
import { ShortEvent } from './event'
import { GoogleEventColours } from '../../handleColorPalette'
import { generateEventId } from '../../utils'
import { updateUserInfo } from '../../backend/handleUserInfo'

export const ScheduleCalendar = ({ scheduleId }) => {
  const calendarRef = useRef(null)
  const { currentUser } = useAuth()
  const { isLight } = useThemeContextValue()
  const { schedules } = useSchedules()
  const [events, setEvents] = useState([])
  const [scheduleName, setScheduleName] = useState('')

  const getUpdatedSchedules = (events) => {
    const convertedEvents = events.map((event) => {
      return JSON.parse(JSON.stringify(event))
    })

    return schedules.map((schedule) => {
      if (schedule.id === scheduleId) {
        return { ...schedule, events: convertedEvents }
      }
      return schedule
    })
  }

  useEffect(() => {
    if (schedules) {
      const schedule = schedules.find((schedule) => schedule.id === scheduleId)
      if (schedule) {
        setEvents(schedule.events)
        setScheduleName(schedule.name)
      }
    }
  }, [schedules, scheduleId])

  useEffect(() => {
    if (!currentUser) return null

    const calendar = new Calendar(calendarRef.current, {
      height: 'calc(100vh - 100px)',
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      headerToolbar: {
        start: '',
        center: '',
        end: '',
      },
      editable: true,
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
      select: function (info) {
        const id = generateEventId()
        const start = info.startStr
        const end = info.endStr

        const newEvent = new ShortEvent(id, 'Time Slot', start, end)
        const newEvents = [...events, newEvent]

        setEvents(newEvents)

        const updatedSchedules = getUpdatedSchedules(newEvents)
        updateUserInfo(currentUser.id, { schedules: updatedSchedules })
      },
      eventResize: function (info) {
        const { start, end } = info.event
        const newEvents = events.map((event) => {
          if (event.id === info.event.id) {
            return { ...event, start, end }
          }
          return event
        })
        setEvents(newEvents)

        const updatedSchedules = getUpdatedSchedules(newEvents)
        updateUserInfo(currentUser.id, { schedules: updatedSchedules })
      },
      eventDrop: function (info) {
        const { start, end } = info.event
        const newEvents = events.map((event) => {
          if (event.id === info.event.id) {
            return { ...event, start, end }
          }
          return event
        })
        setEvents(newEvents)

        const updatedSchedules = getUpdatedSchedules(newEvents)
        updateUserInfo(currentUser.id, { schedules: updatedSchedules })
      },
      eventClick: (info) => {
        // Ask for confirmation before deleting the event
        if (
          window.confirm(`Are you sure you want to delete ${info.event.title}?`)
        ) {
          const newEvents = events.filter((event) => event.id !== info.event.id)
          setEvents(newEvents)

          info.event.remove()

          const updatedSchedules = getUpdatedSchedules(newEvents)
          updateUserInfo(currentUser.id, { schedules: updatedSchedules })
        }
      },
      events: events,
      allDaySlot: false,
      handleWindowResize: true,
      eventBorderColor: isLight ? '#fff' : '#1f1f1f',
      eventBackgroundColor: GoogleEventColours[6].hex,
      initialDate: '2023-01-01',
      dayHeaderFormat: { weekday: 'short' },
    })

    calendar.render()

    return () => {
      calendar.destroy()
    }
  }, [isLight, currentUser, events])

  return (
    <>
      <div
        style={{
          height: '36px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 0,
        }}
      >
        <h1>{scheduleName}</h1>
      </div>
      <div ref={calendarRef}></div>
    </>
  )
}
