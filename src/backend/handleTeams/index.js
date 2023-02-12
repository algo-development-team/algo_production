import {
  setDoc,
  addDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { db } from '_firebase'
import { getUserInfo, updateUserInfo } from '../handleUserInfo'

/* CONVERTED */
export const createDefaultTeamDoc = async (userId) => {
  const userRef = doc(db, 'team', userId)
  return userRef
}

/* CONVERTED */
export const getDefaultTeam = (userId, userName) => {
  const defaultTeam = {
    teamId: userId,
    name: userName,
    description: `Default team for ${userName}`,
    projects: [userId],
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
        where('teamId', '==', teamId),
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

export const addTeam = async (userId, newTeam) => {
  await addDoc(collection(db, 'team'), newTeam)
  const userInfo = await getUserInfo(userId)
  console.log('newTeam.teamId: ', newTeam.teamId) // DEBUGGING
  const newTeams = [...userInfo.teams, newTeam.teamId]
  await updateUserInfo(userId, { teams: newTeams })
}

export const updateTeam = async (teamId, teamName, teamDescription) => {
  try {
    const teamQuery = await query(
      collection(db, 'team'),
      where('teamId', '==', teamId),
    )
    const teamDocs = await getDocs(teamQuery)
    teamDocs.forEach(async (teamDoc) => {
      await updateDoc(teamDoc.ref, {
        name: teamName,
        description: teamDescription,
      })
    })
  } catch (error) {
    console.log(error)
  }
}
