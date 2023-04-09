import { useOverlayContextValue } from 'context/overlay-context'
import { useAuth, useSchedules } from 'hooks'
import { useEffect, useState } from 'react'
import { generatePushId } from 'utils/index'
import './ProjectEditor/styles/add-project.scss'
import './ProjectEditor/styles/light.scss'
import { updateUserInfo } from '../../backend/handleUserInfo'

export const ScheduleEditor = ({ closeOverlay, isEdit, scheduleToEdit }) => {
  const { currentUser } = useAuth()
  const [scheduleName, setScheduleName] = useState(
    isEdit && scheduleToEdit.name,
  )
  const scheduleId = generatePushId()
  const { setShowDialog } = useOverlayContextValue()
  const [disableSubmit, setDisableSubmit] = useState(isEdit ? false : true)
  const { schedules, setSchedules } = useSchedules()

  useEffect(() => {
    console.log('schedules', schedules)
  }, [schedules])

  const updateScheduleHandler = async (e) => {
    e.preventDefault()

    const updatedSchedules = schedules.map((schedule) => {
      if (schedule.id === scheduleToEdit.id) {
        return { ...schedule, name: scheduleName }
      }
      return schedule
    })

    await updateUserInfo(currentUser && currentUser.id, {
      schedules: updatedSchedules,
    })

    closeOverlay()
  }

  const addScheduleHandler = async (e) => {
    e.preventDefault()

    const newSchedule = { name: scheduleName, id: scheduleId, events: [] }
    const updatedSchedules = [...schedules, newSchedule]

    setShowDialog('')

    // add schedule here
    await updateUserInfo(currentUser && currentUser.id, {
      schedules: updatedSchedules,
    })

    // update schedule hook
    setSchedules(updatedSchedules)
  }

  const handleChange = (e) => {
    const scheduleNameInputValue = e.target.value
    if (!scheduleNameInputValue.length) {
      setDisableSubmit(true)
    } else {
      setDisableSubmit(false)
    }
    setScheduleName(e.target.value)
  }

  return (
    <div className='overlay' onClick={(event) => closeOverlay(event)}>
      <div
        className='add-project__modal'
        onClick={(event) => event.stopPropagation()}
      >
        <header className='add-project__modal--header'>
          <h4>{isEdit ? 'Edit' : 'Add'} Schedule</h4>
        </header>
        <div className='add-project__modal--short-content'>
          <form
            action=''
            autoComplete='off'
            onSubmit={(e) =>
              isEdit ? updateScheduleHandler(e) : addScheduleHandler(e)
            }
          >
            <div className='add-project__form-group'>
              <label>Name</label>
              <input
                className='add-project__project-name'
                type='text'
                name='scheduleName'
                id='scheduleName'
                minLength={2}
                value={scheduleName || ''}
                onChange={(e) => handleChange(e)}
                required
              />
            </div>
          </form>
        </div>
        <footer className='add-project__modal--footer'>
          <div className='add-project__modal--buttons'>
            <button
              className='action action__cancel'
              type='button'
              onClick={() => setShowDialog(!setShowDialog)}
            >
              Cancel
            </button>
            <button
              className='action action__add-project'
              type='submit'
              disabled={disableSubmit}
              onClick={(e) => {
                e.preventDefault()
                isEdit ? updateScheduleHandler(e) : addScheduleHandler(e)
              }}
            >
              {isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
