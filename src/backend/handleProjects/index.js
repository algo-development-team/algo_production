import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  deleteDoc,
  addDoc,
} from 'firebase/firestore'
import { db } from '_firebase'
import { getTaskDocsInProjectColumnNotCompleted } from '../handleTasks'
import { getUserTeams } from '../handleTeams'

export const getProject = async (projectId) => {
  // Reference to the document
  const docRef = db.collection('project').doc(projectId)

  // Fetch the document
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        // Document data is available
        return doc.data()
      } else {
        // Document is not found
        return null
      }
    })
    .catch(function (error) {
      console.log(error)
      return null
    })
}

export const getAllUserProjects = async (userId) => {
  // const projectQuery = await query(collection(db, 'user', `${userId}/projects`))
  // const projectDocs = await getDocs(projectQuery)
  // const projects = []
  // projectDocs.forEach((projectDoc) => {
  //   projects.push(projectDoc.data())
  // })
  // return projects
  const userTeams = getUserTeams(userId)
  let userProjectIds = []
  for (const userTeam of userTeams) {
    userProjectIds = userProjectIds.concat(userTeam.projects)
  }
  const allUserProjects = []
  for (const projectId of userProjectIds) {
    allUserProjects.push(getProject(projectId))
  }
  return allUserProjects
}

export const updateProjectColumns = async (
  userId,
  selectedProjectId,
  newSelectedProjectColumns,
) => {
  try {
    const projectQuery = await query(
      collection(db, 'projects'),
      where('projectId', '==', selectedProjectId),
    )
    const projectDocs = await getDocs(projectQuery)
    projectDocs.forEach(async (projectDoc) => {
      await updateDoc(projectDoc.ref, {
        columns: newSelectedProjectColumns,
      })
    })
  } catch (error) {
    console.log(error)
  }
}

/* CONVERTED */
export const projectDelete = async (projectId) => {
  try {
    const q = await query(
      collection(db, 'projects'),
      where('projectId', '==', projectId),
    )
    const docs = await getDocs(q)
    docs.forEach(async (projectDoc) => {
      await deleteDoc(projectDoc.ref)
    })
  } catch (error) {
    console.log(error)
  }
}

export const updatedProject = async (
  userId,
  projectId,
  projectName,
  projectColour,
  projectIsList,
  projectIsWork,
) => {
  try {
    const projectQuery = await query(
      collection(db, 'projects'),
      where('projectId', '==', projectId),
    )
    const projectDocs = await getDocs(projectQuery)
    projectDocs.forEach(async (projectDoc) => {
      await updateDoc(projectDoc.ref, {
        name: projectName,
        projectColour: projectColour,
        projectIsList: projectIsList,
        projectIsWork: projectIsWork,
      })
    })
  } catch (error) {
    console.log(error)
  }
}

const getNewColumns = (columnOrder, columns) => {
  const newColumns = []
  for (const columnId of columnOrder) {
    if (columnId === 'NOSECTION') {
      newColumns.push({ id: 'NOSECTION', title: '(No Section)' })
    } else {
      const column = columns.find((column) => column.id === columnId)
      newColumns.push(column)
    }
  }
  return newColumns
}

export const dragEnd = async (userId, selectedProjectId, newColumnOrder) => {
  try {
    const projectQuery = await query(
      collection(db, 'projects'),
      where('projectId', '==', selectedProjectId),
    )
    const projectDocs = await getDocs(projectQuery)
    projectDocs.forEach(async (projectDoc) => {
      const newColumns = getNewColumns(
        newColumnOrder,
        projectDoc.data().columns,
      )
      await updateDoc(projectDoc.ref, {
        columns: newColumns,
      })
    })
  } catch (error) {
    console.log(error)
  }
}

export const getTaskDocInColumnNotCompleted = async (
  userId,
  selectedProjectId,
  droppableId,
  sourceIndex,
  destinationIndex,
) => {
  const columnTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
    selectedProjectId,
    droppableId,
  )

  try {
    if (sourceIndex > destinationIndex) {
      columnTaskDocs.forEach(async (taskDoc) => {
        if (taskDoc.data().index === sourceIndex) {
          await updateDoc(taskDoc.ref, {
            index: destinationIndex,
          })
        } else if (
          taskDoc.data().index >= destinationIndex &&
          taskDoc.data().index < sourceIndex
        ) {
          await updateDoc(taskDoc.ref, {
            index: taskDoc.data().index + 1,
          })
        }
      })
    } else {
      columnTaskDocs.forEach(async (taskDoc) => {
        if (taskDoc.data().index === sourceIndex) {
          await updateDoc(taskDoc.ref, {
            index: destinationIndex,
          })
        } else if (
          taskDoc.data().index > sourceIndex &&
          taskDoc.data().index <= destinationIndex
        ) {
          await updateDoc(taskDoc.ref, {
            index: taskDoc.data().index - 1,
          })
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
}

export const dragEnds = async (
  defaultGroup,
  userId,
  sourceIndex,
  destinationIndex,
) => {
  try {
    if (defaultGroup === 'Inbox') {
      const inboxTaskDocs = await getTaskDocsInProjectColumnNotCompleted(
        '',
        'NOSECTION',
      )

      if (sourceIndex > destinationIndex) {
        inboxTaskDocs.forEach(async (taskDoc) => {
          if (taskDoc.data().index === sourceIndex) {
            await updateDoc(taskDoc.ref, {
              index: destinationIndex,
            })
          } else if (
            taskDoc.data().index >= destinationIndex &&
            taskDoc.data().index < sourceIndex
          ) {
            await updateDoc(taskDoc.ref, {
              index: taskDoc.data().index + 1,
            })
          }
        })
      } else {
        inboxTaskDocs.forEach(async (taskDoc) => {
          if (taskDoc.data().index === sourceIndex) {
            await updateDoc(taskDoc.ref, {
              index: destinationIndex,
            })
          } else if (
            taskDoc.data().index > sourceIndex &&
            taskDoc.data().index <= destinationIndex
          ) {
            await updateDoc(taskDoc.ref, {
              index: taskDoc.data().index - 1,
            })
          }
        })
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const addProject = async (userId, newProject) => {
  await addDoc(collection(db, 'project'), newProject)
}
