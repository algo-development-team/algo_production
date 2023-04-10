Recurring Event:

```ts
{
  // default event properties
  id: string,
  title: string,
  backgroundColor: string (hex),

  // recurring event properties
  rrule: string (RRule.toString()),
  duration: string (mm:ss format),
  dtStart: string (ISO8601), (extendedProps)
  rruleStr: string (RRule.toString()), (extendedProps)
  recurrence: string[] (RRule.toString()[]), (extendedProps)

  // default event extended properties
  description: string, (extendedProps)
  location: string, (extendedProps)
  meetLink: string (URL), (extendedProps)
  attendees: string[] (email[]), (extendedProps)
  taskId: string | null, (extendedProps)

  // recurring identifier
  recurring: boolean (true), (extendedProps)
}
```

Note: since rrule property is not accessible in FullCalendar event object, we need to store it in extendedProps

Non-Recurring Event:

```ts
{
  // default event properties
  id: string,
  title: string,
  backgroundColor: string (hex),

  // non-recurring event properties
  start: string (ISOString),
  end: string (ISOString),

  // default event extended properties
  description: string, (extendedProps)
  location: string, (extendedProps)
  meetLink: string (URL), (extendedProps)
  attendees: string[] (email[]), (extendedProps)
  taskId: string | null, (extendedProps)

  // recurring identifier
  recurring: boolean (false), (extendedProps)
}
```

---

Recurring Event Extended Props (info.event object schema):

```ts
{
  attendees: string[] (email[])
  description: string
  dtStart: string (ISO8601)
  location: string
  meetLink: string (URL)
  recurrence: string[] (RRule.toString()[])
  recurring: boolean
  rruleStr: string (RRule.toString())
  taskId: string | null
}
```

Non-Recurring Event Extended Props (info.event object schema):

```ts
{
  attendees: string[] (email[])
  description: string
  location: string
  meetLink: string (URL)
  recurring: boolean
  taskId: string | null
}
```
