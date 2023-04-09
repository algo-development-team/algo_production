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
}
