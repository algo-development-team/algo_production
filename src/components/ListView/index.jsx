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

export const TaskList = () => {
  const { projectId, defaultGroup } = useParams()

  const { tasks } = useTasks(defaultGroup || projectId)
  // const { tasks } = useTasks(selectedProject.selectedProjectId ? selectedProject.selectedProjectId : selectedProject.selectedProjectName);
  const { projects } = useProjects()
  const { taskEditorToShow } = useTaskEditorContextValue()
  const { currentUser } = useAuth()
  const [tasklist, setTasklist] = useState([])
  const [checklist, setChecklist] = useState([])

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
      setTasklist(tasks)
      if (currentUser && defaultGroup === 'Checklist') {
        getChecklist(currentUser.id).catch(console.error)
      }
    } else {
      setTasklist([])
      setChecklist([])
    }
  }, [currentUser, defaultGroup, projectId, tasks])

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

  const moveTask = (dragIndex, hoverIndex, isChecklist) => {
    const newlist = isChecklist ? [...checklist] : [...tasklist]
    console.log('newlist before change:', newlist) // DEBUGGING
    const draggedItem = newlist[dragIndex]
    newlist.splice(dragIndex, 1)
    newlist.splice(hoverIndex, 0, draggedItem)
    console.log('newlist after change:', newlist) // DEBUGGING')
    if (isChecklist) {
      setChecklist(newlist)
    } else {
      setTasklist(newlist)
    }
  }

  const handleChangeChecklist = () => {
    const isChecklist = defaultGroup === 'Checklist'
    moveTask(0, 1, isChecklist)
  }

  return (
    <div className='task-list__wrapper'>
      <ViewHeader />
      {showTaskEditor() &&
        filterTasks(tasklist).map((task, i) => {
          return (
            <React.Fragment key={task.taskId}>
              {taskEditorToShow !== task.taskId && (
                <Task
                  name={task.name}
                  key={task.taskId}
                  task={task}
                  index={i}
                  projects={projects}
                />
              )}
              {taskEditorToShow === task.taskId && (
                <TaskEditor
                  taskId={task.taskId}
                  task={task}
                  index={i}
                  projects={projects}
                  isEdit
                />
              )}
            </React.Fragment>
          )
        })}
      <TaskEditor projects={projects} />
      <button onClick={() => handleChangeChecklist()}>change</button>
      {tasks.length ? null : <EmptyState />}
    </div>
  )
}
