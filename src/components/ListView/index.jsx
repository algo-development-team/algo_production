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
import { useAuth, useReloadChecklist } from 'hooks'

export const TaskList = () => {
  const { projectId, defaultGroup } = useParams()

  const { tasks } = useTasks(defaultGroup || projectId)
  // const { tasks } = useTasks(selectedProject.selectedProjectId ? selectedProject.selectedProjectId : selectedProject.selectedProjectName);
  const { projects } = useProjects()
  const { taskEditorToShow } = useTaskEditorContextValue()
  const { currentUser } = useAuth()
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

    if (currentUser && defaultGroup === 'Checklist' && tasks.length > 0) {
      getChecklist(currentUser.id).catch(console.error)
    }
  }, [currentUser, defaultGroup, tasks])

  const showTaskEditor = () => {
    if (defaultGroup !== 'Checklist') return tasks
    if (checklist.length === 0) return false
    return true
  }

  const filterTasks = (tasks) => {
    if (defaultGroup !== 'Checklist') return tasks
    const filteredTasks = []
    const taskMap = {}
    for (const task of tasks) {
      taskMap[task.taskId] = task
    }
    for (const taskId of checklist) {
      if (taskMap[taskId]) {
        filteredTasks.push(taskMap[taskId])
      }
    }
    return filteredTasks
  }

  return (
    <div className='task-list__wrapper'>
      <ViewHeader />
      {showTaskEditor() &&
        filterTasks(tasks).map((task) => {
          return (
            <React.Fragment key={task.taskId}>
              {taskEditorToShow != task.taskId && (
                <Task
                  name={task.name}
                  key={task.taskId}
                  task={task}
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
            </React.Fragment>
          )
        })}

      <TaskEditor projects={projects} />
      {tasks.length ? null : <EmptyState />}
    </div>
  )
}
