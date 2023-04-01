import { useState, useEffect } from 'react'
import { RRule } from 'rrule'

export const RecurringOptions = ({
  closeOverlay,
  setShowRecurringEventOptions,
  dtstart,
  setDtstart,
  rrule,
  setRRule,
}) => {
  const [repeatEvery, setRepeatEvery] = useState(1)
  const [repeatEveryType, setRepeatEveryType] = useState('DAILY')
  const [repeatsOn, setRepeatsOn] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ])
  const [monthlyRepeatType, setMonthlyRepeatType] = useState('BY_DAY')
  const [endsType, setEndsType] = useState('NEVER')
  const [endsOn, setEndsOn] = useState(new Date())
  const [endsAfter, setEndsAfter] = useState(1)

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
                    onChange={(e) => setRepeatEvery(e.target.value)}
                  />
                  <select
                    value={repeatEveryType}
                    onChange={(e) => setRepeatEveryType(e.target.value)}
                  >
                    <option value='DAILY'>Day</option>
                    <option value='WEEKLY'>Week</option>
                    <option value='MONTHLY'>Month</option>
                    <option value='YEARLY'>Year</option>
                  </select>
                </div>
                {repeatEveryType === 'WEEKLY' && (
                  <div>
                    <p>Repeats on</p>
                    <div style={{ display: 'flex' }}>
                      {repeatsOn.map((isSelected, index) => (
                        <div
                          key={index}
                          value={isSelected}
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
                {repeatEveryType === 'MONTHLY' && (
                  <div>
                    <select
                      value={monthlyRepeatType}
                      onChange={(e) => setMonthlyRepeatType(e.target.value)}
                    >
                      <option value='BY_DAY'>Monthly on day 3</option>
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
                      onChange={(e) => setEndsAfter(e.target.value)}
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
