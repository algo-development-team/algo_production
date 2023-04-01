import { RRule, RRuleSet } from 'rrule'

export const TestButton = () => {
  const dtstart = new Date(2023, 3, 4)

  const getDtend = (freq, interval) => {
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

  const findClosestValidDate = () => {
    // Define the RRule object
    const rule = new RRule({
      freq: RRule.WEEKLY,
      interval: 1,
      byweekday: [RRule.MO, RRule.WE, RRule.FR],
      dtstart: dtstart,
    })

    // create an RRuleSet object containing the rule
    const ruleSet = new RRuleSet()
    ruleSet.rrule(rule)

    // add one year to dtstart
    const dtend = getDtend(RRule.WEEKLY, 1)
    const occurrences = ruleSet.between(dtstart, dtend, true)

    /* DEBUGGING */
    for (const occurrence of occurrences) {
      console.log(occurrence.toISOString())
    }

    return occurrences[0]
  }

  return (
    <div>
      <button onClick={() => findClosestValidDate()}>Test</button>
    </div>
  )
}
