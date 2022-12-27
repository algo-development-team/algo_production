import { useTaskEditorContextValue } from 'context'
import { useProjects } from 'hooks'
import { Droppable } from 'react-beautiful-dnd'
import { TaskEditor } from '../TaskEditor'
import { BoardTask } from './board-task'
import { OptionsButton } from '../MenuButton'

export const BoardColumn = ({ column, columns, tasks, projectId }) => {
  const { projects } = useProjects()
  const { taskEditorToShow } = useTaskEditorContextValue()
  return (
    <div className='board-column__container'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
        }}
      >
        <p className='board-column__title'>{column.title}</p>
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
      <div style={{ marginLeft: '0.5rem' }}>
        <TaskEditor column={column} />
      </div>
    </div>
  )
}
