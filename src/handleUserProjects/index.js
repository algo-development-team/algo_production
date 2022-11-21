import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '_firebase'

export const getAllUserProjects = async (userId) => {
  const projectQuery = await query(collection(db, 'user', `${userId}/projects`))
  const projectDocs = await getDocs(projectQuery)
  const projects = []
  projectDocs.forEach((projectDoc) => {
    projects.push(projectDoc.data())
  })
  return projects
}
