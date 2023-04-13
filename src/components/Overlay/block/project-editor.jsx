import { useProjects } from 'hooks'

export const ProjectEditor = ({ projectId, setProjectId }) => {
  const { projects } = useProjects()

  const sortProjectsByName = (projects) => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
      {sortProjectsByName(projects).map((project) => {
        return (
          <option key={project.projectId} value={project.projectId}>
            {project.name}
          </option>
        )
      })}
    </select>
  )
}
