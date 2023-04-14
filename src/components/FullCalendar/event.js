import {
  formatDuration,
  formatRecurrence,
  getFormattedDurationFromTimeRange,
} from './rruleHelpers'
import moment from 'moment'

export class ShortEvent {
  constructor(id, title, start, end) {
    this.id = id
    this.title = title
    this.start = start
    this.end = end
  }
}
class Event {
  constructor(
    id,
    title,
    backgroundColor,
    description,
    location,
    meetLink,
    attendees,
    taskId,
    recurring,
  ) {
    this.id = id
    this.title = title
    this.backgroundColor = backgroundColor
    this.description = description
    this.location = location
    this.meetLink = meetLink
    this.attendees = attendees
    this.taskId = taskId
    this.recurring = recurring
  }

  setTitle(title) {
    this.title = title
  }

  setDescription(description) {
    this.description = description
  }
}

export class NonRecurringEvent extends Event {
  constructor(
    id,
    title,
    backgroundColor,
    description,
    location,
    meetLink,
    attendees,
    taskId,
    start,
    end,
  ) {
    super(
      id,
      title,
      backgroundColor,
      description,
      location,
      meetLink,
      attendees,
      taskId,
      false,
    )
    this.start = start
    this.end = end
  }

  updateNonRecurringFields(start, end) {
    this.start = start
    this.end = end
  }

  getScheduledEventsInfo() {
    const { start, end } = this

    // Parse the date strings into Moment.js objects
    const startDate = moment(start)
    const endDate = moment(end)

    // Format the dates without the year
    const formattedStartDate = startDate.format('MMM D, h:mm A')
    const formattedEndDate = endDate.format('MMM D, h:mm A')
    const formattedDuration = getFormattedDurationFromTimeRange(
      startDate,
      endDate,
    )

    return {
      formattedDuration: formattedDuration,
      formattedTimeRange: `${formattedStartDate} to ${formattedEndDate}`,
    }
  }
}

export class RecurringEvent extends Event {
  constructor(
    id,
    title,
    backgroundColor,
    description,
    location,
    meetLink,
    attendees,
    taskId,
    rrule,
    duration,
    dtStart,
    recurrence,
  ) {
    super(
      id,
      title,
      backgroundColor,
      description,
      location,
      meetLink,
      attendees,
      taskId,
      true,
    )
    this.rrule = rrule
    this.duration = duration
    this.dtStart = dtStart
    this.rruleStr = rrule
    this.recurrence = recurrence
  }

  updateRecurringFields(rrule, duration, dtStart, recurrence) {
    this.rrule = rrule
    this.duration = duration
    this.dtStart = dtStart
    this.rruleStr = rrule
    this.recurrence = recurrence
  }

  getScheduledEventsInfo() {
    const { allDay, dtStart, duration, recurrence } = this

    const formattedDuration = formatDuration(duration)
    const formattedRecurrence = formatRecurrence(dtStart, recurrence, allDay)

    return {
      formattedDuration: formattedDuration,
      formattedTimeRange: formattedRecurrence,
    }
  }
}
