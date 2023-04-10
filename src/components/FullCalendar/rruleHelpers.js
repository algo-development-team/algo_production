import { getFormattedEventTime } from './eventTimeHelpers'
import { timeZone } from '../../handleCalendars'

export const getRRuleDeleteThisEvent = (rruleStr, recurrenceId) => {
  return rruleStr + '\nEXDATE:' + recurrenceId
}

export const getRecurrenceDeleteThisEvent = (recurrence, recurrenceId) => {
  const exdate = `EXDATE;TZID=${timeZone}:${recurrenceId}`
  const newRecurrence = [exdate, ...recurrence]
  return newRecurrence
}

export const getRecurrenceFromPrevNonRecurringEvent = (newRRuleStr) => {
  return [newRRuleStr]
}

export const getRecurrenceFromPrevRecurringEvent = (
  oldRecurrence,
  newRRuleStr,
  allDay,
) => {
  const rruleAndExdates = getRRuleAndExdates(oldRecurrence, allDay)
  const formattedExdates = rruleAndExdates.exdates.map((exdate) => {
    return `EXDATE;TZID=${timeZone}:${exdate}`
  })
  const newRecurrence = [...formattedExdates, newRRuleStr]
  return newRecurrence
}

export const extractValuesFromNameValuePairs = (nameValuePairs) => {
  return nameValuePairs.map((nameValuePair) => {
    return nameValuePair.split(':')[1]
  })
}

export const destructRRuleStr = (rruleStr) => {
  const rruleStrArr = rruleStr.split('\n')
  const rruleStrObj = {
    dtstart: rruleStrArr[0],
    rrule: rruleStrArr[1],
    exdates: rruleStrArr.slice(2),
  }
  return rruleStrObj
}

export const getFormattedRRule = (dtStart, rruleString, exdates) => {
  for (const exdate of exdates) {
    rruleString = rruleString.concat(`\nEXDATE:${exdate}`)
  }
  return `DTSTART:${dtStart}\n${rruleString}`
}

const getFormattedEventTimeFromExdateString = (exdateString) => {
  const tz = exdateString.split(':')[0].split('=')[1] // "America/Toronto"
  const dt = exdateString.split(':')[1] // "20230406T000000"
  const date = new Date(
    dt.slice(0, 4),
    dt.slice(4, 6) - 1,
    dt.slice(6, 8),
    dt.slice(9, 11),
    dt.slice(11, 13),
    dt.slice(13, 15),
  )
  date.toLocaleString('en-US', { timeZone: tz }) // "4/6/2023, 12:00:00 AM"
  const utc = date.toISOString() // "2023-04-06T04:00:00.000Z"
  const dtutc = utc.slice(0, 17) + '00Z' // "2023-04-06T04:00:00Z"
  const dtreq =
    new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 8) +
    dtutc.slice(8) // "20230405T210000Z"

  return getFormattedEventTime(dtreq, false)
}

export const getRRuleAndExdates = (strings, allDay) => {
  const rruleAndExdates = { rrule: null, exdates: [] }
  for (let i = 0; i < strings.length; i++) {
    if (!rruleAndExdates.rrule && strings[i].startsWith('RRULE')) {
      rruleAndExdates.rrule = strings[i]
    } else if (strings[i].startsWith('EXDATE')) {
      rruleAndExdates.exdates.push(
        getFormattedEventTimeFromExdateString(strings[i], allDay),
      )
    }
  }
  return rruleAndExdates // return null if no string starts with "RRULE:"
}

export const updateDtStartInRRuleStr = (rruleStr, newDtStart) => {
  const nonDtstartRRuleStr = rruleStr.split('\n')[1]
  return `DTSTART:${newDtStart}\n${nonDtstartRRuleStr}`
}
