export const RecurringOptions = ({
  closeOverlay,
  setShowRecurringEventOptions,
}) => {
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
                  <input type='number' />
                  <select>
                    <option value='day'>Day</option>
                    <option value='week'>Week</option>
                    <option value='month'>Month</option>
                    <option value='year'>Year</option>
                  </select>
                </div>
                <div>
                  <p>Repeats on</p>
                  <div>
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                  </div>
                </div>
                <div>
                  <p>Ends</p>
                  <div>
                    <input type='radio' />
                    <label>Never</label>
                  </div>
                  <div>
                    <input type='radio' />
                    <label>On</label>
                    <input type='date' />
                  </div>
                  <div>
                    <input type='radio' />
                    <label>After</label>
                    <input type='number' />
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
