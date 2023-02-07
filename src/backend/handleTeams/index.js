import {
  setDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from '_firebase'
import { getUserInfo } from '../handleUserInfo'

/* CONVERTED */
export const createDefaultTeamDoc = async (userId) => {
  const userRef = doc(db, 'team', userId)
  return userRef
}

/* CONVERTED */
export const getDefaultTeam = (userId) => {
  const defaultTeam = {
    teamId: userId,
    projects: [],
  }
  return defaultTeam
}

/* CONVERTED */
export const initializeDefaultTeam = async (teamRef, newTeam) => {
  setDoc(teamRef, newTeam)
  .finally(() => console.log('team initialized'))
  .catch((error) => console.log(error))
}

/* CONVERTED */
export const getUserTeams = async (userId) => {
  try {
    const userInfo = await getUserInfo(userId)
    if (!userInfo) return null

    const teamIds = [userInfo.userId, ...userInfo.teams]

    const teams = []
    for (const teamId of teamIds) {
      const teamQuery = await query(
        collection(db, 'team'),
        where("teamId", "==", teamId),
      )
      const teamDocs = await getDocs(teamQuery)
      const teamList = []
      teamDocs.forEach((teamDoc) => {
        teamList.push(teamDoc.data())
      })
      teams.push(teamList[0])
    }

    return teams
  } catch (error) {
    console.log(error)
    return null
  }
}