import { useOverlayContextValue } from 'context/overlay-context'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { generatePushId } from 'utils/index'
import './styles/add-project.scss'
import './styles/light.scss'
import { addTeam } from '../../../backend/handleTeams'
import { TagsInput } from './tags-input'
import emailjs from 'emailjs-com'

/* Create a hook called useTeams and update it in the component */
export const TeamEditor = ({ closeOverlay }) => {
  const { currentUser } = useAuth()
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const teamId = generatePushId()
  const { setShowDialog } = useOverlayContextValue()
  const [disableSubmit, setDisableSubmit] = useState(true)
  const [emails, setEmails] = useState([])

  const addTeamHandler = async (e) => {
    e.preventDefault()
    const newProject = {
      teamId: teamId,
      name: teamName,
      description: teamDescription,
      projects: [],
    }
    setShowDialog('')

    await addTeam(currentUser && currentUser.id, newProject)

    // send email invite to team members here
    // emailjs
    //   .sendForm(
    //     process.env.REACT_APP_EMAILJS_SERVICE_ID,
    //     process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
    //     e.target,
    //     process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
    //   )
    //   .then(
    //     (result) => {
    //       console.log(result.text)
    //     },
    //     (error) => {
    //       console.log(error.text)
    //     },
    //   )
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
          <h4>Add Project</h4>
        </header>
        <div className='add-project__modal--content'>
          <form
            action=''
            autoComplete='off'
            onSubmit={(e) => addTeamHandler(e)}
          >
            <div className='add-project__form-group'>
              <label>Name</label>
              <input
                className='add-project__project-name'
                type='text'
                name='teamName'
                id='teamName'
                minLength={2}
                value={teamName}
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
                value={teamDescription}
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
                addTeamHandler(e)
              }}
            >
              Add
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
