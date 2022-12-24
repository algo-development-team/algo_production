import { ReactComponent as Dot } from 'assets/svg/dot.svg'
import { ReactComponent as InboxIcon } from 'assets/svg/inbox.svg'
import { useOverlayContextValue } from 'context'
import { useProjects, useSelectedProject } from 'hooks'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SetNewTaskProjectPopper } from 'components/dropdowns/set-new-task-project-popper'

/*
 * project schema: (selectedProjectId automatically set by useEffect)
 * { selectedProjectName, defaultProject } ->
 * { selectedProjectName, selectedProjectId, defaultProject }
 */

/*
 * popupSelectedProject schema: (selectedProjectId automatically set by useEffect)
 * { selectedProjectName, defaultProject } ->
 * { selectedProjectName, selectedProjectId, defaultProject, projectColour (optional) }
 */

export const SetNewTaskProject = ({
  isQuickAdd,
  isChecklist,
  isPopup,
  project,
  setProject,
  task,
}) => {
  const params = useParams()
  // const { selectedProject } = useSelectedProjectValue(params);
  const { projects } = useProjects()
  const { selectedProject, defaultGroup } = useSelectedProject(params, projects)
  const [popupSelectedProject, setPopupSelectedProject] =
    useState(selectedProject)
  const { setShowDialog, setDialogProps } = useOverlayContextValue()
  const [showPopup, setShowPopup] = useState(false)
  const [parentPosition, setParentPosition] = useState({})
  const [initialProjectSelected, setInitialProjectSelected] = useState(false)

  const defaultProjectValue = {
    selectedProjectName: 'Inbox',
    selectedProjectId: '',
    defaultProject: true,
  }

  const getChecklistProjectValue = () => {
    if (!task) return defaultProjectValue
    const projectMap = {}
    for (const project of projects) {
      projectMap[project.projectId] = project
    }
    if (projectMap.hasOwnProperty(task.projectId)) {
      const checklistProjectValue = {
        selectedProjectName: projectMap[task.projectId].name,
        selectedProjectId: projectMap[task.projectId].projectId,
        defaultProject: false,
        projectColour: projectMap[task.projectId].projectColour,
      }
      return checklistProjectValue
    } else {
      return defaultProjectValue
    }
  }

  useEffect(() => {
    if (isChecklist && !initialProjectSelected) {
      setPopupSelectedProject(getChecklistProjectValue())
    } else if (!project.defaultProject) {
      setPopupSelectedProject(project)
    } else {
      setPopupSelectedProject(defaultProjectValue)
    }
  }, [project])

  useEffect(() => {
    if (isChecklist && !initialProjectSelected) {
      setPopupSelectedProject(getChecklistProjectValue())
    } else if (!selectedProject.defaultProject) {
      setProject(selectedProject)
    } else {
      setProject(defaultProjectValue)
    }
  }, [selectedProject])

  useEffect(() => {
    console.log('project', project) // DEBUGGING
  }, [project])

  useEffect(() => {
    console.log('popupSelectedProject', popupSelectedProject) // DEBUGGING
  }, [popupSelectedProject])

  const showQUickAddDropDown = (parentPosition) => {
    setParentPosition(parentPosition)
    setShowPopup(true)
  }

  return (
    <div
      className='set-new-task__project'
      role='button'
      onClick={(e) => {
        setDialogProps(
          Object.assign(
            { elementPosition: e.currentTarget.getBoundingClientRect() },
            { setProject, setPopupSelectedProject },
          ),
        )
        if (isPopup) {
          setDialogProps({ task })
          showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
        } else if (isQuickAdd) {
          showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
        } else {
          setShowDialog('SET_PROJECT')
        }
        // isQuickAdd
        //   ? showQUickAddDropDown(e.currentTarget.getBoundingClientRect())
        //   : setShowDialog('SET_PROJECT')
      }}
    >
      {popupSelectedProject?.selectedProjectName === 'Inbox' ? (
        <InboxIcon width='18px' height='18px' fill='#5297ff' />
      ) : (
        <Dot
          color={`${popupSelectedProject?.projectColour?.hex}`}
          width={17}
          height={17}
        />
      )}
      <p className='set-new-task__project--name'>
        {popupSelectedProject.selectedProjectName}
      </p>
      {showPopup && (
        <SetNewTaskProjectPopper
          setShowPopup={setShowPopup}
          project={project}
          setProject={setProject}
          setPopupSelectedProject={setPopupSelectedProject}
          parentPosition={parentPosition}
          isQuickAdd={isQuickAdd}
          isChecklist={isChecklist}
          isPopup={isPopup}
          showPopup={showPopup}
          setInitialProjectSelected={setInitialProjectSelected}
        />
      )}
    </div>
  )
}
