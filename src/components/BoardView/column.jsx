import { useTaskEditorContextValue, useColumnEditorContextValue } from 'context'
import { useProjects } from 'hooks'
import { Droppable } from 'react-beautiful-dnd'
import { TaskEditor } from '../TaskEditor'
import { BoardTask } from './board-task'
import { OptionsButton } from '../MenuButton'
import { useEffect } from 'react'

export const BoardColumn = ({
  column,
  columns,
  tasks,
  projectId,
  modifiedColumnName,
  setModifiedColumnName,
  handleUpdateColumn,
}) => {
  const { projects } = useProjects()
  const { taskEditorToShow } = useTaskEditorContextValue()
  const { columnEditorToShow, setColumnEditorToShow } =
    useColumnEditorContextValue()

  useEffect(() => {
    if (
      columnEditorToShow &&
      columnEditorToShow.projectId === projectId &&
      columnEditorToShow.columnId === column.id
    ) {
      setModifiedColumnName(column.title)
    }
  }, [columnEditorToShow])

  return (
    <div className='board-column__container'>
      <div className='board-column__header'>
        {columnEditorToShow &&
        columnEditorToShow.projectId === projectId &&
        columnEditorToShow.columnId === column.id ? (
          <>
            <form onSubmit={(e) => handleUpdateColumn(e, column.id)}>
              <input
                className='add-project__project-name'
                value={modifiedColumnName}
                onChange={(e) => {
                  setModifiedColumnName(e.target.value)
                }}
                type='text'
                required
              />
              <div>
                <button className='action action__add-project' type='submit'>
                  Save
                </button>
                <button
                  className='action action__cancel'
                  type='button'
                  onClick={() => setColumnEditorToShow(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className='board-column__title'>{column.title}</p>
          </>
        )}
        <OptionsButton
          targetIsColumn
          projectId={projectId}
          columnId={column.id}
          columns={columns}
          isHeaderButton
        />
      </div>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            className='tasklist'
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <>
                {taskEditorToShow !== task.taskId && (
                  <BoardTask
                    key={task.taskId}
                    task={task}
                    index={index}
                    column={column}
                  />
                )}
                {taskEditorToShow === task.taskId && (
                  <TaskEditor
                    taskId={task.taskId}
                    task={task}
                    projects={projects}
                    isEdit
                  />
                )}
              </>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <TaskEditor column={column} />
    </div>
  )
}
