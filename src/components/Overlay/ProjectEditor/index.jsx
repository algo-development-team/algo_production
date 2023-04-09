import { useOverlayContextValue } from 'context/overlay-context'
import { useAuth, useProjects, useSchedules } from 'hooks'
import { useEffect, useState } from 'react'
import { generatePushId } from 'utils/index'
import { SetProjectColourDropdown } from './set-project-colour'
import { SetProjectScheduleIdDropdown } from './set-project-schedule-id'
import './styles/add-project.scss'
import './styles/light.scss'
import { updatedProject, addProject } from '../../../backend/handleUserProjects'

export const ProjectEditor = ({ closeOverlay, isEdit, projectToEdit }) => {
  const { currentUser } = useAuth()
  const [projectName, setprojectName] = useState(isEdit && projectToEdit.name)
  const [projectColour, setProjectColour] = useState(
    isEdit
      ? projectToEdit.projectColour
      : {
          name: 'Peacock',
          hex: '#039be5',
        },
  )
  const [projectIsList, setProjectIsList] = useState(
    isEdit ? projectToEdit.projectIsList : false,
  )
  const [projectScheduleId, setProjectScheduleId] = useState(
    isEdit ? projectToEdit.projectScheduleId : 'WORK_SCHEDULE',
  )
  const [showSelectColourDropdown, setShowSelectColourDropdown] =
    useState(false)
  const [showSelectScheduleDropdown, setShowSelectScheduleDropdown] =
    useState(false)
  const { setProjects } = useProjects()
  const [selectedColour, setSelectedColour] = useState(projectColour)
  const [selectedScheduleId, setSelectedScheduleId] =
    useState(projectScheduleId)
  const [selectedScheduleName, setSelectedScheduleName] = useState(
    'No Schedule Selected',
  )
  const projectId = generatePushId()
  const { setShowDialog } = useOverlayContextValue()
  const [disableSubmit, setDisableSubmit] = useState(isEdit ? false : true)
  const { schedules, loading: schedulesLoading } = useSchedules()

  const getScheduleName = () => {
    const schedule = schedules.find(
      (schedule) => schedule.id === selectedScheduleId,
    )

    if (schedule) {
      return schedule.name
    } else {
      return 'No Schedule Selected'
    }
  }

  useEffect(() => {
    if (!schedulesLoading) {
      setSelectedScheduleName(getScheduleName())
    }
  }, [schedules, selectedScheduleId, schedulesLoading])

  useEffect(() => {
    setSelectedColour(projectColour)

    return () => {
      setSelectedColour(null)
    }
  }, [projectColour])

  useEffect(() => {
    setSelectedScheduleId(projectScheduleId)

    return () => {
      setSelectedScheduleId(null)
    }
  }, [projectScheduleId])

  const updateProjectHandler = async (e) => {
    e.preventDefault()

    await updatedProject(
      currentUser && currentUser.id,
      projectToEdit.projectId,
      projectName,
      projectColour,
      projectIsList,
      projectScheduleId,
    )
  }

  const addProjectHandler = async (e) => {
    e.preventDefault()
    const newProject = {
      name: projectName,
      projectId: projectId,
      projectColour: projectColour,
      projectIsList: projectIsList,
      projectScheduleId: projectScheduleId,
      columns: [
        {
          id: 'NOSECTION',
          title: '(No Section)',
        },
        {
          id: 'TODO',
          title: 'To do',
        },
        {
          id: 'INPROGRESS',
          title: 'In Progress',
        },
        {
          id: 'COMPLETE',
          title: 'Complete',
        },
      ],
    }
    setShowDialog('')

    await addProject(currentUser && currentUser.id, newProject)

    setProjects({ ...newProject })
  }

  const handleChange = (e) => {
    const projectNameInputValue = e.target.value
    if (!projectNameInputValue.length) {
      setDisableSubmit(true)
    } else {
      setDisableSubmit(false)
    }
    setprojectName(e.target.value)
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
              isEdit ? updateProjectHandler(e) : addProjectHandler(e)
            }
          >
            <div className='add-project__form-group'>
              <label>Name</label>
              <input
                className='add-project__project-name'
                type='text'
                name='projectName'
                id='projectName'
                minLength={2}
                value={projectName || ''}
                onChange={(e) => handleChange(e)}
                required
              />
            </div>
            <div className='add-project__form-group' role='button'>
              <label>Color</label>
              <div
                className='add-project__select-color'
                onClick={() =>
                  setShowSelectColourDropdown(!showSelectColourDropdown)
                }
              >
                <span
                  className='add-project__selected-color'
                  style={{ backgroundColor: `${selectedColour.hex}` }}
                />
                <span className='add-project__selected-color-name'>
                  {selectedColour.name}
                </span>
                {showSelectColourDropdown && (
                  <SetProjectColourDropdown
                    setProjectColour={setProjectColour}
                  />
                )}
              </div>
            </div>
            <div className='add-project__form-group' role='button'>
              <label>Schedule</label>
              <div
                className='add-project__select-color'
                onClick={() =>
                  setShowSelectScheduleDropdown(!showSelectScheduleDropdown)
                }
              >
                <span className='add-project__selected-color-name'>
                  {selectedScheduleName}
                </span>
                {showSelectScheduleDropdown && (
                  <SetProjectScheduleIdDropdown
                    setProjectScheduleId={setProjectScheduleId}
                  />
                )}
              </div>
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
                isEdit ? updateProjectHandler(e) : addProjectHandler(e)
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
