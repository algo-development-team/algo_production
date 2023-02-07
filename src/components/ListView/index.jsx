import { TaskEditor } from 'components/TaskEditor'
import { ViewHeader } from 'components/ViewHeader'
import { useTaskEditorContextValue } from 'context'
import { useAuth, useChecklist, useProjects, useTasks } from 'hooks'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from './empty-state'
import './styles/light.scss'
import './styles/listview.scss'
import { Task } from './task'
import { DragDropContext } from 'react-beautiful-dnd'
import { Droppable } from 'react-beautiful-dnd'
import { updateUserInfo } from '../../backend/handleUserInfo'
import moment from 'moment/moment'
import { dragEnds } from '../../backend/handleUserProjects'


// UPDATE SORT THE LIST TASKS BY THEIR INDEX (COMPLETED)

export const TaskList = () => {
  const { projectId, defaultGroup } = useParams()
  const selectedProject = projectId || defaultGroup

  const { tasks } = useTasks()
  const { projects } = useProjects()
  const { taskEditorToShow } = useTaskEditorContextValue()
  const { currentUser } = useAuth()
  const { checklist } = useChecklist()
  const [tasklist, setTasklist] = useState([])

  const sortTaskByDate = (tasks) => {
    const scheduledTasks = tasks.filter(
      (task) => task.startDate !== '' || task.date !== '',
    )
    const formattedScheduledTasks = scheduledTasks.map((task) => {
      return {
        ...task,
        formattedStartDate:
          task.startDate !== ''
            ? moment(task.startDate, 'DD-MM-YYYY')
            : moment(8.64e15),
        formattedEndDate:
          task.date !== '' ? moment(task.date, 'DD-MM-YYYY') : moment(8.64e15),
      }
    })
    // do outer sorting by startDate in ascending order, then inner sorting by date in ascending order
    const sortedScheduledTasks = formattedScheduledTasks.sort((a, b) => {
      if (a.formattedStartDate.isBefore(b.formattedStartDate)) {
        return -1
      } else if (a.formattedStartDate.isAfter(b.formattedStartDate)) {
        return 1
      } else {
        if (a.formattedEndDate.isBefore(b.formattedEndDate)) {
          return -1
        } else if (a.formattedEndDate.isAfter(b.formattedEndDate)) {
          return 1
        } else {
          return 0
        }
      }
    })
    const sortedTasks = sortedScheduledTasks.map(
      ({ formattedStartDate, formattedEndDate, ...rest }) => {
        return rest
      },
    )
    return sortedTasks
  }

  const sortTasksByColumnOrder = (tasks) => {
    if (selectedProject === 'Scheduled') {
      return sortTaskByDate(tasks)
    } else if (selectedProject === 'Checklist' || selectedProject === 'Inbox') {
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
    if (tasks.length > 0) {
      const sortedTasks = sortTasksByColumnOrder(tasks)
      setTasklist(sortedTasks)
    } else {
      setTasklist([])
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
      // drag ends
      await dragEnds(defaultGroup, currentUser && currentUser.id, source.index, destination.index)


      // UPDATE TASK INDEX HERE (COMPLETED)
    }
    else {
      const filteredTasklist = filterAndIndexMapTasks(tasklist)
      const mappedSourceIndex = filteredTasklist[source.index][1]
      const mappedDestinationIndex = filteredTasklist[destination.index][1]
      const newChecklist = Array.from(checklist)
      const [removed] = newChecklist.splice(mappedSourceIndex, 1)
      newChecklist.splice(mappedDestinationIndex, 0, removed)
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
