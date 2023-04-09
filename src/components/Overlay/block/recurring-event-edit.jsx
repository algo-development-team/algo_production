export const RecurringEventEdit = ({
  closeOverlay,
  recurringEventEditType,
  setRecurringEventEditType,
  recurringEventEditOption,
  setRecurringEventEditOption,
  handleDelete,
  handleBacklog,
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
              <h3>
                {recurringEventEditType === 'DELETE'
                  ? 'Delete '
                  : recurringEventEditType === 'BACKLOG'
                  ? 'Backlog '
                  : ''}
                recurring event
              </h3>
              <div>
                <input
                  type='checkbox'
                  checked={recurringEventEditOption === 'THIS_EVENT'}
                  onClick={() => setRecurringEventEditOption('THIS_EVENT')}
                />
                <label>This event</label>
              </div>
              <div>
                <input
                  type='checkbox'
                  checked={recurringEventEditOption === 'ALL_EVENTS'}
                  onClick={() => setRecurringEventEditOption('ALL_EVENTS')}
                />
                <label>All events</label>
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
                    setRecurringEventEditType('')
                    setRecurringEventEditOption('THIS_EVENT')
                  }}
                >
                  Cancel
                </button>
                <button
                  className=' action add-task__actions--add-task'
                  onClick={(e) => {
                    e.preventDefault()
                    if (recurringEventEditType === 'DELETE') {
                      handleDelete()
                    } else if (recurringEventEditType === 'BACKLOG') {
                      handleBacklog()
                    }
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
