import { TaskEditor } from 'components/TaskEditor'
import { ViewHeader } from 'components/ViewHeader'
import { useTaskEditorContextValue } from 'context'
import { useProjects, useTasks } from 'hooks'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from './empty-state'
import './styles/light.scss'
import './styles/listview.scss'
import { Task } from './task'
import { getUserInfo } from 'handleUserInfo'
import { useAuth } from 'hooks'
import { DragDropContext } from 'react-beautiful-dnd'
import { Droppable } from 'react-beautiful-dnd'
import { updateUserInfo } from 'handleUserInfo'
import { updateDoc } from 'firebase/firestore'
import { getTaskDocsInProjectColumnNotCompleted } from '../../handleUserTasks'

// UPDATE SORT THE LIST TASKS BY THEIR INDEX (COMPLETED)

export const TaskList = () => {
  const { projectId, defaultGroup } = useParams()
  const selectedProject = projectId || defaultGroup

  const { tasks } = useTasks(defaultGroup || projectId)
  const { projects } = useProjects()
  const { taskEditorToShow } = useTaskEditorContextValue()
  const { currentUser } = useAuth()
  const [tasklist, setTasklist] = useState([])
  const [checklist, setChecklist] = useState([])

  const sortTasksByColumnOrder = (tasks) => {
    if (
      selectedProject === 'Checklist' ||
      selectedProject === 'Inbox' ||
      selectedProject === 'Scheduled'
    ) {
      return tasks
    }

    const projectMap = {}
    for (const project of projects) {
      projectMap[project.projectId] = project
    }
    if (projectMap[selectedProject]) {
      const projectColumnIds = projectMap[selectedProject].columns.map(
        (column) => column.id,
      )
      const projectColumnTasks = {}
      for (const columnId of projectColumnIds) {
        projectColumnTasks[columnId] = []
      }
      for (const task of tasks) {
        projectColumnTasks[task.boardStatus].push(task)
      }
      const sortedColumnTasks = []
      for (const columnId of projectColumnIds) {
        sortedColumnTasks.push(...projectColumnTasks[columnId])
      }
      return sortedColumnTasks
    }
    return tasks
  }

  useEffect(() => {
    const getChecklist = async (userId) => {
      const userInfo = await getUserInfo(userId)
      if (userInfo.empty === true || userInfo.failed === true) {
        return []
      }
      const userData = userInfo.userInfoDoc.data()
      setChecklist(userData.checklist)
    }

    if (tasks.length > 0) {
      const sortedTasks = sortTasksByColumnOrder(tasks)
      setTasklist(sortedTasks)
      if (currentUser && defaultGroup === 'Checklist') {
        getChecklist(currentUser.id).catch(console.error)
      }
    } else {
      setTasklist([])
      setChecklist([])
    }
  }, [currentUser, defaultGroup, tasks])

  const showTaskEditor = () => {
    if (defaultGroup !== 'Checklist') return tasklist
    if (checklist.length === 0) return false
    return true
  }

  const filterTasks = (tasklist) => {
    if (defaultGroup !== 'Checklist') return tasklist
    const filteredTasklist = []
    const taskMap = {}
    for (const task of tasklist) {
      taskMap[task.taskId] = task
    }
    for (const taskId of checklist) {
      if (taskMap[taskId]) {
        filteredTasklist.push(taskMap[taskId])
      }
    }
    return filteredTasklist
  }

  const filterAndIndexMapTasks = (tasklist) => {
    const filteredTasklist = []
    const taskMap = {}
    for (const task of tasklist) {
      taskMap[task.taskId] = task
    }
    for (let i = 0; i < checklist.length; i++) {
      if (taskMap[checklist[i]]) {
        filteredTasklist.push([taskMap[checklist[i]], i])
      }
    }
    return filteredTasklist
  }

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (defaultGroup !== 'Checklist') {
      const newTasklist = Array.from(tasklist)
      const [removed] = newTasklist.splice(source.index, 1)
      newTasklist.splice(destination.index, 0, removed)
      setTasklist(newTasklist)
      if (defaultGroup === 'Inbox') {
        console.log('Inbox task reordering code reached...') // DEBUGGING
        const inboxTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
          currentUser && currentUser.id,
          '',
          'NOSECTION',
        )

        if (source.index > destination.index) {
          inboxTaskDocs.forEach(async (taskDoc) => {
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
          inboxTaskDocs.forEach(async (taskDoc) => {
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
      }
      // UPDATE TASK INDEX HERE (COMPLETED)
    } else {
      const filteredTasklist = filterAndIndexMapTasks(tasklist)
      const mappedSourceIndex = filteredTasklist[source.index][1]
      const mappedDestinationIndex = filteredTasklist[destination.index][1]
      const newChecklist = Array.from(checklist)
      const [removed] = newChecklist.splice(mappedSourceIndex, 1)
      newChecklist.splice(mappedDestinationIndex, 0, removed)
      setChecklist(newChecklist)
      await updateUserInfo(currentUser.id, { checklist: newChecklist })
    }
  }

  return (
    <div className='task-list__wrapper'>
      <ViewHeader />
      <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
        <Droppable droppableId='list'>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {showTaskEditor() &&
                filterTasks(tasklist).map((task, index) => (
                  <>
                    {taskEditorToShow !== task.taskId && (
                      <Task
                        name={task.name}
                        key={task.taskId}
                        task={task}
                        index={index}
                        projects={projects}
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
      </DragDropContext>
      <TaskEditor />
      {tasks.length ? null : <EmptyState />}
    </div>
  )
}
