import { RRule } from 'rrule'
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
  }

  if (endsType === 'ON') {
    // add until field
  }

  if (endsType === 'AFTER') {
    // add count field
  }

  return new RRule(rruleObj)
}
