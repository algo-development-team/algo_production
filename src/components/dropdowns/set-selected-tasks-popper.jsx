import './light.scss'
import './main.scss'

export const SetSelectedTasksPopper = ({
  tasks,
  selectedTasks,
  setSelectedTasks,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const isNewSelectedTaskAlreadyAdded = (selectedTasks, linkedTask) => {
    return selectedTasks.find((task) => {
      return task.name === linkedTask.name && task.taskId === linkedTask.taskId
    })
  }

  const setSelectedTasksWithMatchedTask = (linkedTask) => {
    const newSelectedTasks = isNewSelectedTaskAlreadyAdded(
      selectedTasks,
      linkedTask,
    )
      ? selectedTasks
      : [...selectedTasks, linkedTask]
    setSelectedTasks(newSelectedTasks)
    closeOverlay()
  }

  const targetedposition = parentPosition
    ? parentPosition
    : { x: xPosition, y: yPosition }

  if (
    tasks.filter(
      (matchedTask) =>
        !isNewSelectedTaskAlreadyAdded(selectedTasks, {
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
        closeOverlay(event)
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
                !isNewSelectedTaskAlreadyAdded(selectedTasks, {
                  name: matchedTask.name,
                  taskId: matchedTask.taskId,
                }),
            )
            .map((matchedTask) => {
              return (
                <li
                  className='set-schedule__popper--option'
                  onClick={() =>
                    setSelectedTasksWithMatchedTask({
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
