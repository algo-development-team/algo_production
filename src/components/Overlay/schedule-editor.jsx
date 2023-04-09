import featherIcon from 'assets/svg/feather-sprite.svg'
import { useOverlayContextValue } from 'context/overlay-context'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { generatePushId } from 'utils/index'
import './ProjectEditor/styles/add-project.scss'
import './ProjectEditor/styles/light.scss'

export const ScheduleEditor = ({ closeOverlay, isEdit, projectToEdit }) => {
  const { currentUser } = useAuth()
  const [scheduleName, setScheduleName] = useState(isEdit && projectToEdit.name)
  const scheduleId = generatePushId()
  const { setShowDialog } = useOverlayContextValue()
  const [disableSubmit, setDisableSubmit] = useState(isEdit ? false : true)

  const updateScheduleHandler = async (e) => {
    e.preventDefault()
    // update schedule here
  }

  const addScheduleHandler = async (e) => {
    e.preventDefault()

    setShowDialog('')

    // add schedule here
    // update schedule hook
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
