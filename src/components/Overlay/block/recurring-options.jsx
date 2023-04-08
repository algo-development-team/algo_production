import { useState, useEffect } from 'react'
import { RRule } from 'rrule'
import { formatRRule, findNewDtstart } from './handleRRule'
import moment from 'moment'

export const RecurringOptions = ({
  closeOverlay,
  setShowRecurringEventOptions,
  isRecurring,
  setIsRecurring,
  dtstart, // JS Date object
  setDtstart,
  rrule, // RRule object
  setRRule,
}) => {
  const [repeatEvery, setRepeatEvery] = useState(
    rrule?.origOptions?.interval || 1,
  )
  const [repeatEveryType, setRepeatEveryType] = useState(
    rrule?.origOptions?.freq || 2,
  )

  const getRepeatsOnFromByweekday = (byweekday) => {
    const repeatsOn = Array(7).fill(false)
    byweekday.forEach((weekdayObj) => {
      const index = weekdayObj.weekday === 6 ? 0 : weekdayObj.weekday + 1
      repeatsOn[index] = true
    })
    return repeatsOn
  }

  const [repeatsOn, setRepeatsOn] = useState(
    rrule?.origOptions?.byweekday
      ? getRepeatsOnFromByweekday(rrule?.origOptions?.byweekday)
      : Array(7).fill(false),
  )

  const getMonthlyRepeatType = (freq, byweekday) => {
    if (freq && freq === 1 && byweekday && byweekday?.length === 1) {
      return 'BY_WEEKDAY'
    } else {
      return 'BY_MONTHDAY'
    }
  }

  const [monthlyRepeatType, setMonthlyRepeatType] = useState(
    getMonthlyRepeatType(
      rrule?.origOptions?.freq,
      rrule?.origOptions?.byweekday,
    ),
  )

  const getEndsType = (until, count) => {
    if (until) {
      return 'ON'
    } else if (count) {
      return 'AFTER'
    } else {
      return 'NEVER'
    }
  }

  const [endsType, setEndsType] = useState(
    getEndsType(rrule?.origOptions?.until, rrule?.origOptions?.count),
  )
  const [endsOn, setEndsOn] = useState(
    rrule?.origOptions?.until?.toISOString()?.slice(0, 10) ||
      moment().add(2, 'months').format('YYYY-MM-DD'),
  )
  const [endsAfter, setEndsAfter] = useState(rrule?.origOptions?.count || 10)

  useEffect(() => {
    const newRepeatsOn = Array(7).fill(false)
    if (repeatEveryType === 0) {
      setRepeatsOn(newRepeatsOn)
    } else if (repeatEveryType === 1 && monthlyRepeatType === 'BY_MONTHDAY') {
      setRepeatsOn(newRepeatsOn)
    } else if (repeatEveryType === 1 && monthlyRepeatType === 'BY_WEEKDAY') {
      newRepeatsOn[dtstart.getDay()] = true
      setRepeatsOn(newRepeatsOn)
    } else if (
      repeatEveryType === 2 &&
      repeatsOn.every((isSelected) => !isSelected)
    ) {
      newRepeatsOn[dtstart.getDay()] = true
      setRepeatsOn(newRepeatsOn)
    } else if (repeatEveryType === 3) {
      setRepeatsOn(newRepeatsOn)
    }
  }, [repeatEveryType, monthlyRepeatType])

  const getRepeatOnLabel = (index) => {
    switch (index) {
      case 0:
        return 'S'
      case 1:
        return 'M'
      case 2:
        return 'T'
      case 3:
        return 'W'
      case 4:
        return 'T'
      case 5:
        return 'F'
      case 6:
        return 'S'
      default:
        return ''
    }
  }

  const handleRecurringEventOptionsSubmit = () => {
    const newRRule = formatRRule(
      repeatEvery,
      repeatEveryType,
      repeatsOn,
      monthlyRepeatType,
      endsType,
      endsOn,
      endsAfter,
    )

    const newRRuleWithInitialDtstart = new RRule({
      ...newRRule.origOptions,
      dtstart: dtstart,
    })

    const newDtstart = findNewDtstart(
      newRRule.origOptions.freq,
      newRRule.origOptions.interval,
      dtstart,
      newRRuleWithInitialDtstart,
    )

    setDtstart(newDtstart)
    setRRule(newRRule)
  }

  const selectRecurringOrNot = () => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <div>
          <input
            type='radio'
            checked={!isRecurring}
            onChange={() => setIsRecurring(false)}
          />
          <label htmlFor='not-recurring'>Not recurring</label>
        </div>
        <div>
          <input
            type='radio'
            checked={isRecurring}
            onChange={() => setIsRecurring(true)}
          />
          <label htmlFor='recurring'>Recurring</label>
        </div>
      </div>
    )
  }

  const recurringOptions = () => {
    return (
      <div style={{ marginTop: '20px' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Repeat every</label>
          <input
            type='number'
            value={repeatEvery}
            onChange={(e) => setRepeatEvery(parseInt(e.target.value))}
          />
          <select
            value={repeatEveryType}
            onChange={(e) => setRepeatEveryType(parseInt(e.target.value))}
          >
            <option value={3}>Day</option>
            <option value={2}>Week</option>
            <option value={1}>Month</option>
            <option value={0}>Year</option>
          </select>
        </div>
        {repeatEveryType === 2 && (
          <div style={{ marginTop: '10px' }}>
            <p>Repeats on</p>
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {repeatsOn.map((isSelected, index) => (
                  <div
                    key={index}
                    className={`recurring-weekday-button${
                      isSelected ? '__selected' : ''
                    }`}
                    onClick={() =>
                      setRepeatsOn((repeatsOn) => {
                        return repeatsOn.map((isSelected, i) => {
                          if (i === index) {
                            return !isSelected
                          }
                          return isSelected
                        })
                      })
                    }
                  >
                    {getRepeatOnLabel(index)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {repeatEveryType === 1 && (
          <div style={{ marginTop: '10px' }}>
            <select
              value={monthlyRepeatType}
              onChange={(e) => setMonthlyRepeatType(e.target.value)}
            >
              <option value='BY_MONTHDAY'>Monthly on day 3</option>
              <option value='BY_WEEKDAY'>Monthly on the first Monday</option>
            </select>
          </div>
        )}
        <div style={{ marginTop: '10px' }}>
          <p>Ends</p>
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <div>
              <input
                type='radio'
                checked={endsType === 'NEVER'}
                onClick={() => setEndsType('NEVER')}
              />
              <label>Never</label>
            </div>
            <div>
              <input
                type='radio'
                checked={endsType === 'ON'}
                onClick={() => setEndsType('ON')}
              />
              <label style={{ marginRight: '10px' }}>On</label>
              <input
                type='date'
                disabled={endsType !== 'ON'}
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
              />
            </div>
            <div>
              <input
                type='radio'
                checked={endsType === 'AFTER'}
                onClick={() => setEndsType('AFTER')}
              />
              <label style={{ marginRight: '10px' }}>After</label>
              <input
                type='number'
                disabled={endsType !== 'AFTER'}
                value={endsAfter}
                onChange={(e) => setEndsAfter(parseInt(e.target.value))}
              />
              <label style={{ marginLeft: '10px' }}>occurrences</label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div
        className='event__wrapper'
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <div className='add-task__wrapper'>
          <form className='add-task'>
            <div className={`add-task__container`}>
              <h3>Custom Recurrence</h3>
              {selectRecurringOrNot()}
              {isRecurring && recurringOptions()}

              <div
                style={{
                  marginTop: '20px',
                  marginBottom: '10px',
                }}
              >
                <button
                  className=' action add-task__actions--cancel'
                  onClick={(e) => {
                    e.preventDefault()
                    setShowRecurringEventOptions(false)
                  }}
                >
                  Cancel
                </button>
                <button
                  className=' action add-task__actions--add-task'
                  onClick={(e) => {
                    e.preventDefault()
                    if (
                      repeatEveryType === 2 &&
                      repeatsOn.every((isSelected) => !isSelected)
                    ) {
                      alert('A weekday must be selected.')
                      return
                    }
                    handleRecurringEventOptionsSubmit()
                    setShowRecurringEventOptions(false)
                  }}
                >
                  Ok
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
