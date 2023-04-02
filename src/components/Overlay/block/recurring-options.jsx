import { useState, useEffect } from 'react'
import { RRule } from 'rrule'
import { formatRRule } from './handleRRule'
import moment from 'moment'

export const RecurringOptions = ({
  closeOverlay,
  setShowRecurringEventOptions,
  dtstart,
  setDtstart,
  rrule,
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
    /* DEBUGGING */
    const newRRule = formatRRule(
      repeatEvery,
      repeatEveryType,
      repeatsOn,
      monthlyRepeatType,
      endsType,
      endsOn,
      endsAfter,
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
              <div>
                <div>
                  <label>Repeat every</label>
                  <input
                    type='number'
                    value={repeatEvery}
                    onChange={(e) => setRepeatEvery(parseInt(e.target.value))}
                  />
                  <select
                    value={repeatEveryType}
                    onChange={(e) =>
                      setRepeatEveryType(parseInt(e.target.value))
                    }
                  >
                    <option value={3}>Day</option>
                    <option value={2}>Week</option>
                    <option value={1}>Month</option>
                    <option value={0}>Year</option>
                  </select>
                </div>
                {repeatEveryType === 2 && (
                  <div>
                    <p>Repeats on</p>
                    <div style={{ display: 'flex' }}>
                      {repeatsOn.map((isSelected, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: isSelected ? 'blue' : 'grey',
                          }}
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
                )}
                {repeatEveryType === 1 && (
                  <div>
                    <select
                      value={monthlyRepeatType}
                      onChange={(e) => setMonthlyRepeatType(e.target.value)}
                    >
                      <option value='BY_MONTHDAY'>Monthly on day 3</option>
                      <option value='BY_WEEKDAY'>
                        Monthly on the first Monday
                      </option>
                    </select>
                  </div>
                )}
                <div>
                  <p>Ends</p>
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
                    <label>On</label>
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
                    <label>After</label>
                    <input
                      type='number'
                      disabled={endsType !== 'AFTER'}
                      value={endsAfter}
                      onChange={(e) => setEndsAfter(parseInt(e.target.value))}
                    />
                    <label>occurrences</label>
                  </div>
                </div>
              </div>

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
