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

/*
* Icons: 
* Checklist, Calendar, Inbox, Schedule, Google Calendar, Setting icons (Name, Date, Project Name, Action {"CREATE", "UPDATE", "DELETE"}) 
*/
export const inputIconSelection = async (name, action) => {
  try {
      const q = await query(
        collection(db, 'analytics'),
      )
      const docs = await getDocs(q)
      const currentTimestamp = Timestamp.fromDate(new Date())
      docs.forEach(async (doc) => {
        const data = doc.data()
        const newIcons = Array.from(data.icons)
        newIcons.push({
          name: name,
          date: currentTimestamp,
          action: action
        })

        await updateDoc(doc.ref, {
          icons: newIcons
        })
      })
    } catch (error) {
      console.log(error)
    }
}

/*
* Expand Tasks: 
* Add to Checklist, Remove from Checklist, Do Now Calendar tasks (Name, Date, Project Name, Action {"CREATE", "UPDATE", "DELETE"}) 
*/
export const inputExpandTasks = async (name, action) => {
  try {
      const q = await query(
        collection(db, 'analytics'),
      )
      const docs = await getDocs(q)
      const currentTimestamp = Timestamp.fromDate(new Date())
      docs.forEach(async (doc) => {
        const data = doc.data()
        const newExapndTasks = Array.from(data.expandTasks)
        newExapndTasks.push({
          name: name,
          date: currentTimestamp,
          action: action
        })

        await updateDoc(doc.ref, {
          expandTasks: newExapndTasks
        })
      })
    } catch (error) {
      console.log(error)
    }
}


/*
* Sign-in: 
* Add to SignIn, SignOut, Google OAUTH
*/
export const inputSignIn= async (name, action) => {
  try {
      const q = await query(
        collection(db, 'analytics'),
      )
      const docs = await getDocs(q)
      const currentTimestamp = Timestamp.fromDate(new Date())
      docs.forEach(async (doc) => {
        const data = doc.data()
        const newSignIn = Array.from(data.signIn)
        newSignIn.push({
          name: name,
          date: currentTimestamp,
          action: action
        })

        await updateDoc(doc.ref, {
          signIn: newSignIn
        })
      })
    } catch (error) {
      console.log(error)
    }
}
