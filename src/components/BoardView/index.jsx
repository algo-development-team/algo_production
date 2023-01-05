import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useColumnEditorContextValue } from 'context'
import { useAuth, useBoardData, useProjects, useSelectedProject } from 'hooks'
import { useEffect, useState } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { db } from '_firebase'
import { ViewHeader } from '../ViewHeader'
import { BoardColumn } from './column'
import './styles/light.scss'
import './styles/main.scss'
import { generatePushId } from 'utils'
import { getTaskDocsInProjectColumnNotCompleted } from '../../handleUserTasks'

export const Board = () => {
  const params = useParams()
  const { projects } = useProjects()
  const { setSelectedProject, selectedProject } = useSelectedProject(
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

    try {
      const projectQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/projects`),
        where('projectId', '==', selectedProject.selectedProjectId),
      )
      const projectDocs = await getDocs(projectQuery)
      projectDocs.forEach(async (projectDoc) => {
        await updateDoc(projectDoc.ref, {
          columns: newSelectedProjectColumns,
        })
      })
    } catch (error) {
      console.log(error)
    }
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

    try {
      const projectQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/projects`),
        where('projectId', '==', selectedProject.selectedProjectId),
      )
      const projectDocs = await getDocs(projectQuery)
      projectDocs.forEach(async (projectDoc) => {
        await updateDoc(projectDoc.ref, {
          columns: updatedSelectedProjectColumns,
        })
      })
    } catch (error) {
      console.log(error)
    }

    setNewColumnName('')
    setColumnEditorToShow(null)
  }

  const getNewColumns = (columnOrder, columns) => {
    const newColumns = []
    for (const columnId of columnOrder) {
      if (columnId === 'NOSECTION') {
        newColumns.push({ id: 'NOSECTION', title: '(No Section)' })
      } else {
        const column = columns.find((column) => column.id === columnId)
        newColumns.push(column)
      }
    }
    return newColumns
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

      try {
        const projectQuery = await query(
          collection(db, 'user', `${currentUser && currentUser.id}/projects`),
          where('projectId', '==', selectedProject.selectedProjectId),
        )
        const projectDocs = await getDocs(projectQuery)
        projectDocs.forEach(async (projectDoc) => {
          const newColumns = getNewColumns(
            newColumnOrder,
            projectDoc.data().columns,
          )
          await updateDoc(projectDoc.ref, {
            columns: newColumns,
          })
        })
      } catch (error) {
        console.log(error)
      }

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

      const columnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
        currentUser && currentUser.id,
        selectedProject.selectedProjectId,
        destination.droppableId,
      )

      if (source.index > destination.index) {
        columnTaskDocs.forEach(async (taskDoc) => {
          if (taskDoc.data().index === source.index) {
            await updateDoc(taskDoc.ref, {
              index: destination.index,
            })
          } else if (
            taskDoc.data().index >= destination.index &&
            taskDoc.data().index < source.index
          ) {
            await updateDoc(taskDoc.ref, {
              index: taskDoc.data().index + 1,
            })
          }
        })
      } else {
        columnTaskDocs.forEach(async (taskDoc) => {
          if (taskDoc.data().index === source.index) {
            await updateDoc(taskDoc.ref, {
              index: destination.index,
            })
          } else if (
            taskDoc.data().index > source.index &&
            taskDoc.data().index <= destination.index
          ) {
            await updateDoc(taskDoc.ref, {
              index: taskDoc.data().index - 1,
            })
          }
        })
      }
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

    try {
      setBoardState(newState)

      const oldColumnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
        currentUser && currentUser.id,
        selectedProject.selectedProjectId,
        source.droppableId,
      )

      oldColumnTaskDocs.forEach(async (taskDoc) => {
        if (taskDoc.data().index > source.index) {
          await updateDoc(taskDoc.ref, {
            index: taskDoc.data().index - 1,
          })
        }
      })

      const newColumnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
        currentUser && currentUser.id,
        selectedProject.selectedProjectId,
        destination.droppableId,
      )

      newColumnTaskDocs.forEach(async (taskDoc) => {
        if (taskDoc.data().index >= destination.index) {
          await updateDoc(taskDoc.ref, {
            index: taskDoc.data().index + 1,
          })
        }
      })

      const taskQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/tasks`),
        where('taskId', '==', draggableId),
      )
      const taskDocs = await getDocs(taskQuery)
      taskDocs.forEach(async (taskDoc) => {
        await updateDoc(taskDoc.ref, {
          boardStatus: destination.droppableId,
          index: destination.index,
        })
      })
      // UPDATE TASK INDEX HERE (COMPLETED)
    } catch (error) {
      console.log(error)
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
                <div className='board-column__container'>
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
