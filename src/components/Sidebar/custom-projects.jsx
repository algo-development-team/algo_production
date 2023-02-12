import { useProjects, useTeams } from 'hooks'
import { useState } from 'react'
import { CustomProject } from './custom-project'
import { AddCustomProject } from './add-custom-project'
import { AddCustomTeam } from './add-custom-team'
import { CustomTeam } from './custom-team'
import { useEffect } from 'react'

export const CustomProjects = () => {
  const { projects } = useProjects()
  const { teams } = useTeams()
  const [showTeams, setShowTeams] = useState(true)
  const [showProjects, setShowProjects] = useState(true)

  useEffect(() => {
    console.log('projects', projects) // DEBUGGING
  }, [projects])

  useEffect(() => {
    console.log('teams', teams) // DEBUGGING
  }, [teams])

  /* purpose: sorts project names at sidebar alphabetically */
  const sortByName = (projects) => {
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
      {showTeams && (
        <div
          className='custom-projects'
          style={{ height: `${showTeams ? '100%' : '0%'}` }}
        >
          {sortByName(teams).map((team) => (
            <CustomTeam key={team.teamId} team={team} />
          ))}
          <div className='add-project__container'></div>
        </div>
      )}
      <AddCustomProject
        showProjects={showProjects}
        setShowProjects={setShowProjects}
      />
      {showProjects && (
        <div
          className='custom-projects'
          style={{ height: `${showProjects ? '100%' : '0%'}` }}
        >
          {sortByName(projects).map((project) => (
            <CustomProject key={project.projectId} project={project} />
          ))}
          <div className='add-project__container'></div>
        </div>
      )}
    </div>
  )
}
