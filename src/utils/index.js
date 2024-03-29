import { collatedTasks } from '../constants'
export const collatedTasksExist = (selectedProject) =>
  collatedTasks.find((task) => task.key === selectedProject)
export const getCollatedTitle = (projects, key) =>
  projects.find((project) => project.key === key)
export const getTitle = (projects, projectId) =>
  projects.find((project) => project.projectId === projectId)
export const getProjectTitle = (projects, projectId) => {
  let project = projects.find((project) => project.projectId === projectId)
  return project?.name
}
export const getProjectInfo = (projects, projectId) => {
  return projects.find((project) => project.projectId === projectId)
}
export const generatePushId = () => {
  return Math.random().toString(36).substring(2, 15)
}
export const generateEventId = () => {
  let chars = 'abcdefghijklmnopqrstuv0123456789'
  let eventId = ''
  for (let i = 0; i < 26; i++) {
    eventId += chars[Math.floor(Math.random() * chars.length)]
  }
  return eventId
}
export const getProjectId = (projects, projectName) =>
  projects.find((project) => project.name === projectName)
export const getProjectHex = (projects, projectId) =>
  projects.find((project) => project.projectId === projectId)
