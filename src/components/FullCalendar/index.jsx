import { useRef, useEffect, useState, useContext } from 'react'
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
import './calendar.scss'
import { useOverlayContextValue } from 'context'
import { CalendarContainer } from 'react-datepicker'
import { CopyValue } from 'context/CopyContext.js'

export const FullCalendar = () => {
  const [view, setView] = useState(`dayGridWeek`)
  const [infoEvent, setInfoEvent] = useState(null)
  const { C, setC } = CopyValue()
  const calendarRef = useRef(null)
  const { externalEventsRef } = useExternalEventsContextValue()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { googleCalendars } = useGoogleValue()
  const { currentUser } = useAuth()
  const { unselectedCalendarIds } = useUnselectedCalendarIds()
  const { calendarsEvents, setCalendarsEvents } = useCalendarsEventsValue()
  const { setShowDialog, setDialogProps } = useOverlayContextValue()
  const [count, setCount] = useState(0)

  

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
      const newCalendarsEvents = { ...calendarsEvents }
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
          id: generatePushId(),
          title: eventEl.innerText,
          duration: `00:${draggedEvent.timeLength}`,
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
      dayMaxEventRows: true,
      views: {
        timeGrid: {
          dayMaxEventRows: 6 // adjust to 6 only for timeGridWeek/timeGridDay
        }
      },    
      scrollTimeReset: false,
      scrollTime: "12:00",
      selectable: true,
      eventBorderColor: '#3788D8',
      initialView: `${view}`, // set the default view to timeGridWeek
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
      datesSet: function(info) {
        setView(info.view.type)
      },
      eventClick: function (info) {
        setInfoEvent(info.event)
        info.jsEvent.preventDefault();
        const clickedEvent = info.event;

        const taskname = clickedEvent.title;
        const taskdescription = clickedEvent.description;
        const start = new Date(clickedEvent.start);
        const end = new Date(clickedEvent.end);

        setDialogProps({ taskname: taskname, taskdescription: taskdescription, info: info, start: start, end: end });
        setShowDialog('BLOCK')
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

    if(C == true){
      const copiedEvent = {...infoEvent};
      calendar.addEvent(copiedEvent);
      console.log(copiedEvent);
      setC(false);
    }
    
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
    C,
  ])

  return (
    <div>
      <div ref={calendarRef}></div>
    </div>
  )
}


// drop: function (info) {
//   const draggedEvent = JSON.parse(info.draggedEl.dataset.event)
//   const newEvent = {
//     id: generatePushId(),
//     title: draggedEvent.name,
//     start: info.date,
//     allDay: info.allDay,
//     end: moment(info.date)
//       .add(draggedEvent.timeLength, 'minutes')
//       .toDate(),
//   }
//   setCalendarsEvents({
//     ...calendarsEvents,
//     custom: [...calendarsEvents.custom, newEvent],
//   })
// },
// eventClick: function (info) {
//   info.jsEvent.preventDefault()
//   if (window.confirm('Are you sure you want to delete this event?')) {
//     // remove from state
//     setCalendarsEvents({
//       ...calendarsEvents,
//       custom: calendarsEvents.custom.filter(
//         (event) => event.id !== info.event.id,
//       ),
//     })
//     // remove from calendar
//     info.event.remove()
//   }
// },
// select: function (info) {
//   const newEvent = {
//     id: generatePushId(),
//     title: 'New Event',
//     start: info.startStr,
//     end: info.endStr,
//   }

//   setCalendarsEvents({
//     ...calendarsEvents,
//     custom: [...calendarsEvents.custom, newEvent],
//   })
// },
// events: getSelectedCalendarsEvents(calendarsEvents),
// now: new Date(), // set the current time
// nowIndicator: true, // display a red line through the current time
// })

// calendar.render()