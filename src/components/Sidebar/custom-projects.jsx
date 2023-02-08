import { useProjects } from 'hooks'
import { useState } from 'react'
import { CustomProject } from './custom-project'
import { AddCustomProject } from './add-custom-project'
import { AddCustomTeam } from './add-custom-team'

export const CustomProjects = () => {
  const { projects } = useProjects()
  const [showTeams, setShowTeams] = useState(true)
  const [showProjects, setShowProjects] = useState(true)

  /* purpose: sorts project names at sidebar alphabetically */
  const sortProjectsByName = (projects) => {
    return projects.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1
      }
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1
      }
      return 0
    })
  }

  return (
    <div className='custom-project-group__wrapper'>
      <AddCustomTeam showTeams={showTeams} setShowTeams={setShowTeams} />
      <AddCustomProject
        showProjects={showProjects}
        setShowProjects={setShowProjects}
      />
      {showProjects && (
        <div
          className='custom-projects'
          style={{ height: `${showProjects ? '100%' : '0%'}` }}
        >
          {sortProjectsByName(projects).map((project) => (
            <CustomProject key={project.projectId} project={project} />
          ))}
          <div className='add-project__container'></div>
        </div>
      )}
    </div>
  )
}
