import { RRule, RRuleSet } from 'rrule'
import moment from 'moment'

const getFreq = (repeatEveryType) => {
  switch (repeatEveryType) {
    case 0:
      return RRule.YEARLY
    case 1:
      return RRule.MONTHLY
    case 2:
      return RRule.WEEKLY
    case 3:
      return RRule.DAILY
    default:
      return RRule.DAILY
  }
}

const getByweekday = (repeatsOn) => {
  const weekdays = []
  if (repeatsOn[0]) {
    weekdays.push(RRule.SU)
  }
  if (repeatsOn[1]) {
    weekdays.push(RRule.MO)
  }
  if (repeatsOn[2]) {
    weekdays.push(RRule.TU)
  }
  if (repeatsOn[3]) {
    weekdays.push(RRule.WE)
  }
  if (repeatsOn[4]) {
    weekdays.push(RRule.TH)
  }
  if (repeatsOn[5]) {
    weekdays.push(RRule.FR)
  }
  if (repeatsOn[6]) {
    weekdays.push(RRule.SA)
  }
  return weekdays
}

/***
 * repeatEvery: (1~) (interval)
 * repeatEveryType: (0: RRule.YEARLY, 1: RRule.MONTHLY, 2: RRule.WEEKLY, 3: RRule.DAILY) (freq)
 * repeatsOn: ([bool, bool, bool, bool, bool, bool, bool]) (byweekday)
 * monthlyRepeatType: ("BY_MONTHDAY", "BY_WEEKDAY")
 * endsType: ("NEVER", "ON", "AFTER")
 * endsOn: ("YYYY-MM-DD") (until)
 * endsAfter: (1~) (count)
 * ***/
export const formatRRule = (
  repeatEvery,
  repeatEveryType,
  repeatsOn,
  monthlyRepeatType,
  endsType,
  endsOn,
  endsAfter,
) => {
  const rruleObj = {
    freq: getFreq(repeatEveryType),
    interval: repeatEvery,
  }

  if (
    repeatEveryType === 2 ||
    (repeatEveryType === 1 && monthlyRepeatType === 'BY_WEEKDAY')
  ) {
    // add byweekday field
    rruleObj.byweekday = getByweekday(repeatsOn)
  }

  if (endsType === 'ON') {
    // add until field
    rruleObj.until = moment(endsOn).toDate()
  }

  if (endsType === 'AFTER') {
    // add count field
    rruleObj.count = endsAfter
  }

  return new RRule(rruleObj)
}

const getDtend = (freq, interval, dtstart) => {
  const dtend = new Date(dtstart)
  switch (
    freq // * 2 is to handle edge cases by providing a buffer of 2x the interval
  ) {
    case RRule.DAILY:
      dtend.setDate(dtend.getDate() + interval * 2)
      break
    case RRule.WEEKLY:
      dtend.setDate(dtend.getDate() + interval * 7 * 2)
      break
    case RRule.MONTHLY:
      dtend.setMonth(dtend.getMonth() + interval * 2)
      break
    case RRule.YEARLY:
      dtend.setFullYear(dtend.getFullYear() + interval * 2)
      break
    default:
      break
  }
  return dtend
}

export const findNewDtstart = (freq, interval, dtstart, rrule) => {
  // create an RRuleSet object containing the rule
  const ruleSet = new RRuleSet()
  ruleSet.rrule(rrule)

  // add one year to dtstart
  const dtend = getDtend(freq, interval, dtstart)

  const occurrences = ruleSet.between(dtstart, dtend, true)

  return occurrences[0]
}
