import { useProjects } from 'hooks'

export const ProjectEditor = ({ projectId, setProjectId }) => {
  const { projects } = useProjects()

  return (
    <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
      {projects.map((project) => {
        return (
          <option key={project.projectId} value={project.projectId}>
            {project.name}
          </option>
        )
      })}
    </select>
  )
}
