import { getFormattedEventTime } from './eventTimeHelpers'
import { timeZone } from '../../handleCalendars'
import { RRule } from 'rrule'
import moment from 'moment'

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

// durationStr is in the format 'HH:MM'
export const formatDuration = (durationStr) => {
  const [hoursStr, minutesStr] = durationStr.split(':')
  const hours = parseInt(hoursStr)
  const minutes = parseInt(minutesStr)
  let formattedDuration = ''
  if (hours > 0) {
    formattedDuration += `${hours}h `
  }
  if (minutes > 0) {
    formattedDuration += `${minutes}min`
  }
  if (formattedDuration === '') {
    formattedDuration = '0min'
  }
  return formattedDuration
}

const getFreq = (freqStr) => {
  switch (freqStr) {
    case 'DAILY':
      return RRule.DAILY
    case 'WEEKLY':
      return RRule.WEEKLY
    case 'MONTHLY':
      return RRule.MONTHLY
    case 'YEARLY':
      return RRule.YEARLY
    default:
      return RRule.DAILY
  }
}

const formatRRuleStringToObject = (ruleStr) => {
  const ruleStrWithoutRRule = ruleStr.split(':')[1]

  // Extract the rule options from the string
  const ruleOptions = {}
  ruleStrWithoutRRule.split(';').forEach((option) => {
    const [key, value] = option.split('=')
    ruleOptions[key] = value
  })

  const ruleObj = {
    freq: getFreq(ruleOptions.FREQ),
    interval: parseInt(ruleOptions.INTERVAL),
  }

  if (ruleOptions?.BYDAY) {
    const byDay = ruleOptions.BYDAY.split(',')
    ruleObj.byweekday = byDay.map((day) => RRule[day])
  }

  if (ruleOptions?.COUNT) {
    ruleObj.count = parseInt(ruleOptions.COUNT)
  }

  if (ruleOptions?.UNTIL) {
    ruleObj.until = moment(ruleOptions.UNTIL).toDate()
  }

  // Create the RRule object
  const rule = new RRule(ruleObj)

  return rule
}

export const formatRecurrence = (dtStart, recurrence, allDay) => {
  const rruleAndExdates = getRRuleAndExdates(recurrence, allDay)
  const rule = formatRRuleStringToObject(rruleAndExdates.rrule)

  console.log('rule', rule) // DEBUGGING

  const freq = rule.origOptions.freq
  const interval = rule.origOptions.interval
  const byDay = rule.origOptions?.byweekday || []
  const count = rule.origOptions?.count || null
  const until = rule.origOptions?.until || null

  console.log('freq', freq) // DEBUGGING

  let daysOfWeek = ''
  byDay.forEach((day) => {
    const formattedDay =
      day.toString().charAt(0) + day.toString().charAt(1).toLowerCase()
    daysOfWeek += `${formattedDay}, `
  })
  daysOfWeek = daysOfWeek.slice(0, -2)

  const startDate = moment(dtStart).toDate()

  let description = `Repeat every ${interval}`

  if (freq === RRule.DAILY) {
    description += ' day'
  } else if (freq === RRule.WEEKLY) {
    description += ' week'
  } else if (freq === RRule.MONTHLY) {
    description += ' month'
  } else if (freq === RRule.YEARLY) {
    description += ' year'
  }

  if (interval > 1) {
    description += 's'
  }
  description += ` on ${daysOfWeek}`

  const formattedStartDate = startDate.toLocaleDateString()
  description += ` from ${formattedStartDate}`

  if (count) {
    description += ` for ${count} occurrence`
    if (count > 1) {
      description += 's'
    }
  } else if (until) {
    const formattedEndDate = until.toLocaleDateString()
    description += ` until ${formattedEndDate}`
  }

  return description
}

// startDate and endDate are Moment.js objects
export const getFormattedDurationFromTimeRange = (startDate, endDate) => {
  // Calculate the duration between the two dates
  const duration = moment.duration(endDate.diff(startDate))

  // Format the duration as Xh Ymin
  let formattedDuration = ''
  const hours = Math.floor(duration.asHours())
  const minutes = duration.minutes()
  if (hours > 0) {
    formattedDuration += `${hours}h `
  }
  if (minutes > 0) {
    formattedDuration += `${minutes}min`
  }
  if (formattedDuration === '') {
    formattedDuration = '0min'
  }

  return formattedDuration
}
