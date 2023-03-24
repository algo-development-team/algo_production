import { AutoSchedule } from '../../scheduler/schedule-v3'
import { useCalendarsEventsValue } from '../../context'
import { getAllUserTasks } from "handleUserTasks"
import { useAuth } from 'hooks'
import { query, collection, orderBy, getDocs } from 'firebase/firestore'
import { db } from '_firebase'
import moment from 'moment'

function getAvailableTimes(startTime, endTime, blockedTimes) {
  const start = moment(startTime);
  const end = moment(endTime);
  const availableTimes = [];
   let a = 0;
  function checkstart(a) {
  if (startTime > blockedTimes[a].start && startTime < blockedTimes[a].end && a > (blockedTimes.length - 1)) {
    availableTimes.push({start: `${startTime}`,end:`${blockedTimes[0].start}`});
  } else if (a > (blockedTimes.length - 1) && startTime > blockedTimes[a].end) {
    a++;
    console.log(a);
    checkstart(a);
  }
  return a 
}
  // if the if statement isn't true, nothing needs to be done since a block fills the starting part of the schedule
  let i = checkstart(a + 1);
  const blockedTimesLength = blockedTimes.length;
  while(i < (blockedTimesLength)) {
    availableTimes.push({start: `${blockedTimes[i - 1].end}`,end:`${blockedTimes[i].start}`})
    i++;
  }
  function checkend(a) {
    if (endTime < blockedTimes[a].end && a >= 0) {
      availableTimes.push({start: `${blockedTimes[a].end}`, end: `${endTime}`});
    } else if (endTime < blockedTimes[a].end && a >= 1) {
      console.log(endTime);
      console.log(blockedTimes[a].end)
      a--;
      checkend(a);
    } 
    return a 
  }
 checkend(blockedTimes.length - 1)


 return availableTimes
}

export const getUserTaskList = async (userId) => {
  const taskQuery = await query(
    collection(db, 'user', `${userId}/tasks`),
    orderBy('index', 'asc'),
  )
  const taskDocs = await getDocs(taskQuery)
  const nonCompletedTasks = []
  const completedTasks = []
  taskDocs.forEach((taskDoc) => {
    const task = taskDoc.data()
    if (!task.completed) {
      nonCompletedTasks.push(task)
    } else {
      completedTasks.push(task)
    }
  })
  const taskslist = []
  for(let i = 0; i < nonCompletedTasks.length; i++) {
    if(nonCompletedTasks[i].priority === 1){
    taskslist.push(`${nonCompletedTasks[i].name}:${nonCompletedTasks[i].timeLength}`)
    }
     }
  for(let i = 0; i < nonCompletedTasks.length; i++) {
      if(nonCompletedTasks[i].priority === 2){
      taskslist.push(`${nonCompletedTasks[i].name}:${nonCompletedTasks[i].timeLength}`)
      }
       }
  for(let i = 0; i < nonCompletedTasks.length; i++) {
        if(nonCompletedTasks[i].priority === 3){
        taskslist.push(`${nonCompletedTasks[i].name}:${nonCompletedTasks[i].timeLength}`)
        }
         }
  // console.log(taskslist)
}

const parse = (taskString) => {
  const tasks = taskString.split(",");
  return tasks
}
export const AutoScheduleButton = () => {
  const { currentUser} = useAuth()
  const getUserTasks = getAllUserTasks(currentUser.id)
  const { calendarsEvents, setCalendarsEvents } = useCalendarsEventsValue()
  const userTaskList = getUserTaskList(currentUser.id)
  const handleClick = () => {
    const string =  "M:work on task:2AM-3AM,T:go for walk:3PM-6PM"
    const parsed = parse(string)
    AutoSchedule(calendarsEvents);
    getUserTaskList(currentUser.id)
    // console.log(parsed)
    const blockedTimesArray = [];
    for(let i = 0; i < calendarsEvents.custom.length; i++) {
      const start1 = calendarsEvents.custom[i].start
      const end1 = calendarsEvents.custom[i].end
      const start = moment(start1).format('ddd MMM DD YYYY HH:mm:ss')
      const end = moment(end1).format('ddd MMM DD YYYY HH:mm:ss')
    blockedTimesArray.push({start: `${start}`, end:`${end}`})
    }
    function sortEventsByStartDate(events) {
      const sortedEvents = events.sort((a, b) => new Date(a.start) - new Date(b.start));
    
      return sortedEvents.map((event, index) => ({
        ...event,
        index,
      }));
    }
    const sortedTimes = sortEventsByStartDate(blockedTimesArray)
    console.log(sortedTimes)
    const availabletimes = getAvailableTimes(`Mon Mar 20 2023 12:30:00`, `Mon Mar 25 2023 12:30:00`, sortedTimes)
    console.log(availabletimes)
  }

  return (
    <div>
      <button 
      onClick={handleClick}
      >
        Auto Schedule
      </button>
    </div>
  )
}
