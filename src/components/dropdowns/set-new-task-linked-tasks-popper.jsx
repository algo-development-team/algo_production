import './light.scss'
import './main.scss'

export const SetNewTaskLinkedTasksPopper = ({
  isQuickAdd,
  isPopup,
  setShowPopup,
  tasks,
  linkedTasks,
  setLinkedTasks,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const isNewLinkedTaskAlreadyAdded = (linkedTasks, linkedTask) => {
    return linkedTasks.find((task) => {
      return task.name === linkedTask.name && task.taskId === linkedTask.taskId
    })
  }

  const setLinkedTasksWithMatchedTask = (linkedTask) => {
    const newLinkedTasks = isNewLinkedTaskAlreadyAdded(linkedTasks, linkedTask)
      ? linkedTasks
      : [...linkedTasks, linkedTask]
    setLinkedTasks(newLinkedTasks)
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }

  const targetedposition = parentPosition
    ? parentPosition
    : { x: xPosition, y: yPosition }

  if (
    tasks.filter(
      (matchedTask) =>
        !isNewLinkedTaskAlreadyAdded(linkedTasks, {
          name: matchedTask.name,
          taskId: matchedTask.taskId,
        }),
    ).length === 0
  ) {
    return null
  }

  return (
    <div
      className='option__overlay'
      onClick={(event) => {
        event.stopPropagation()
        isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay(event)
      }}
    >
      <div
        className='set-schedule__popper'
        onClick={(event) => event.stopPropagation()}
        style={{
          top: `${targetedposition.y - 115}px`,
          left: `${targetedposition.x}px`,
        }}
      >
        <ul>
          {tasks
            .filter(
              (matchedTask) =>
                !isNewLinkedTaskAlreadyAdded(linkedTasks, {
                  name: matchedTask.name,
                  taskId: matchedTask.taskId,
                }),
            )
            .map((matchedTask) => {
              return (
                <li
                  className='set-schedule__popper--option'
                  onClick={() =>
                    setLinkedTasksWithMatchedTask({
                      name: matchedTask.name,
                      taskId: matchedTask.taskId,
                    })
                  }
                >
                  <p className='set-new-task__schedule--name'>
                    {matchedTask.name}
                  </p>
                </li>
              )
            })}
        </ul>
      </div>
    </div>
  )
}
