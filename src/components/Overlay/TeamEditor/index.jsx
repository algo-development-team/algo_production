import { useOverlayContextValue } from 'context/overlay-context'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { generatePushId } from 'utils/index'
import './styles/add-project.scss'
import './styles/light.scss'
import { addTeam, updateTeam } from '../../../backend/handleTeams'
import { TagsInput } from './tags-input'

/* Create a hook called useTeams and update it in the component */
export const TeamEditor = ({ closeOverlay, isEdit, teamToEdit }) => {
  const { currentUser } = useAuth()
  const [teamName, setTeamName] = useState(isEdit && teamToEdit.name)
  const [teamDescription, setTeamDescription] = useState(
    isEdit && teamToEdit.description,
  )
  const teamId = generatePushId()
  const { setShowDialog } = useOverlayContextValue()
  const [disableSubmit, setDisableSubmit] = useState(isEdit ? false : true)
  const [emails, setEmails] = useState([])

  const updateTeamHandler = async (e) => {
    e.preventDefault()
    await updateTeam(teamToEdit.teamId, teamName, teamDescription)
  }

  const addTeamHandler = async (e) => {
    e.preventDefault()
    const newProject = {
      teamId: teamId,
      name: teamName,
      description: teamDescription,
    }
    setShowDialog('')

    await addTeam(currentUser && currentUser.id, newProject)

    // update team list here
  }

  const handleChange = (e) => {
    const projectNameInputValue = e.target.value
    if (!projectNameInputValue.length) {
      setDisableSubmit(true)
    } else {
      setDisableSubmit(false)
    }
    setTeamName(e.target.value)
  }

  return (
    <div className='overlay' onClick={(event) => closeOverlay(event)}>
      <div
        className='add-project__modal'
        onClick={(event) => event.stopPropagation()}
      >
        <header className='add-project__modal--header'>
          <h4>{isEdit ? 'Edit' : 'Add'} Project</h4>
        </header>
        <div className='add-project__modal--content'>
          <form
            action=''
            autoComplete='off'
            onSubmit={(e) =>
              isEdit ? updateTeamHandler(e) : addTeamHandler(e)
            }
          >
            <div className='add-project__form-group'>
              <label>Name</label>
              <input
                className='add-project__project-name'
                type='text'
                name='teamName'
                id='teamName'
                minLength={2}
                value={teamName || ''}
                onChange={(e) => handleChange(e)}
                required
              />
            </div>
            <div className='add-project__form-group'>
              <label>Description</label>
              <input
                className='add-project__project-name'
                type='text'
                name='teamDescription'
                id='teamDescription'
                value={teamDescription || ''}
                onChange={(e) => setTeamDescription(e.target.value)}
              />
            </div>
            <TagsInput tags={emails} setTags={setEmails} />
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
                isEdit ? updateTeamHandler(e) : addTeamHandler(e)
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
