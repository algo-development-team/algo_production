import { useColumnEditorContextValue } from 'context'
import { useAuth, useBoardData, useProjects, useSelectedProject } from 'hooks'
import { useEffect, useState } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { ViewHeader } from '../ViewHeader'
import { BoardColumn } from './column'
import './styles/light.scss'
import './styles/main.scss'
import { generatePushId } from 'utils'
import { updateBoardStatus } from '../../backend/handleTasks'
import { updateProjectColumns, dragEnd } from '../../backend/handleProjects'
import { getTaskDocInColumnNotCompleted } from '../../backend/handleProjects'
export const Board = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { selectedProject, setSelectedProject } = useSelectedProject(
    params,
    projects,
  )
  const { setColumnEditorToShow } = useColumnEditorContextValue()
  const boardData = useBoardData(selectedProject)
  const { currentUser } = useAuth()
  const [boardState, setBoardState] = useState(boardData)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [modifiedColumnName, setModifiedColumnName] = useState('')

  useEffect(() => {
    setBoardState(boardData)
  }, [boardData])

  const handleCreateNewColumn = async (e) => {
    e.preventDefault()

    const newSelectedProjectColumns = []
    for (const column of selectedProject.columns) {
      newSelectedProjectColumns.push({ ...column })
    }
    const columnId = generatePushId()
    newSelectedProjectColumns.push({
      id: columnId,
      title: newColumnName,
    })

    // add new column to selected project

    await updateProjectColumns(selectedProject.selectedProjectId, newSelectedProjectColumns)
  }
  const handleUpdateColumn = async (e, columnId) => {
    e.preventDefault()

    const updatedSelectedProjectColumns = []
    for (const column of selectedProject.columns) {
      if (column.id === columnId) {
        updatedSelectedProjectColumns.push({
          ...column,
          title: modifiedColumnName,
        })
      } else {
        updatedSelectedProjectColumns.push({ ...column })
      }
    }

    // update selected project columns
    await updateProjectColumns(selectedProject.selectedProjectId, updatedSelectedProjectColumns)
    // changed above line

    setNewColumnName('')
    setColumnEditorToShow(null)
  }


  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result
    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(boardState.columnOrder)
      newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, draggableId)

      const newState = {
        ...boardState,
        columnOrder: newColumnOrder,
      }

      setBoardState(newState)

      // Drag End
     await dragEnd(selectedProject.selectedProjectId, newColumnOrder)
      return
    }

    const start = boardState.columns[source.droppableId]
    const finish = boardState.columns[destination.droppableId]
    const taskWithDraggableId = Object.values(boardState.tasks).find(
      (task) => task.taskId === draggableId,
    )

    if (start === finish) {
      const newTaskIds = Array.from(start.columnTasks)
      newTaskIds.splice(source.index, 1)

      newTaskIds.splice(destination.index, 0, taskWithDraggableId)

      const newColumn = {
        ...start,
        columnTasks: newTaskIds,
      }

      const newState = {
        ...boardState,
        columns: {
          ...boardState.columns,
          [newColumn.id]: newColumn,
        },
      }

      setBoardState(newState)

      // getTaskDocInColoumnNotCompleted
      await getTaskDocInColumnNotCompleted(currentUser && currentUser.id, selectedProject.selectedProjectId, destination.droppableId, source.index, destination.index)
      
      // UPDATE TASK INDEX HERE (COMPLETED)
      return
    }

    const startTaskIds = Array.from(start.columnTasks)
    startTaskIds.splice(source.index, 1)
    const newStart = {
      ...start,
      columnTasks: startTaskIds,
    }

    const finishTaskIds = Array.from(finish.columnTasks)
    finishTaskIds.splice(destination.index, 0, taskWithDraggableId)
    const newFinish = {
      ...finish,
      columnTasks: finishTaskIds,
    }

    const newState = {
      ...boardState,
      columns: {
        ...boardState.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }

    const oldState = boardState

    const updateBoardStatusResult = await updateBoardStatus(draggableId, selectedProject.selectedProjectId, source.droppableId, source.index, destination.droppableId, destination.index)

    if (updateBoardStatusResult) {
      setBoardState(newState)
    } else {
      setBoardState(oldState)
    }
  }

  return (
    <>
      <ViewHeader />
      <div className='board__wrapper'>
        <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
          <Droppable
            droppableId='all-columns'
            direction='horizontal'
            type='column'
          >
            {(provided) => (
              <div
                className='board__container'
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {boardState &&
                  boardState.columnOrder.map((columnId, index) => {
                    const column = boardState.columns[columnId]

                    const tasks = column.columnTasks

                    return (
                      <BoardColumn
                        key={column.id}
                        tasks={tasks}
                        column={column}
                        columns={selectedProject.columns}
                        projectId={selectedProject.selectedProjectId}
                        modifiedColumnName={modifiedColumnName}
                        setModifiedColumnName={setModifiedColumnName}
                        handleUpdateColumn={handleUpdateColumn}
                        index={index}
                      />
                    )
                  })}
                {provided.placeholder}
                <div
                  className='board-column__add-container'
                  style={{ height: addingColumn ? '63px' : '20px' }}
                >
                  {!addingColumn ? (
                    <div className='board-column__header'>
                      <p
                        className='board-column__add-column'
                        onClick={() => setAddingColumn(true)}
                      >
                        Add Column
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleCreateNewColumn(e)}>
                      <input
                        className='add-project__project-name'
                        value={newColumnName}
                        onChange={(e) => {
                          setNewColumnName(e.target.value)
                        }}
                        type='text'
                        required
                      />
                      <div>
                        <button
                          className='action action__add-project'
                          type='submit'
                        >
                          Add
                        </button>
                        <button
                          className='action action__cancel'
                          style={{
                            backgroundColor: 'inherit',
                            color: 'inherit',
                          }}
                          type='button'
                          onClick={() => setAddingColumn(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  )
}