import {
    collection,
    updateDoc,
    query,
    Timestamp,
    getDocs,
  } from 'firebase/firestore'
import { db } from '_firebase'

/*
* Tasks: 
* Create, Update, Delete tasks (Name, Date, Project Name, Action {"CREATE", "UPDATE", "DELETE"}) 
*/
export const inputTaskAction = async (name, action) => {
    try {
        const q = await query(
          collection(db, 'analytics'),
        )
        const docs = await getDocs(q)
        const currentTimestamp = Timestamp.fromDate(new Date())
        docs.forEach(async (doc) => {
          const data = doc.data()
          const newTasks = Array.from(data.tasks)
          newTasks.push({
            name: name,
            date: currentTimestamp,
            action: action
          })

          await updateDoc(doc.ref, {
            tasks: newTasks
          })
        })
      } catch (error) {
        console.log(error)
      }
}

/*
* Projects: 
* Create, Update, Delete tasks (Name, Date, Project Name, Action {"CREATE", "UPDATE", "DELETE"}) 
*/
export const inputProjectAction = async (name, action) => {
    try {
        const q = await query(
          collection(db, 'analytics'),
        )
        const docs = await getDocs(q)
        const currentTimestamp = Timestamp.fromDate(new Date())
        docs.forEach(async (doc) => {
          const data = doc.data()
          const newProjects = Array.from(data.projects)
          newProjects.push({
            name: name,
            date: currentTimestamp,
            action: action
          })

          await updateDoc(doc.ref, {
            projects: newProjects
          })
        })
      } catch (error) {
        console.log(error)
      }
}